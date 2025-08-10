import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// Helper function to clean translation text
function cleanTranslation(text) {
  if (!text) return '';
  
  // Remove text in parentheses (including the parentheses)
  let cleaned = text.replace(/\([^)]*\)/g, '');
  
  // Remove punctuation and symbols, convert to lowercase
  cleaned = cleaned.replace(/[^\w\s]/g, '').toLowerCase().trim();
  
  return cleaned;
}

// Helper function to check if two words are the same
function areWordsSame(word1, word2) {
  // If transliterations are exactly the same, they're guaranteed to be the same word
  if (word1.transliteration && word2.transliteration && 
      word1.transliteration.toLowerCase() === word2.transliteration.toLowerCase()) {
    return true;
  }
  
  // Check cleaned translations
  const cleanTrans1 = cleanTranslation(word1.translation);
  const cleanTrans2 = cleanTranslation(word2.translation);
  
  if (cleanTrans1 && cleanTrans2 && cleanTrans1 === cleanTrans2) {
    // Also check if root letters are the same (if both have roots)
    if (word1.root_latin && word2.root_latin && 
        word1.root_latin.toLowerCase() === word2.root_latin.toLowerCase()) {
      return true;
    }
  }
  
  return false;
}

// Helper function to group words by uniqueness
function groupUniqueWords(words) {
  const uniqueGroups = [];
  const processed = new Set();
  
  for (let i = 0; i < words.length; i++) {
    if (processed.has(i)) continue;
    
    const currentWord = words[i];
    const group = [currentWord];
    processed.add(i);
    
    // Find all other words that are the same as currentWord
    for (let j = i + 1; j < words.length; j++) {
      if (processed.has(j)) continue;
      
      if (areWordsSame(currentWord, words[j])) {
        group.push(words[j]);
        processed.add(j);
      }
    }
    
    // Create unique word entry
    const uniqueWord = {
      ...currentWord,
      occurrences: group.length,
      locations: group.map(w => w.location),
      // Add root info if available
      root: currentWord.root_latin && currentWord.root_arabic ? {
        root_latin: currentWord.root_latin,
        root_arabic: currentWord.root_arabic
      } : null,
      // Parse tags if they exist
      tags: currentWord.tags ? (typeof currentWord.tags === 'string' ? 
        JSON.parse(currentWord.tags) : currentWord.tags) : []
    };
    
    uniqueGroups.push(uniqueWord);
  }
  
  return uniqueGroups;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderBy = searchParams.get('orderBy') || 'location'; // Default to location
    
    console.log(`Fetching all unique words ordered by ${orderBy}...`);
    
    let words;
    if (orderBy === 'frequency') {
      // For frequency ordering, we need to get all words first, then sort after grouping
      words = await sql`
        SELECT 
          id,
          surah_number,
          verse,
          location,
          transliteration,
          translation,
          grammar,
          image_url,
          root_latin,
          root_arabic,
          tags
        FROM words 
        ORDER BY transliteration, translation
      `;
    } else {
      // Default to location ordering
      words = await sql`
        SELECT 
          id,
          surah_number,
          verse,
          location,
          transliteration,
          translation,
          grammar,
          image_url,
          root_latin,
          root_arabic,
          tags
        FROM words 
        ORDER BY CAST(SPLIT_PART(location, ':', 1) AS INTEGER), 
                 CAST(SPLIT_PART(location, ':', 2) AS INTEGER), 
                 CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
      `;
    }
    
    // Handle Vercel Postgres client structure
    const wordsArray = Array.isArray(words) ? words : words.rows || [];
    
    if (wordsArray.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No words found' 
      }, { status: 404 });
    }
    
    // Group into unique words
    let uniqueWords = groupUniqueWords(wordsArray);
    
    // Sort by frequency if requested
    if (orderBy === 'frequency') {
      uniqueWords.sort((a, b) => b.occurrences - a.occurrences);
    }
    
    console.log(`Found ${uniqueWords.length} unique words from ${wordsArray.length} total words (ordered by ${orderBy})`);
    
    return NextResponse.json({
      success: true,
      data: {
        unique_words: uniqueWords,
        total_unique: uniqueWords.length,
        total_words: wordsArray.length,
        order_by: orderBy
      }
    });
    
  } catch (error) {
    console.error('Error fetching unique words:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch unique words',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { surah_number, orderBy = 'location' } = body; // Default to location
    
    if (!surah_number) {
      return NextResponse.json({ 
        success: false, 
        error: 'surah_number is required' 
      }, { status: 400 });
    }
    
    console.log(`Fetching unique words for surah ${surah_number} ordered by ${orderBy}...`);
    
    let words;
    if (orderBy === 'frequency') {
      // For frequency ordering, we need to get all words first, then sort after grouping
      words = await sql`
        SELECT 
          id,
          surah_number,
          verse,
          location,
          transliteration,
          translation,
          grammar,
          image_url,
          root_latin,
          root_arabic,
          tags
        FROM words 
        WHERE surah_number = ${surah_number}
        ORDER BY transliteration, translation
      `;
    } else {
      // Default to location ordering
      words = await sql`
        SELECT 
          id,
          surah_number,
          verse,
          location,
          transliteration,
          translation,
          grammar,
          image_url,
          root_latin,
          root_arabic,
          tags
        FROM words 
        WHERE surah_number = ${surah_number}
        ORDER BY CAST(SPLIT_PART(location, ':', 2) AS INTEGER), 
                 CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
      `;
    }
    
    // Handle Vercel Postgres client structure
    const wordsArray = Array.isArray(words) ? words : words.rows || [];
    
    if (wordsArray.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `No words found for surah ${surah_number}` 
      }, { status: 404 });
    }
    
    // Group into unique words
    let uniqueWords = groupUniqueWords(wordsArray);
    
    // Sort by frequency if requested
    if (orderBy === 'frequency') {
      uniqueWords.sort((a, b) => b.occurrences - a.occurrences);
    }
    
    console.log(`Found ${uniqueWords.length} unique words in surah ${surah_number} from ${wordsArray.length} total words (ordered by ${orderBy})`);
    
    return NextResponse.json({
      success: true,
      data: {
        surah_number: parseInt(surah_number),
        unique_words: uniqueWords,
        total_unique: uniqueWords.length,
        total_words: wordsArray.length,
        order_by: orderBy
      }
    });
    
  } catch (error) {
    console.error('Error fetching unique words for surah:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch unique words for surah',
      details: error.message 
    }, { status: 500 });
  }
}
