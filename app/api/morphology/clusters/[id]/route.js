import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

function parseSeenWordIdsParam(value) {
  if (!value) return []
  return value
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter(Number.isInteger)
}

function safeJson(value) {
  if (value == null) return null
  if (typeof value === "object") return value
  if (typeof value !== "string") return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function extractVerseIds(sampleVerses) {
  const verseIds = new Set()
  const verses = Array.isArray(sampleVerses) ? sampleVerses : []

  for (const v of verses) {
    // expected: { verse_id: "2:282", ... }
    if (typeof v?.verse_id === "string" && v.verse_id.includes(":")) {
      verseIds.add(v.verse_id)
      continue
    }
    // tolerate alternate shapes
    if (typeof v?.location === "string" && v.location.includes(":")) {
      const parts = v.location.split(":")
      verseIds.add(`${parts[0]}:${parts[1]}`)
    }
    if (Array.isArray(v?.verse_ids)) {
      for (const id of v.verse_ids) {
        if (typeof id === "string" && id.includes(":")) verseIds.add(id)
      }
    }
  }

  return Array.from(verseIds)
}

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const seenWordIds = parseSeenWordIdsParam(searchParams.get("seenWordIds"))
    const seenSet = new Set(seenWordIds)

    const clusterRows = await sql`
      SELECT *
      FROM grammar_clusters
      WHERE id = ${id}
      LIMIT 1
    `

    const cluster = clusterRows?.[0]
    if (!cluster) {
      return NextResponse.json(
        { success: false, error: "Cluster not found" },
        { status: 404 }
      )
    }

    const sampleVerses = safeJson(cluster.sample_verses) ?? []
    const verseIds = extractVerseIds(sampleVerses)

    let verseGroups = []

    if (verseIds.length > 0) {
      const pairs = verseIds
        .map((vid) => {
          const [s, v] = String(vid).split(":")
          const surah = parseInt(s, 10)
          const verse = v
          if (!Number.isInteger(surah) || !verse) return null
          return { surah, verse, verse_id: `${surah}:${verse}` }
        })
        .filter(Boolean)

      if (pairs.length > 0) {
        // Avoid dynamic OR construction with `sql.join()` (not available in all postgres.js setups).
        // Sample verse counts are small, so N small queries is fine and keeps everything parameterized.
        const wordChunks = await Promise.all(
          pairs.map((p) => sql`
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
              END as root
            FROM words
            WHERE surah_number = ${p.surah} AND verse = ${p.verse}
            ORDER BY CAST(SPLIT_PART(location, ':', 3) AS INTEGER)
          `)
        )

        const words = wordChunks.flat()

        const grouped = new Map()
        for (const w of words) {
          const verse_id = `${w.surah_number}:${w.verse}`
          if (!grouped.has(verse_id)) {
            grouped.set(verse_id, {
              verse_id,
              surah_number: w.surah_number,
              verse: w.verse,
              words: [],
            })
          }

          grouped.get(verse_id).words.push({
            ...w,
            tags: w.tags ? JSON.parse(w.tags) : [],
            seen: Number.isInteger(w.id) ? seenSet.has(w.id) : false,
          })
        }

        // Keep the verse ordering consistent with sample_verses order
        verseGroups = pairs
          .map((p) => grouped.get(p.verse_id))
          .filter(Boolean)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        cluster: {
          ...cluster,
          sample_verses: sampleVerses,
        },
        verses: verseGroups,
      },
    })
  } catch (error) {
    console.error("Error fetching grammar cluster by id:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch grammar cluster", details: error.message },
      { status: 500 }
    )
  }
}

