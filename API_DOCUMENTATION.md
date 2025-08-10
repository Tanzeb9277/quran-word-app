# Quran Word App API Documentation

## Overview
This document provides comprehensive documentation for the Quran Word App API endpoints.

**Base URL**: `https://quran-word-app.vercel.app/api`

---

## 🔗 **Words & Verses Endpoints**

### **1. Random Verse**

**GET** `/words/random-verse`
- **Description**: Fetch a random verse with all its words
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/words/random-verse`

**Response:**
```json
{
  "success": true,
  "data": {
    "surah_number": 1,
    "verse": "1:1",
    "words": [
      {
        "id": 1,
        "location": "1:1:1",
        "transliteration": "bismi",
        "translation": "In the name of",
        "grammar": "preposition",
        "image_url": "https://corpus.quran.com/wordimage?id=1",
        "root": {
          "root_latin": "b s m",
          "root_arabic": "ب س م"
        },
        "tags": [
          {"tag": "P", "description": "preposition"}
        ]
      }
    ]
  },
  "count": 4,
  "filter": "all"
}
```

---

**POST** `/words/random-verse`
- **Description**: Fetch a random verse with verse length filter
- **Method**: `POST`
- **URL**: `https://quran-word-app.vercel.app/api/words/random-verse`
- **Body**:
```json
{
  "verseLength": "short" | "medium" | "long" | "all"
}
```

**Verse Length Options:**
- `short`: ≤ 7 words
- `medium`: 8-15 words  
- `long`: 15+ words
- `all`: Any length (default)

---

### **2. Word Bank**

**GET** `/words/word-bank`
- **Description**: Generate distractor words for the word bank
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/words/word-bank?avoidTranslations=word1,word2`

**Query Parameters:**
- `avoidTranslations` (optional): Comma-separated list of translations to avoid

**Response:**
```json
{
  "wordBank": [
    {
      "translation": "distractor1",
      "image_url": "https://corpus.quran.com/wordimage?id=123"
    },
    {
      "translation": "distractor2", 
      "image_url": "https://corpus.quran.com/wordimage?id=456"
    }
  ]
}
```

---

### **3. Unique Words**

**GET** `/words/unique`
- **Description**: Get all unique words across the entire Quran
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/words/unique`

**Query Parameters:**
- `orderBy` (optional): `"location"` | `"frequency"` (default: `"location"`)

**Examples:**
```
GET /api/words/unique
GET /api/words/unique?orderBy=location
GET /api/words/unique?orderBy=frequency
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unique_words": [
      {
        "id": 1,
        "transliteration": "bismi",
        "translation": "In the name of",
        "occurrences": 3,
        "locations": ["1:1:1", "27:30:1", "113:1:1"],
        "root": {
          "root_latin": "b s m",
          "root_arabic": "ب س م"
        },
        "tags": [{"tag": "P", "description": "preposition"}]
      }
    ],
    "total_unique": 1500,
    "total_words": 5000,
    "order_by": "location"
  }
}
```

---

**POST** `/words/unique`
- **Description**: Get unique words for a specific surah
- **Method**: `POST`
- **URL**: `https://quran-word-app.vercel.app/api/words/unique`
- **Body**:
```json
{
  "surah_number": 1,
  "orderBy": "location" | "frequency"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "surah_number": 1,
    "unique_words": [...],
    "total_unique": 45,
    "total_words": 142,
    "order_by": "location"
  }
}
```

---

### **4. Words by Root**

**GET** `/words/roots/[root]`
- **Description**: Get words by root letters
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/words/roots/b%20s%20m`

**Response:**
```json
{
  "success": true,
  "data": {
    "root": "b s m",
    "words": [
      {
        "id": 1,
        "transliteration": "bismi",
        "translation": "In the name of",
        "location": "1:1:1"
      }
    ]
  }
}
```

---

**GET** `/words/roots`
- **Description**: Get all available roots
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/words/roots`

---

### **5. Words by Surah**

**GET** `/words/surah/[surah_number]`
- **Description**: Get words from a specific surah
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/words/surah/1`

---

**GET** `/words/surahs`
- **Description**: Get list of all surahs
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/words/surahs`

---

### **6. Words by Tag**

**GET** `/words/tag/[tag]`
- **Description**: Get words by grammatical tag
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/words/tag/N`

---

**GET** `/words/tags`
- **Description**: Get all available tags
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/words/tags`

---

## 🏷️ **Tags System**

### **GET** `/tags`
- **Description**: Fetch all tags with their descriptions
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/tags`

**Response:**
```json
{
  "tags": [
    {"tag": "N", "description": "noun"},
    {"tag": "V", "description": "verb"},
    {"tag": "ADJ", "description": "adjective"},
    {"tag": "PN", "description": "proper noun"},
    {"tag": "PRON", "description": "pronoun"},
    {"tag": "P", "description": "preposition"},
    {"tag": "CONJ", "description": "conjunction"},
    {"tag": "NEG", "description": "negative particle"},
    {"tag": "FUT", "description": "future particle"},
    {"tag": "EMPH", "description": "emphatic particle"},
    {"tag": "REM", "description": "resumption particle"},
    {"tag": "RES", "description": "restriction particle"},
    {"tag": "EXP", "description": "exceptive particle"},
    {"tag": "CAUS", "description": "causative particle"},
    {"tag": "CIRC", "description": "circumstantial particle"},
    {"tag": "COM", "description": "comitative particle"},
    {"tag": "EQ", "description": "equalization particle"},
    {"tag": "EXH", "description": "exhortation particle"},
    {"tag": "EXL", "description": "explanation particle"},
    {"tag": "INC", "description": "inceptive particle"},
    {"tag": "INT", "description": "interpretation particle"},
    {"tag": "PREV", "description": "preventive particle"},
    {"tag": "PRO", "description": "prohibition particle"},
    {"tag": "PRP", "description": "purpose particle"},
    {"tag": "RET", "description": "retraction particle"},
    {"tag": "RSLT", "description": "result particle"},
    {"tag": "SUP", "description": "supplemental particle"},
    {"tag": "SUR", "description": "surprise particle"},
    {"tag": "VOC", "description": "vocative particle"},
    {"tag": "DEM", "description": "demonstrative"},
    {"tag": "REL", "description": "relative pronoun"},
    {"tag": "INTG", "description": "interrogative"},
    {"tag": "COND", "description": "conditional"},
    {"tag": "LOC", "description": "location adverb"},
    {"tag": "T", "description": "time adverb"},
    {"tag": "ACC", "description": "accusative particle"},
    {"tag": "AMD", "description": "amendment particle"},
    {"tag": "ANS", "description": "answer particle"},
    {"tag": "AVR", "description": "averting particle"},
    {"tag": "CERT", "description": "certainty particle"},
    {"tag": "INL", "description": "Quranic initials"},
    {"tag": "IMPN", "description": "imperative particle"},
    {"tag": "IMPV", "description": "imperative particle"},
    {"tag": "SUB", "description": "subordinating conjunction"}
  ]
}
```

---

## 🎯 **Quiz System**

### **POST** `/quiz/start`
- **Description**: Start a new quiz
- **Method**: `POST`
- **URL**: `https://quran-word-app.vercel.app/api/quiz/start`
- **Body**:
```json
{
  "user_id": "uuid",
  "surah_number": 1
}
```

---

### **GET** `/quiz/active`
- **Description**: Get active quiz status
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/quiz/active`

---

### **POST** `/quiz/answer`
- **Description**: Submit quiz answer
- **Method**: `POST`
- **URL**: `https://quran-word-app.vercel.app/api/quiz/answer`
- **Body**:
```json
{
  "quiz_id": "uuid",
  "answer": "word_translation"
}
```

---

### **GET** `/quiz/[quiz_id]`
- **Description**: Get specific quiz details
- **Method**: `GET`
- **URL**: `https://quran-word-app.vercel.app/api/quiz/123e4567-e89b-12d3-a456-426614174000`

---

## 🔧 **Error Responses**

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (missing parameters)
- `404`: Not Found (no data available)
- `500`: Internal Server Error

---

## 📊 **Data Filtering Logic**

### **Unique Words Filtering**

The unique words endpoint uses sophisticated filtering:

1. **Primary Check**: If transliterations are exactly the same → **Guaranteed same word**
2. **Secondary Check**: 
   - Clean translations (remove parentheses, punctuation, lowercase)
   - Compare cleaned translations
   - If same translation AND same root letters → **Same word**

**Translation Cleaning Examples:**
```
"In the name of (Allah)" → "in the name of"
"The Most Gracious." → "the most gracious"
"Allah (God)" → "allah"
```

### **Ordering Options**

**Location Ordering (Default):**
- Words appear in the order they appear in the Quran
- Example: `1:1:1`, `1:1:2`, `1:2:1`, etc.

**Frequency Ordering:**
- Most common words first
- Example: `allahu` (15 occurrences), `wa` (12 occurrences), etc.

---

## 🧪 **Testing Examples**

### **Postman Collections**

**1. Test Random Verse:**
```
GET https://quran-word-app.vercel.app/api/words/random-verse
```

**2. Test Unique Words (Location):**
```
GET https://quran-word-app.vercel.app/api/words/unique?orderBy=location
```

**3. Test Unique Words (Frequency):**
```
GET https://quran-word-app.vercel.app/api/words/unique?orderBy=frequency
```

**4. Test Surah-Specific Unique Words:**
```json
POST https://quran-word-app.vercel.app/api/words/unique
{
  "surah_number": 1,
  "orderBy": "frequency"
}
```

**5. Test Tags:**
```
GET https://quran-word-app.vercel.app/api/tags
```

---

## 📝 **Notes**

- All endpoints handle Vercel Postgres client structure automatically
- Database queries are optimized for performance
- Error handling includes detailed logging for debugging
- The API supports both GET and POST methods where appropriate
- All responses include success status and relevant metadata

---

## 🔄 **Recent Updates**

- ✅ Added unique words endpoint with location/frequency ordering
- ✅ Enhanced tags system with descriptions
- ✅ Improved error handling and logging
- ✅ Added verse length filtering for random verses
- ✅ Enhanced word bank with avoid translations feature
