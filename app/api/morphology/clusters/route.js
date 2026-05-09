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

function isAccessible(cluster, seenSet, index) {
  // Always unlock first 3 sequence orders for everyone
  if ((cluster.sequence_order ?? 99) <= 2) return true
  // If user has seen any words at all, unlock next tier
  if (seenSet.size > 0 && (cluster.sequence_order ?? 99) <= 6) return true
  // For higher tiers, require more seen words
  if (seenSet.size >= 20 && (cluster.sequence_order ?? 99) <= 10) return true
  if (seenSet.size >= 50) return true
  return false
}

/**
 * GET /api/morphology/clusters
 * Query params:
 * - construction_ar: filter by specific construction
 * - difficulty: beginner | intermediate | advanced
 * - seenWordIds: comma-separated word IDs
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const constructionAr = searchParams.get("construction_ar")
    const difficulty = searchParams.get("difficulty")
    const seenWordIds = parseSeenWordIdsParam(searchParams.get("seenWordIds"))
    const seenSet = new Set(seenWordIds)

    // Note: postgres.js doesn't support `sql.join()` on the client instance in all versions.
    // Keep this simple and parameterized with explicit branching.
    const clusters =
      constructionAr && difficulty
        ? await sql`
            SELECT
              id,
              construction_ar,
              construction_en,
              difficulty,
              sequence_order,
              lesson_title,
              rule_explanation,
              what_to_look_for,
              common_examples,
              teaching_tip,
              verse_count,
              sample_verses
            FROM grammar_clusters
            WHERE construction_ar = ${constructionAr} AND difficulty = ${difficulty}
            ORDER BY sequence_order ASC
          `
        : constructionAr
          ? await sql`
              SELECT
                id,
                construction_ar,
                construction_en,
                difficulty,
                sequence_order,
                lesson_title,
                rule_explanation,
                what_to_look_for,
                common_examples,
                teaching_tip,
                verse_count,
                sample_verses
              FROM grammar_clusters
              WHERE construction_ar = ${constructionAr}
              ORDER BY sequence_order ASC
            `
          : difficulty
            ? await sql`
                SELECT
                  id,
                  construction_ar,
                  construction_en,
                  difficulty,
                  sequence_order,
                  lesson_title,
                  rule_explanation,
                  what_to_look_for,
                  common_examples,
                  teaching_tip,
                  verse_count,
                  sample_verses
                FROM grammar_clusters
                WHERE difficulty = ${difficulty}
                ORDER BY sequence_order ASC
              `
            : await sql`
                SELECT
                  id,
                  construction_ar,
                  construction_en,
                  difficulty,
                  sequence_order,
                  lesson_title,
                  rule_explanation,
                  what_to_look_for,
                  common_examples,
                  teaching_tip,
                  verse_count,
                  sample_verses
                FROM grammar_clusters
                ORDER BY sequence_order ASC
              `

    const rows = Array.isArray(clusters) ? clusters : clusters.rows || []

    const mapped = rows.map((c) => {
      const sampleVerses = safeJson(c.sample_verses) ?? []
      return {
        id: c.id,
        construction_ar: c.construction_ar,
        construction_en: c.construction_en,
        difficulty: c.difficulty,
        sequence_order: c.sequence_order,
        lesson_title: c.lesson_title,
        rule_explanation: c.rule_explanation,
        what_to_look_for: c.what_to_look_for,
        common_examples: c.common_examples,
        teaching_tip: c.teaching_tip,
        verse_count: c.verse_count,
        sample_verses: sampleVerses,
        accessible: false,
      }
    })

    // New users: make first 3 clusters accessible (in returned ordering)
    // Returning users: apply the progressive unlock rules.
    mapped.forEach((c, idx) => {
      c.accessible = seenSet.size === 0 ? idx < 3 : isAccessible(c, seenSet, idx)
    })

    return NextResponse.json({
      success: true,
      data: mapped,
      count: mapped.length,
      filters: {
        construction_ar: constructionAr || null,
        difficulty: difficulty || null,
      },
    })
  } catch (error) {
    console.error("Error fetching grammar clusters:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch grammar clusters", details: error.message },
      { status: 500 }
    )
  }
}

