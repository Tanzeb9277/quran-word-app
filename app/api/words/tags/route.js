import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get all words with tags and parse them manually
    const wordsWithTags = await sql`
      SELECT tags FROM words WHERE tags IS NOT NULL
    `

    // Parse tags and extract unique ones
    const tagMap = new Map()
    
    wordsWithTags.forEach(row => {
      try {
        const parsedTags = JSON.parse(row.tags)
        if (Array.isArray(parsedTags)) {
          parsedTags.forEach(tagObj => {
            if (tagObj.tag) {
              if (!tagMap.has(tagObj.tag)) {
                tagMap.set(tagObj.tag, new Set())
              }
              if (tagObj.description) {
                tagMap.get(tagObj.tag).add(tagObj.description)
              }
            }
          })
        }
      } catch (e) {
        console.warn("Failed to parse tags:", row.tags)
      }
    })

    // Convert to array format
    const tags = Array.from(tagMap.entries()).map(([tag, descriptionsSet]) => ({
      tag,
      descriptions: Array.from(descriptionsSet),
      count: descriptionsSet.size
    })).sort((a, b) => a.tag.localeCompare(b.tag))

    return NextResponse.json({
      success: true,
      data: tags,
      count: tags.length
    })
  } catch (error) {
    console.error("Error fetching unique tags:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tags" }, { status: 500 })
  }
} 