import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const surah = searchParams.get("surah")
    const root = searchParams.get("root")

    let query

    // Build the WHERE clause based on parameters
    let whereConditions = [`grammar IS NOT NULL`, `grammar != ''`]
    
    if (surah) {
      whereConditions.push(`surah_number = ${surah}`)
    }
    
    if (root) {
      whereConditions.push(`(root_arabic = '${root}' OR root_latin = '${root}')`)
    }

    const whereClause = whereConditions.join(' AND ')

    query = sql`
      SELECT 
        grammar,
        COUNT(DISTINCT arabic_text) as unique_forms,
        COUNT(*) as total_occurrences,
        COUNT(DISTINCT root_arabic) as unique_roots
      FROM words 
      WHERE ${sql.unsafe(whereClause)}
      GROUP BY grammar
      ORDER BY total_occurrences DESC, grammar
    `

    const grammarCategories = await query

    // Get detailed breakdown for each category
    const detailedStats = await Promise.all(
      grammarCategories.map(async (category) => {
        const detailQuery = sql`
          SELECT 
            COUNT(DISTINCT arabic_text) as unique_forms,
            COUNT(*) as total_occurrences,
            COUNT(DISTINCT root_arabic) as unique_roots,
            COUNT(DISTINCT surah_number) as surahs_covered
          FROM words 
          WHERE grammar = ${category.grammar}
          AND arabic_text IS NOT NULL
        `
        const details = await detailQuery
        return {
          ...category,
          surahs_covered: details[0]?.surahs_covered || 0
        }
      })
    )

    // Get overall statistics
    const overallStats = await sql`
      SELECT 
        COUNT(DISTINCT grammar) as total_categories,
        COUNT(DISTINCT arabic_text) as total_unique_forms,
        COUNT(*) as total_occurrences,
        COUNT(DISTINCT root_arabic) as total_unique_roots
      FROM words 
      WHERE grammar IS NOT NULL 
      AND grammar != ''
      AND arabic_text IS NOT NULL
    `

    return NextResponse.json({
      success: true,
      data: detailedStats,
      count: detailedStats.length,
      summary: {
        total_categories: overallStats[0]?.total_categories || 0,
        total_unique_forms: overallStats[0]?.total_unique_forms || 0,
        total_occurrences: overallStats[0]?.total_occurrences || 0,
        total_unique_roots: overallStats[0]?.total_unique_roots || 0
      },
      message: "Available grammar categories with statistics"
    })
  } catch (error) {
    console.error("Error fetching grammar categories:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch grammar categories",
      details: error.message 
    }, { status: 500 })
  }
}

