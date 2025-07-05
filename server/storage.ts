import { 
  categories, 
  folders, 
  flashcards, 
  studySessions,
  type Category, 
  type Folder, 
  type Flashcard, 
  type StudySession,
  type InsertCategory, 
  type InsertFolder, 
  type InsertFlashcard, 
  type InsertStudySession 
} from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Folders
  getFoldersByCategory(categoryId: number): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder>;
  deleteFolder(id: number): Promise<void>;
  
  // Flashcards
  getFlashcardsByFolder(folderId: number): Promise<Flashcard[]>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: number, flashcard: Partial<InsertFlashcard>): Promise<Flashcard>;
  deleteFlashcard(id: number): Promise<void>;
  
  // Study Sessions
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  getStudySessionsByFolder(folderId: number): Promise<StudySession[]>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category> = new Map();
  private folders: Map<number, Folder> = new Map();
  private flashcards: Map<number, Flashcard> = new Map();
  private studySessions: Map<number, StudySession> = new Map();
  
  private currentCategoryId = 1;
  private currentFolderId = 1;
  private currentFlashcardId = 1;
  private currentStudySessionId = 1;

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.currentCategoryId++,
      name: insertCategory.name,
      color: insertCategory.color || "hsl(207, 90%, 54%)",
      createdAt: new Date(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category> {
    const existing = this.categories.get(id);
    if (!existing) {
      throw new Error(`Category with id ${id} not found`);
    }
    const updated = { ...existing, ...updateData };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    // Delete all folders and flashcards in this category
    const categoryFolders = Array.from(this.folders.values()).filter(f => f.categoryId === id);
    for (const folder of categoryFolders) {
      await this.deleteFolder(folder.id);
    }
    this.categories.delete(id);
  }

  // Folders
  async getFoldersByCategory(categoryId: number): Promise<Folder[]> {
    return Array.from(this.folders.values()).filter(f => f.categoryId === categoryId);
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const folder: Folder = {
      id: this.currentFolderId++,
      name: insertFolder.name,
      categoryId: insertFolder.categoryId,
      color: insertFolder.color || "yellow",
      createdAt: new Date(),
    };
    this.folders.set(folder.id, folder);
    return folder;
  }

  async updateFolder(id: number, updateData: Partial<InsertFolder>): Promise<Folder> {
    const existing = this.folders.get(id);
    if (!existing) {
      throw new Error(`Folder with id ${id} not found`);
    }
    const updated = { ...existing, ...updateData };
    this.folders.set(id, updated);
    return updated;
  }

  async deleteFolder(id: number): Promise<void> {
    // Delete all flashcards in this folder
    const folderFlashcards = Array.from(this.flashcards.values()).filter(f => f.folderId === id);
    for (const flashcard of folderFlashcards) {
      this.flashcards.delete(flashcard.id);
    }
    this.folders.delete(id);
  }

  // Flashcards
  async getFlashcardsByFolder(folderId: number): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(f => f.folderId === folderId);
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const flashcard: Flashcard = {
      id: this.currentFlashcardId++,
      question: insertFlashcard.question,
      answer: insertFlashcard.answer,
      folderId: insertFlashcard.folderId,
      cardStyle: insertFlashcard.cardStyle || "white",
      createdAt: new Date(),
    };
    this.flashcards.set(flashcard.id, flashcard);
    return flashcard;
  }

  async updateFlashcard(id: number, updateData: Partial<InsertFlashcard>): Promise<Flashcard> {
    const existing = this.flashcards.get(id);
    if (!existing) {
      throw new Error(`Flashcard with id ${id} not found`);
    }
    const updated = { ...existing, ...updateData };
    this.flashcards.set(id, updated);
    return updated;
  }

  async deleteFlashcard(id: number): Promise<void> {
    this.flashcards.delete(id);
  }

  // Study Sessions
  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const session: StudySession = {
      id: this.currentStudySessionId++,
      ...insertSession,
      createdAt: new Date(),
    };
    this.studySessions.set(session.id, session);
    return session;
  }

  async getStudySessionsByFolder(folderId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(s => s.folderId === folderId);
  }
}

export const storage = new MemStorage();
