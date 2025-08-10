import { sql } from "../lib/db.js"

async function testTagsFixed() {
  try {
    console.log("Testing fixed tags endpoint logic...")
    
    // Get all words with tags and parse them manually
    const wordsWithTags = await sql`
      SELECT tags FROM words WHERE tags IS NOT NULL LIMIT 10
    `

    console.log(`Found ${wordsWithTags.length} words with tags`)
    
    // Parse tags and extract unique ones
    const tagMap = new Map()
    
    wordsWithTags.forEach((row, index) => {
      try {
        const parsedTags = JSON.parse(row.tags)
        console.log(`Word ${index + 1} tags:`, parsedTags)
        
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

    console.log("\nUnique tags found:")
    tags.forEach(tag => {
      console.log(`${tag.tag}: ${tag.descriptions.join(', ')} (${tag.count} descriptions)`)
    })
    
    console.log(`\nTotal unique tags: ${tags.length}`)
    
  } catch (error) {
    console.error("Error:", error)
  }
}

testTagsFixed() 