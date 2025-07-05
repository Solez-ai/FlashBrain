import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertFolderSchema, insertFlashcardSchema, insertStudySessionSchema } from "@shared/schema";
import { z } from "zod";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Folders
  app.get("/api/folders/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const folders = await storage.getFoldersByCategory(categoryId);
      res.json(folders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const validatedData = insertFolderSchema.parse(req.body);
      const folder = await storage.createFolder(validatedData);
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create folder" });
      }
    }
  });

  app.delete("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFolder(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // Flashcards
  app.get("/api/flashcards/folder/:folderId", async (req, res) => {
    try {
      const folderId = parseInt(req.params.folderId);
      const flashcards = await storage.getFlashcardsByFolder(folderId);
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  app.post("/api/flashcards", async (req, res) => {
    try {
      const validatedData = insertFlashcardSchema.parse(req.body);
      const flashcard = await storage.createFlashcard(validatedData);
      res.status(201).json(flashcard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid flashcard data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create flashcard" });
      }
    }
  });

  app.put("/api/flashcards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFlashcardSchema.partial().parse(req.body);
      const flashcard = await storage.updateFlashcard(id, validatedData);
      res.json(flashcard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid flashcard data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update flashcard" });
      }
    }
  });

  app.delete("/api/flashcards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFlashcard(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete flashcard" });
    }
  });

  // AI Flashcard Generation
  app.post("/api/flashcards/generate", async (req, res) => {
    try {
      const { text, folderId, maxCards = 20 } = req.body;
      
      if (!text || !folderId) {
        return res.status(400).json({ message: "Text and folder ID are required" });
      }

      const prompt = `
        Analyze the following study material and generate concise flashcards.
        
        Each flashcard should have:
        - A question and an answer
        - Maximum 10 words per side
        - Focus on key concepts and facts
        
        Generate up to ${maxCards} flashcards.
        
        Return the response as a JSON array in this exact format:
        [
          {"question": "...", "answer": "..."},
          {"question": "...", "answer": "..."}
        ]
        
        Study material:
        ${text}
      `;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content received from AI");
      }

      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from AI response");
      }

      const flashcardData = JSON.parse(jsonMatch[0]);
      
      // Create flashcards in the database
      const createdFlashcards = [];
      for (const card of flashcardData) {
        if (card.question && card.answer) {
          const flashcard = await storage.createFlashcard({
            question: card.question.substring(0, 200), // Ensure within limits
            answer: card.answer.substring(0, 200),
            folderId: parseInt(folderId),
            cardStyle: "white"
          });
          createdFlashcards.push(flashcard);
        }
      }

      res.json({ 
        message: `Generated ${createdFlashcards.length} flashcards`, 
        flashcards: createdFlashcards 
      });

    } catch (error) {
      console.error("AI generation error:", error);
      res.status(500).json({ message: "Failed to generate flashcards with AI" });
    }
  });

  // Study Sessions
  app.get("/api/study-sessions/folder/:folderId", async (req, res) => {
    try {
      const folderId = parseInt(req.params.folderId);
      const sessions = await storage.getStudySessionsByFolder(folderId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch study sessions" });
    }
  });

  app.post("/api/study-sessions", async (req, res) => {
    try {
      const validatedData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid study session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create study session" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
