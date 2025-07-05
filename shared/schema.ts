import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("hsl(207, 90%, 54%)"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  color: text("color").notNull().default("yellow"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  folderId: integer("folder_id").references(() => folders.id).notNull(),
  cardStyle: text("card_style").notNull().default("white"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  folderId: integer("folder_id").references(() => folders.id).notNull(),
  totalCards: integer("total_cards").notNull(),
  completedCards: integer("completed_cards").notNull(),
  duration: integer("duration").notNull(), // in seconds
  accuracy: integer("accuracy").notNull(), // percentage
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({
  id: true,
  createdAt: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
  createdAt: true,
});

export type Category = typeof categories.$inferSelect;
export type Folder = typeof folders.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
