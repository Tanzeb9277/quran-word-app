# API Quick Reference

## 🚀 **Most Used Endpoints**

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/words/random-verse` | GET | Random verse | `GET /api/words/random-verse` |
| `/words/random-verse` | POST | Filtered verse | `POST /api/words/random-verse` with `{"verseLength": "short"}` |
| `/words/unique` | GET | All unique words | `GET /api/words/unique?orderBy=location` |
| `/words/unique` | POST | Surah unique words | `POST /api/words/unique` with `{"surah_number": 1}` |
| `/tags` | GET | All tags | `GET /api/tags` |
| `/words/word-bank` | GET | Distractor words | `GET /api/words/word-bank` |

## 📊 **Unique Words Ordering**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `orderBy=location` | By verse order (default) | `GET /api/words/unique?orderBy=location` |
| `orderBy=frequency` | By occurrence count | `GET /api/words/unique?orderBy=frequency` |

## 🎯 **Verse Length Filters**

| Filter | Word Count | Example |
|--------|------------|---------|
| `short` | ≤ 7 words | `{"verseLength": "short"}` |
| `medium` | 8-15 words | `{"verseLength": "medium"}` |
| `long` | 15+ words | `{"verseLength": "long"}` |
| `all` | Any length | `{"verseLength": "all"}` |

## 🏷️ **Common Tags**

| Tag | Description | Example |
|-----|-------------|---------|
| `N` | noun | `GET /api/words/tag/N` |
| `V` | verb | `GET /api/words/tag/V` |
| `ADJ` | adjective | `GET /api/words/tag/ADJ` |
| `PN` | proper noun | `GET /api/words/tag/PN` |
| `P` | preposition | `GET /api/words/tag/P` |

## 🧪 **Test URLs for Postman**

```
GET  http://localhost:3000/api/words/random-verse
POST http://localhost:3000/api/words/random-verse
GET  http://localhost:3000/api/words/unique?orderBy=location
GET  http://localhost:3000/api/words/unique?orderBy=frequency
POST http://localhost:3000/api/words/unique
GET  http://localhost:3000/api/tags
GET  http://localhost:3000/api/words/word-bank
```

## 📝 **Common Request Bodies**

**Random Verse with Filter:**
```json
{
  "verseLength": "short"
}
```

**Unique Words for Surah:**
```json
{
  "surah_number": 1,
  "orderBy": "frequency"
}
```

## ⚡ **Quick Test Commands**

```bash
# Test tags endpoint
curl http://localhost:3000/api/tags

# Test random verse
curl http://localhost:3000/api/words/random-verse

# Test unique words (location)
curl "http://localhost:3000/api/words/unique?orderBy=location"

# Test unique words (frequency)
curl "http://localhost:3000/api/words/unique?orderBy=frequency"
```




