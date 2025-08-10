import { sql } from '../lib/db.js';

// Helper function to clean translation text (same as in the API)
function cleanTranslation(text) {
  if (!text) return '';
  
  // Remove text in parentheses (including the parentheses)
  let cleaned = text.replace(/\([^)]*\)/g, '');
  
  // Remove punctuation and symbols, convert to lowercase
  cleaned = cleaned.replace(/[^\w\s]/g, '').toLowerCase().trim();
  
  return cleaned;
}

// Helper function to check if two words are the same (same as in the API)
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

async function testUniqueWordsLogic() {
  try {
    console.log('🧪 Testing unique words logic...\n');
    
    // Get a small sample of words to test
    const words = await sql`
      SELECT 
        id,
        surah_number,
        verse,
        location,
        transliteration,
        translation,
        root_latin,
        root_arabic
      FROM words 
      WHERE transliteration IS NOT NULL 
      AND translation IS NOT NULL
      ORDER BY transliteration, translation
      LIMIT 20
    `;
    
    const wordsArray = Array.isArray(words) ? words : words.rows || [];
    
    console.log(`Testing with ${wordsArray.length} sample words:\n`);
    
    // Show the sample words
    wordsArray.forEach((word, index) => {
      console.log(`${index + 1}. "${word.transliteration}" -> "${word.translation}" (${word.location})`);
    });
    
    console.log('\n🔍 Testing cleaning function:');
    
    // Test the cleaning function with some examples
    const testTranslations = [
      'In the name of (Allah)',
      'in the name of allah',
      'The Most Gracious',
      'the most gracious',
      'The Most Merciful.',
      'the most merciful'
    ];
    
    testTranslations.forEach(trans => {
      const cleaned = cleanTranslation(trans);
      console.log(`"${trans}" -> "${cleaned}"`);
    });
    
    console.log('\n🔍 Testing word comparison:');
    
    // Test word comparison logic
    for (let i = 0; i < wordsArray.length; i++) {
      for (let j = i + 1; j < wordsArray.length; j++) {
        const word1 = wordsArray[i];
        const word2 = wordsArray[j];
        
        if (areWordsSame(word1, word2)) {
          console.log(`✅ MATCH: "${word1.transliteration}" (${word1.location}) = "${word2.transliteration}" (${word2.location})`);
          console.log(`   Word1: "${word1.translation}"`);
          console.log(`   Word2: "${word2.translation}"`);
          console.log(`   Cleaned1: "${cleanTranslation(word1.translation)}"`);
          console.log(`   Cleaned2: "${cleanTranslation(word2.translation)}"`);
          console.log('');
        }
      }
    }
    
    console.log('✅ Unique words logic test completed!');
    
  } catch (error) {
    console.error('❌ Error testing unique words logic:', error.message);
  }
}

testUniqueWordsLogic();
