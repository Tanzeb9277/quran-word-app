import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'
import { enhanceTagsWithDescriptions } from '@/lib/tag-enhancer'

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      difficulty = 'medium',
      rootExposure = {},
      lengthFilter = 'all',
      excludeVerses = []
    } = body

    const isNewUser = !rootExposure || Object.keys(rootExposure).length === 0

    // Reconstruct exclude refs from parsed integers — prevents SQL injection
    const validatedExcludes = Array.isArray(excludeVerses)
      ? excludeVerses
          .map(ref => {
            const [s, v] = String(ref).split(':')
            const sn = parseInt(s, 10)
            const vn = parseInt(v, 10)
            return !isNaN(sn) && !isNaN(vn) ? `${sn}:${vn}` : null
          })
          .filter(Boolean)
      : []

    const lengthMap = {
      short:  'word_count <= 7',
      medium: 'word_count BETWEEN 8 AND 15',
      long:   'word_count > 15'
    }
    const lengthCond = lengthMap[lengthFilter] || null

    // Candidate query: excludes go in the inner WHERE (pre-aggregation),
    // length filter goes in the outer WHERE (post-aggregation on derived word_count).
    const fetchCandidates = (withExcludes, withLength) => {
      const innerWhere =
        withExcludes && validatedExcludes.length > 0
          ? `WHERE NOT (surah_number::text || ':' || verse::text) IN (${validatedExcludes.map(e => `'${e}'`).join(', ')})`
          : ''
      const outerWhere = withLength && lengthCond ? `WHERE ${lengthCond}` : ''

      return sql`
        SELECT surah_number, verse, word_count
        FROM (
          SELECT surah_number, verse, COUNT(*)::int AS word_count
          FROM words
          ${sql.unsafe(innerWhere)}
          GROUP BY surah_number, verse
        ) AS vc
        ${sql.unsafe(outerWhere)}
        ORDER BY RANDOM()
        LIMIT 80
      `
    }

    // Step 1: Fetch candidates, relaxing filters progressively if needed
    let candidates = await fetchCandidates(true, true)

    if (candidates.length === 0 && lengthCond) {
      candidates = await fetchCandidates(true, false)
    }

    if (candidates.length === 0 && validatedExcludes.length > 0) {
      candidates = await fetchCandidates(false, true)
    }

    if (candidates.length === 0) {
      candidates = await fetchCandidates(false, false)
    }

    if (candidates.length === 0) {
      return NextResponse.json({ success: false, error: 'No verses found in database' }, { status: 404 })
    }

    let selectedVerse

    if (isNewUser) {
      // New users have no root exposure data — pick randomly from the full candidate pool
      selectedVerse = candidates[Math.floor(Math.random() * candidates.length)]
    } else {
      // Step 2: Fetch root_arabic for all candidate words in one query
      // Values come from DB integer columns, so embedding in sql.unsafe is safe
      const verseRefs = candidates.map(c => `${c.surah_number}:${c.verse}`)

      const rootRows = await sql`
        SELECT surah_number, verse, root_arabic
        FROM words
        WHERE (surah_number::text || ':' || verse::text) = ANY(${verseRefs})
          AND root_arabic IS NOT NULL
          AND root_arabic != ''
      `

      // Group root values by verse
      const verseRoots = {}
      for (const row of rootRows) {
        const key = `${row.surah_number}:${row.verse}`
        if (!verseRoots[key]) verseRoots[key] = []
        verseRoots[key].push(row.root_arabic)
      }

      // Familiarity score = familiar root-bearing words / total root-bearing words
      const scored = candidates.map(c => {
        const key = `${c.surah_number}:${c.verse}`
        const roots = verseRoots[key] || []
        if (roots.length === 0) return { ...c, score: 0 }
        const familiar = roots.filter(r => (rootExposure[r] || 0) > 0).length
        return { ...c, score: familiar / roots.length }
      })

      // Step 3: Difficulty bands
      const bands = {
        easy:   s => s >= 0.6,
        medium: s => s >= 0.3 && s < 0.6,
        hard:   s => s < 0.3
      }

      // Step 4: Try requested band first, then adjacent bands
      const relaxOrder = {
        easy:   ['easy', 'medium', 'hard'],
        medium: ['medium', 'easy', 'hard'],
        hard:   ['hard', 'medium', 'easy']
      }

      let matching = []
      for (const band of (relaxOrder[difficulty] || relaxOrder.medium)) {
        matching = scored.filter(c => bands[band](c.score))
        if (matching.length > 0) break
      }

      // Final fallback: use all candidates
      if (matching.length === 0) matching = scored

      // Step 5: Pick one at random from the matching set
      selectedVerse = matching[Math.floor(Math.random() * matching.length)]
    }

    // Fetch full word data — same query shape as random-verse route
    const words = await sql`
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
        arabic_text,
        tags,
        CASE
          WHEN root_latin IS NOT NULL AND root_arabic IS NOT NULL
          THEN json_build_object('root_latin', root_latin, 'root_arabic', root_arabic)
          ELSE NULL
        END AS root
      FROM words
      WHERE surah_number = ${selectedVerse.surah_number}
        AND verse = ${selectedVerse.verse}
      ORDER BY CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
    `

    const processedWords = words.map(word => ({
      ...word,
      tags: word.tags ? JSON.parse(word.tags) : []
    }))

    const enhancedWords = await enhanceTagsWithDescriptions(processedWords)

    return NextResponse.json({
      success: true,
      data: {
        surah_number: selectedVerse.surah_number,
        verse: selectedVerse.verse,
        words: enhancedWords
      },
      count: enhancedWords.length,
      filter: lengthFilter
    })
  } catch (error) {
    console.error('Error fetching smart verse:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch smart verse' }, { status: 500 })
  }
}
