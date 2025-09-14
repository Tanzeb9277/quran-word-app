# Quran Word App - API Endpoints Documentation

## Overview
This document provides a comprehensive list of all API endpoints in the Quran Word App, including their methods, parameters, and example responses.

## Base URL
All endpoints are prefixed with `/api/`

---

## 📖 Translation Endpoints

### 1. Get Verse Translation by Surah and Verse
**Endpoint:** `GET /api/translations/verse/[surah]/[verse]`

**Description:** Fetches verse translations for a specific surah and verse number.

**Parameters:**
- `surah` (path): Surah number (1-114)
- `verse` (path): Verse number (positive integer)
- `include_footnotes` (query, optional): Include footnotes in translation (`true`/`false`, default: `false`)
- `source` (query, optional): Filter by translation source

**Example Request:**
```
GET /api/translations/verse/2/255?include_footnotes=true&source=Yusuf Ali
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "verse_reference": "2:255",
    "surah_number": 2,
    "verse_number": 255,
    "translation": "Allah! There is no god but He, the Ever-Living, the Self-Sustaining.",
    "translation_with_footnotes": "Allah! There is no god but He, the Ever-Living, the Self-Sustaining.¹",
    "has_footnotes": true,
    "footnote_count": 1,
    "translation_source": "Yusuf Ali",
    "display_translation": "Allah! There is no god but He, the Ever-Living, the Self-Sustaining.¹"
  },
  "count": 1,
  "surah_number": 2,
  "verse_number": 255,
  "include_footnotes": true,
  "source_filter": "Yusuf Ali"
}
```

### 2. Get Verse Translation by Reference
**Endpoint:** `GET /api/translations/reference/[reference]`

**Description:** Fetches verse translations using the reference format "surah:verse".

**Parameters:**
- `reference` (path): Verse reference in format "surah:verse" (e.g., "2:255")
- `include_footnotes` (query, optional): Include footnotes in translation (`true`/`false`, default: `false`)
- `source` (query, optional): Filter by translation source

**Example Request:**
```
GET /api/translations/reference/2:255?include_footnotes=false
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "verse_reference": "2:255",
      "surah_number": 2,
      "verse_number": 255,
      "translation": "Allah! There is no god but He, the Ever-Living, the Self-Sustaining.",
      "translation_with_footnotes": "Allah! There is no god but He, the Ever-Living, the Self-Sustaining.¹",
      "has_footnotes": true,
      "footnote_count": 1,
      "translation_source": "Yusuf Ali",
      "display_translation": "Allah! There is no god but He, the Ever-Living, the Self-Sustaining."
    },
    {
      "verse_reference": "2:255",
      "surah_number": 2,
      "verse_number": 255,
      "translation": "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence.",
      "translation_with_footnotes": null,
      "has_footnotes": false,
      "footnote_count": 0,
      "translation_source": "Sahih International",
      "display_translation": "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence."
    }
  ],
  "count": 2,
  "reference": "2:255",
  "include_footnotes": false,
  "source_filter": null
}
```

---

## 📚 Words Endpoints

### 1. Random Verse
**Endpoint:** `GET/POST /api/words/random-verse`

**Description:** Fetches a random verse with all its words for the knowledge test.

**Parameters:**
- `verseLength` (optional): Filter by verse length (`'short'`, `'medium'`, `'long'`, `'all'`)

**Example Request:**
```javascript
POST /api/words/random-verse
{
  "verseLength": "medium"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "surah_number": 2,
    "verse": 255,
    "words": [
      {
        "id": 1234,
        "surah_number": 2,
        "verse": 255,
        "location": "2:255:1",
        "transliteration": "Allahu",
        "translation": "Allah",
        "grammar": "Proper noun, subject",
        "image_url": "https://example.com/arabic-word-1.png",
        "root_latin": "alh",
        "root_arabic": "اله",
        "arabic_text": "الله",
        "tags": [
          {
            "tag": "proper_noun",
            "description": "Name of God"
          }
        ],
        "root": {
          "root_latin": "alh",
          "root_arabic": "اله"
        }
      }
    ]
  },
  "count": 8,
  "filter": "medium"
}
```

### 2. Word Bank Generation
**Endpoint:** `POST /api/words/word-bank`

**Description:** Generates a word bank with distractors for quiz questions.

**Parameters:**
- `correctWord`: The correct word object
- `distractorCount` (optional): Number of distractors (default: 3)
- `options` (optional): Generation options

**Example Request:**
```javascript
POST /api/words/word-bank
{
  "correctWord": {
    "translation": "Allah",
    "transliteration": "Allahu"
  },
  "distractorCount": 3,
  "options": {
    "difficulty": "medium",
    "includeSemantic": true,
    "includeSurah": true,
    "includeRandom": true
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "translation": "Allah",
      "transliteration": "Allahu",
      "isCorrect": true
    },
    {
      "translation": "Lord",
      "transliteration": "Rabb",
      "isCorrect": false
    },
    {
      "translation": "Creator",
      "transliteration": "Khaliq",
      "isCorrect": false
    },
    {
      "translation": "Merciful",
      "transliteration": "Rahman",
      "isCorrect": false
    }
  ]
}
```

### 3. Distractors Generation
**Endpoint:** `GET /api/words/distractors`

**Description:** Generates distractors for quiz questions with various strategies.

**Query Parameters:**
- `surah` (optional): Specific surah number
- `verse` (optional): Specific verse number
- `strategy` (optional): Distractor strategy (`'smart'`, `'semantic'`, `'surah'`, `'phonetic'`, `'random'`, `'mixed'`)
- `wordsPerVerse` (optional): Number of words per verse (default: 3)

**Example Request:**
```
GET /api/words/distractors?strategy=smart&wordsPerVerse=3
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "verse": {
      "surah_number": 2,
      "verse": 255
    },
    "totalWords": 8,
    "selectedWords": 3,
    "wordResults": [
      {
        "word": {
          "id": 1234,
          "translation": "Allah",
          "transliteration": "Allahu"
        },
        "distractors": [
          {
            "translation": "Lord",
            "transliteration": "Rabb"
          }
        ],
        "wordBank": [
          {
            "translation": "Allah",
            "isCorrect": true
          },
          {
            "translation": "Lord",
            "isCorrect": false
          }
        ],
        "strategy": "smart"
      }
    ],
    "strategy": "smart"
  }
}
```

### 4. All Roots
**Endpoint:** `GET /api/words/roots`

**Description:** Fetches all unique Arabic and Latin roots from the database.

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "root": "اله",
      "type": "arabic",
      "count": 2854
    },
    {
      "root": "alh",
      "type": "latin",
      "count": 2854
    }
  ],
  "count": 1680,
  "summary": {
    "arabic": 840,
    "latin": 840
  }
}
```

### 5. Words by Root
**Endpoint:** `GET /api/words/root/[root]`

**Description:** Fetches all words derived from a specific root with optional filtering.

**Parameters:**
- `root`: The root to search for (URL encoded)
- `surah` (optional): Filter by surah number
- `grammar` (optional): Filter by grammar/part of speech

**Example Request:**
```
GET /api/words/root/اله?surah=2&grammar=Proper noun
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1234,
      "surah_number": 2,
      "verse": 255,
      "location": "2:255:1",
      "transliteration": "Allahu",
      "translation": "Allah",
      "grammar": "Proper noun",
      "root_arabic": "اله",
      "root_latin": "alh"
    }
  ],
  "count": 1,
  "filters": {
    "root": "اله",
    "surah": "2",
    "grammar": "Proper noun"
  }
}
```

### 6. Words by Root (Detailed)
**Endpoint:** `GET /api/words/root/[root]/words`

**Description:** Fetches detailed information about all words derived from a specific root.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "root": {
      "arabic": "ا ل ه",
      "latin": "a l h",
      "arabic_compact": "اله",
      "latin_compact": "alh"
    },
    "words": [
      {
        "arabic_text": "الله",
        "transliteration": "Allahu",
        "translation": "Allah",
        "grammar": "Proper noun",
        "occurrences": 2854,
        "locations": ["1:1:1", "1:2:1"],
        "surahs": [1, 2, 3],
        "verses": [1, 2, 255],
        "arabic_without_vowels": "الله"
      }
    ],
    "grammar_breakdown": {
      "Proper noun": {
        "count": 1,
        "total_occurrences": 2854,
        "words": [...]
      }
    },
    "summary": {
      "total_unique_words": 1,
      "total_occurrences": 2854,
      "total_surahs": 114,
      "total_verses": 6236,
      "grammar_categories": 1
    }
  },
  "count": 1,
  "message": "All unique words derived from root: ا ل ه"
}
```

### 7. All Surahs
**Endpoint:** `GET /api/words/surahs`

**Description:** Fetches all surahs with their word counts.

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "number": 1,
      "name": null,
      "wordCount": 29
    },
    {
      "number": 2,
      "name": null,
      "wordCount": 6144
    }
  ],
  "count": 114
}
```

### 8. Words by Surah
**Endpoint:** `GET /api/words/surah/[surah_number]`

**Description:** Fetches all words from a specific surah, grouped by verses.

**Parameters:**
- `surah_number`: The surah number (1-114)
- `tag` (optional): Filter by tag

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "surah_number": 1,
      "verse": 1,
      "words": [
        {
          "arabic_text": "بِسْمِ",
          "transliteration": "Bismi",
          "translation": "In the name of",
          "grammar": "Preposition",
          "root_arabic": "ب س م",
          "root_latin": "bsm",
          "location": "1:1:1"
        },
        {
          "arabic_text": "اللَّهِ",
          "transliteration": "Allahi",
          "translation": "Allah",
          "grammar": "Proper noun",
          "root_arabic": "ا ل ه",
          "root_latin": "alh",
          "location": "1:1:2"
        }
      ],
      "translation": "In the name of Allah"
    }
  ],
  "count": 7,
  "surah_number": 1
}
```

### 9. All Tags
**Endpoint:** `GET /api/words/tags`

**Description:** Fetches all unique tags with their descriptions and counts.

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "tag": "proper_noun",
      "descriptions": ["Name of God", "Name of person"],
      "count": 2
    },
    {
      "tag": "verb",
      "descriptions": ["Past tense", "Present tense"],
      "count": 2
    }
  ],
  "count": 45
}
```

### 10. Words by Tag
**Endpoint:** `GET /api/words/tag/[tag]`

**Description:** Fetches all words with a specific tag.

**Parameters:**
- `tag`: The tag to search for
- `surah` (optional): Filter by surah number

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1234,
      "surah_number": 1,
      "verse": 1,
      "location": "1:1:1",
      "transliteration": "Allahu",
      "translation": "Allah",
      "tags": [{"tag": "proper_noun", "description": "Name of God"}]
    }
  ],
  "count": 1
}
```

### 11. Unique Words
**Endpoint:** `GET/POST /api/words/unique`

**Description:** Fetches all unique words, optionally filtered by surah.

**Query Parameters (GET):**
- `orderBy` (optional): Order by `'location'` or `'frequency'` (default: location)

**Body Parameters (POST):**
- `surah_number` (optional): Filter by surah number
- `orderBy` (optional): Order by `'location'` or `'frequency'`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "unique_words": [
      {
        "id": 1,
        "surah_number": 1,
        "verse": 1,
        "location": "1:1:1",
        "transliteration": "Bismi",
        "translation": "In the name of",
        "occurrences": 1,
        "locations": ["1:1:1"],
        "root": {
          "root_latin": "bsm",
          "root_arabic": "بسم"
        },
        "tags": [...]
      }
    ],
    "total_unique": 15000,
    "total_words": 78000,
    "order_by": "location"
  }
}
```

### 12. Roots by Grammar
**Endpoint:** `GET /api/words/roots/grammar`

**Description:** Fetches roots grouped by grammatical categories.

**Query Parameters:**
- `surah` (optional): Filter by surah
- `limit` (optional): Limit results (default: 50)

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "root_arabic": "ا ل ه",
      "root_latin": "a l h",
      "root_arabic_compact": "اله",
      "root_latin_compact": "alh",
      "grammar_categories": {
        "Proper noun": {
          "unique_forms": 1,
          "total_occurrences": 2854,
          "sample_forms": ["الله"]
        }
      },
      "total_forms": 1,
      "total_occurrences": 2854
    }
  ],
  "count": 1,
  "summary": {
    "total_roots": 1,
    "total_forms": 1,
    "total_occurrences": 2854,
    "grammar_distribution": {
      "Proper noun": {
        "roots_count": 1,
        "total_forms": 1,
        "total_occurrences": 2854
      }
    }
  },
  "message": "Roots grouped by grammatical categories"
}
```

### 13. POS Summary for Root
**Endpoint:** `GET /api/words/root/summary`

**Description:** Lightweight endpoint that returns only the breakdown of POS tags for a root (counts, categories), without the full list of words. Perfect for quick summary tables/charts in the explorer UI.

**Parameters:**
- `root`: The root to search for (URL encoded, as query parameter)
- `surah` (optional): Filter by surah number

**Example Request:**
```
GET /api/words/root/summary?root=اله
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "root": {
      "arabic": "اله",
      "latin": "alh",
      "arabic_compact": "اله",
      "latin_compact": "alh"
    },
    "grammar_categories": {
      "Proper noun": {
        "unique_forms": 1,
        "total_occurrences": 2854,
        "sample_forms": ["الله"]
      },
      "Verb": {
        "unique_forms": 2,
        "total_occurrences": 15,
        "sample_forms": ["يأله", "تأله"]
      }
    },
    "summary": {
      "total_unique_forms": 3,
      "total_occurrences": 2869,
      "total_surahs": 114,
      "total_verses": 6236,
      "grammar_categories_count": 2
    },
    "filters": {
      "surah": null
    }
  },
  "count": 2,
  "message": "POS summary for root: اله"
}
```

### 14. Combined Explorer
**Endpoint:** `GET /api/words/explorer/[root]`

**Description:** Combined endpoint that returns words organized by grammar categories. Perfect for rendering the exact table structure in the combined word/root explorer UI.

**Parameters:**
- `root`: The root to search for (URL encoded)
- `surah` (optional): Filter by surah number
- `limit` (optional): Limit results per category (default: 50)

**Example Request:**
```
GET /api/words/explorer/اله
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "root": {
      "arabic": "اله",
      "latin": "alh",
      "arabic_compact": "اله",
      "latin_compact": "alh"
    },
    "grammar_categories": {
      "Proper noun": [
        {
          "arabic": "الله",
          "transliteration": "Allahu",
          "translation": "Allah",
          "occurrences": 2854
        }
      ],
      "Verb": [
        {
          "arabic": "يأله",
          "transliteration": "ya'lahu",
          "translation": "he worships",
          "occurrences": 8
        },
        {
          "arabic": "تأله",
          "transliteration": "ta'lahu",
          "translation": "you worship",
          "occurrences": 7
        }
      ]
    },
    "summary": {
      "total_unique_forms": 3,
      "total_occurrences": 2869,
      "total_surahs": 114,
      "total_verses": 6236,
      "grammar_categories_count": 2
    },
    "filters": {
      "surah": null,
      "limit": 50
    }
  },
  "count": 2,
  "message": "Combined explorer data for root: اله"
}
```

### 15. Words by Verse
**Endpoint:** `GET /api/words/verse/[location]`

**Description:** Fetches all words for a specific verse. Perfect for the verse explorer where users can see all words in a verse and click on individual words for detailed information.

**Parameters:**
- `location` (path): The verse location in format "surah:verse" (e.g., "19:86")

**Example Request:**
```javascript
GET /api/words/verse/19:86
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "location": "19:86",
    "surah_number": 19,
    "verse_number": 86,
    "words": [
      {
        "id": 1234,
        "surah_number": 19,
        "verse": 86,
        "location": "19:86:1",
        "transliteration": "yawma",
        "translation": "the day",
        "grammar": "Noun",
        "image_url": "https://example.com/arabic-word-1.png",
        "root_latin": "ywm",
        "root_arabic": "يوم",
        "arabic_text": "يوم",
        "tags": [{"tag": "N", "description": "noun"}],
        "position_in_verse": 1,
        "is_first_word": true,
        "is_last_word": false
      },
      {
        "id": 1235,
        "surah_number": 19,
        "verse": 86,
        "location": "19:86:2",
        "transliteration": "la",
        "translation": "not",
        "grammar": "Particle",
        "image_url": "https://example.com/arabic-word-2.png",
        "root_latin": "l",
        "root_arabic": "ل",
        "arabic_text": "لا",
        "tags": [{"tag": "P", "description": "particle"}],
        "position_in_verse": 2,
        "is_first_word": false,
        "is_last_word": false
      }
    ],
    "verse_translation": "the day not",
    "word_count": 2,
    "surah_info": {
      "surah_number": 19,
      "total_verses": 98,
      "total_words": 1234
    }
  },
  "count": 2,
  "message": "Words for verse 19:86"
}
```

---

## 🎮 Quiz Endpoints

### 1. Start Quiz
**Endpoint:** `POST /api/quiz/start`

**Description:** Starts a new quiz session.

**Body Parameters:**
- `surah_number`: The surah number for the quiz
- `lives`: Number of lives/attempts
- `user_id`: User identifier
- `word_order` (optional): Pre-defined word order

**Example Request:**
```javascript
POST /api/quiz/start
{
  "surah_number": 1,
  "lives": 3,
  "user_id": "user123",
  "word_order": ["1:1:1", "1:1:2", "1:1:3"]
}
```

**Example Response:**
```json
{
  "success": true,
  "quiz_id": "quiz_abc123",
  "current_question": {
    "image_url": "https://example.com/arabic-word.png",
    "location": "1:1:1",
    "root_arabic": "بسم",
    "options": ["In the name of", "Praise be to", "The Lord", "Merciful"],
    "correct_answer": "In the name of"
  },
  "lives_remaining": 3
}
```

### 2. Submit Answer
**Endpoint:** `POST /api/quiz/answer`

**Description:** Submits an answer for the current quiz question.

**Body Parameters:**
- `quiz_id`: The quiz identifier
- `word_location`: The location of the word being answered
- `is_correct`: Whether the answer was correct

**Example Request:**
```javascript
POST /api/quiz/answer
{
  "quiz_id": "quiz_abc123",
  "word_location": "1:1:1",
  "is_correct": true
}
```

**Example Response (Next Question):**
```json
{
  "success": true,
  "correct": true,
  "lives_remaining": 3,
  "quiz_over": false,
  "next_question": {
    "image_url": "https://example.com/arabic-word-2.png",
    "location": "1:1:2",
    "root_arabic": "الله",
    "options": ["Allah", "Lord", "Creator", "Merciful"],
    "correct_answer": "Allah"
  }
}
```

**Example Response (Quiz Complete):**
```json
{
  "success": true,
  "quiz_over": true,
  "lives_remaining": 2,
  "final_score": 8
}
```

### 3. Active Quizzes
**Endpoint:** `GET /api/quiz/active`

**Description:** Fetches all currently active quiz sessions.

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "quiz_abc123",
      "surah_number": 1,
      "current_index": 5,
      "lives_remaining": 2,
      "total_questions": 10,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    }
  ],
  "count": 1
}
```

---

## 🔧 Utility Endpoints

### 1. Database Test
**Endpoint:** `GET /api/test-db`

**Description:** Tests the database connection.

**Example Response (Success):**
```json
{
  "success": true,
  "message": "Database connection successful",
  "test": 1,
  "timestamp": "2024-01-15T10:30:00Z",
  "connection": "Active"
}
```

**Example Response (Error):**
```json
{
  "success": false,
  "error": "Connection timeout - check IP allowlist and network settings",
  "details": "Connection timeout after 10000ms",
  "code": "CONNECT_TIMEOUT",
  "troubleshooting": {
    "checkIPAllowlist": "Ensure Vercel IPs are allowed in Supabase",
    "checkEnvironment": "Verify environment variables are set correctly",
    "checkNetwork": "Check if there are firewall restrictions"
  }
}
```

---

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 123,
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

---

## 🔐 Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

---

## 📝 Notes

1. **Database**: The app uses PostgreSQL with Vercel Postgres
2. **In-Memory Storage**: Quiz sessions are stored in-memory and will be lost on server restart
3. **Rate Limiting**: No rate limiting is currently implemented
4. **Caching**: No caching is currently implemented
5. **Error Handling**: All endpoints include proper error handling with descriptive messages

---

## 🚀 Usage Examples

### Frontend Integration
```javascript
// Fetch random verse for knowledge test
const response = await fetch('/api/words/random-verse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ verseLength: 'medium' })
});
const data = await response.json();

// Start a quiz
const quizResponse = await fetch('/api/quiz/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    surah_number: 1,
    lives: 3,
    user_id: 'user123'
  })
});
const quizData = await quizResponse.json();

// Combined Explorer - Get words organized by grammar categories
const explorerResponse = await fetch('/api/words/explorer/اله');
const explorerData = await explorerResponse.json();

// POS Summary - Get lightweight grammar breakdown
const summaryResponse = await fetch('/api/words/root/summary?root=اله');
const summaryData = await summaryResponse.json();

// Filtered words by root and grammar
const filteredResponse = await fetch('/api/words/root/اله?grammar=Proper noun&surah=2');
const filteredData = await filteredResponse.json();
```

This documentation covers all available API endpoints in the Quran Word App. Each endpoint is designed to support the various features of the application, from the knowledge test to the word explorer and root analysis tools.
