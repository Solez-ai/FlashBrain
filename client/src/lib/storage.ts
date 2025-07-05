import { get, set, del, keys } from 'idb-keyval';
import { Category, Folder, Flashcard } from '@shared/schema';

// Storage keys
const CATEGORIES_KEY = 'flashbrain:categories';
const FOLDERS_PREFIX = 'flashbrain:folders:';
const FLASHCARDS_PREFIX = 'flashbrain:flashcards:';

// Utility functions for IndexedDB storage
export async function saveCategories(categories: Category[]): Promise<void> {
  await set(CATEGORIES_KEY, categories);
}

export async function loadCategories(): Promise<Category[]> {
  const categories = await get(CATEGORIES_KEY);
  return categories || [];
}

export async function saveFolders(categoryId: number, folders: Folder[]): Promise<void> {
  await set(`${FOLDERS_PREFIX}${categoryId}`, folders);
}

export async function loadFolders(categoryId: number): Promise<Folder[]> {
  const folders = await get(`${FOLDERS_PREFIX}${categoryId}`);
  return folders || [];
}

export async function saveFlashcards(folderId: number, flashcards: Flashcard[]): Promise<void> {
  await set(`${FLASHCARDS_PREFIX}${folderId}`, flashcards);
}

export async function loadFlashcards(folderId: number): Promise<Flashcard[]> {
  const flashcards = await get(`${FLASHCARDS_PREFIX}${folderId}`);
  return flashcards || [];
}

// Helper function to generate unique IDs
export function generateId(): number {
  return Date.now() + Math.random();
}

// Clear all data (for testing)
export async function clearAllData(): Promise<void> {
  const allKeys = await keys();
  const flashbrainKeys = allKeys.filter(key => 
    typeof key === 'string' && key.startsWith('flashbrain:')
  );
  
  await Promise.all(flashbrainKeys.map(key => del(key)));
}