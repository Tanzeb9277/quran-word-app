import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * GET /api/words/roots
 * Returns all roots with occurrence counts for the root browser.
 * Query params: limit, offset, sort=count|alpha
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit")) || 200, 500)
    const offset = parseInt(searchParams.get("offset")) || 0
    const sort = searchParams.get("sort") || "count" // count | alpha
    const search = searchParams.get("search") || ""

    const orderBy =
      sort === "alpha"
        ? sql`root_arabic ASC`
        : sql`total_occurrences DESC, root_arabic ASC`

    let roots
    if (search.trim()) {
      const searchPattern = `%${search.trim()}%`
      roots = await sql`
        SELECT 
          root_arabic,
          root_latin,
          COUNT(*) as total_occurrences,
          COUNT(DISTINCT arabic_text) as unique_forms,
          COUNT(DISTINCT surah_number) as surahs_covered
        FROM words 
        WHERE root_arabic IS NOT NULL 
        AND root_arabic != ''
        AND (root_arabic ILIKE ${searchPattern} OR root_latin ILIKE ${searchPattern})
        GROUP BY root_arabic, root_latin
        ORDER BY ${orderBy}
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } else {
      roots = await sql`
        SELECT 
          root_arabic,
          root_latin,
          COUNT(*) as total_occurrences,
          COUNT(DISTINCT arabic_text) as unique_forms,
          COUNT(DISTINCT surah_number) as surahs_covered
        FROM words 
        WHERE root_arabic IS NOT NULL 
        AND root_arabic != ''
        GROUP BY root_arabic, root_latin
        ORDER BY ${orderBy}
        LIMIT ${limit}
        OFFSET ${offset}
      `
    }

    const rows = Array.isArray(roots) ? roots : roots.rows || []

    const countResult = search.trim()
      ? await sql`
          SELECT COUNT(*) as total FROM (
            SELECT 1 FROM words 
            WHERE root_arabic IS NOT NULL AND root_arabic != ''
            AND (root_arabic ILIKE ${`%${search.trim()}%`} OR root_latin ILIKE ${`%${search.trim()}%`})
            GROUP BY root_arabic, root_latin
          ) sub
        `
      : await sql`
          SELECT COUNT(*) as total FROM (
            SELECT 1 FROM words 
            WHERE root_arabic IS NOT NULL AND root_arabic != ''
            GROUP BY root_arabic, root_latin
          ) sub
        `

    const totalRoots = parseInt(countResult[0]?.total ?? 0)

    return NextResponse.json({
      success: true,
      data: {
        roots: rows.map((r) => ({
          arabic: r.root_arabic,
          latin: r.root_latin,
          occurrences: parseInt(r.total_occurrences),
          unique_forms: parseInt(r.unique_forms),
          surahs_covered: parseInt(r.surahs_covered),
        })),
        total: totalRoots,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error("Error fetching roots:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch roots" },
      { status: 500 }
    )
  }
}
