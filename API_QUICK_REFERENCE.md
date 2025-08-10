# API Quick Reference

## Base URL
`https://quran-word-app.vercel.app/api`

## Core Endpoints

### Words
- **Random Verse**: `GET /words/random-verse`
- **Word Bank**: `GET /words/word-bank`
- **Unique Words**: `GET /words/unique`
- **By Root**: `GET /words/roots/[root]`
- **By Surah**: `GET /words/surah/[number]`
- **By Tag**: `GET /words/tag/[tag]`

### Tags
- **All Tags**: `GET /tags`

### Quiz
- **Start**: `POST /quiz/start`
- **Active**: `GET /quiz/active`
- **Answer**: `POST /quiz/answer`
- **Result**: `GET /quiz/[id]`

---

## Full URLs

### Words
- `GET  https://quran-word-app.vercel.app/api/words/random-verse`
- `POST https://quran-word-app.vercel.app/api/words/random-verse`
- `GET  https://quran-word-app.vercel.app/api/words/unique?orderBy=location`
- `GET  https://quran-word-app.vercel.app/api/words/unique?orderBy=frequency`
- `POST https://quran-word-app.vercel.app/api/words/unique`
- `GET  https://quran-word-app.vercel.app/api/tags`
- `GET  https://quran-word-app.vercel.app/api/words/word-bank`

### Quiz
- `POST https://quran-word-app.vercel.app/api/quiz/start`
- `GET  https://quran-word-app.vercel.app/api/quiz/active`
- `POST https://quran-word-app.vercel.app/api/quiz/answer`
- `GET  https://quran-word-app.vercel.app/api/quiz/[id]`

---

## cURL Examples

### Test Tags
```bash
curl https://quran-word-app.vercel.app/api/tags
```

### Test Random Verse
```bash
curl https://quran-word-app.vercel.app/api/words/random-verse
```

### Test Unique Words (Location)
```bash
curl "https://quran-word-app.vercel.app/api/words/unique?orderBy=location"
```

### Test Unique Words (Frequency)
```bash
curl "https://quran-word-app.vercel.app/api/words/unique?orderBy=frequency"
```

---

## Response Format
All endpoints return JSON with this structure:
```json
{
  "success": true,
  "data": { ... },
  "count": 1
}
```

## Error Format
```json
{
  "success": false,
  "error": "Error message"
}
```




