import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUniqueWords(words: any[]) {
  const seen = new Set()
  const uniqueWords = []
  
  for (const word of words) {
    // Create a key based on transliteration only (case-insensitive)
    const transliterationKey = (word.transliteration || '').toLowerCase().trim()
    
    // Skip words with empty transliteration to avoid duplicates
    if (transliterationKey === '') {
      continue
    }
    
    if (!seen.has(transliterationKey)) {
      seen.add(transliterationKey)
      uniqueWords.push(word)
    }
  }
  
  return uniqueWords
}
