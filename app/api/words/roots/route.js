import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get unique Arabic roots
    const arabicRoots = await sql`
      SELECT DISTINCT root_arabic as root, 'arabic' as type
      FROM words 
      WHERE root_arabic IS NOT NULL AND root_arabic != ''
      ORDER BY root_arabic
    `

    // Get unique Latin roots
    const latinRoots = await sql`
      SELECT DISTINCT root_latin as root, 'latin' as type
      FROM words 
      WHERE root_latin IS NOT NULL AND root_latin != ''
      ORDER BY root_latin
    `

    // Combine and format the results
    const allRoots = [
      ...arabicRoots.map(row => ({
        root: row.root,
        type: row.type,
        count: 0 // We'll calculate this separately
      })),
      ...latinRoots.map(row => ({
        root: row.root,
        type: row.type,
        count: 0 // We'll calculate this separately
      }))
    ]

    // Get count for each root
    const rootCounts = await sql`
      SELECT 
        root_arabic as root,
        'arabic' as type,
        COUNT(*) as count
      FROM words 
      WHERE root_arabic IS NOT NULL AND root_arabic != ''
      GROUP BY root_arabic
      
      UNION ALL
      
      SELECT 
        root_latin as root,
        'latin' as type,
        COUNT(*) as count
      FROM words 
      WHERE root_latin IS NOT NULL AND root_latin != ''
      GROUP BY root_latin
      
      ORDER BY root
    `

    // Merge counts with the roots
    const rootsWithCounts = allRoots.map(root => {
      const countRow = rootCounts.find(r => r.root === root.root && r.type === root.type)
      return {
        ...root,
        count: countRow ? countRow.count : 0
      }
    })

    return NextResponse.json({
      success: true,
      data: rootsWithCounts,
      count: rootsWithCounts.length,
      summary: {
        arabic: rootsWithCounts.filter(r => r.type === 'arabic').length,
        latin: rootsWithCounts.filter(r => r.type === 'latin').length
      }
    })
  } catch (error) {
    console.error("Error fetching unique roots:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch roots" }, { status: 500 })
  }
} 