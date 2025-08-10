import { sql } from "../lib/db.js"

async function debugFinal() {
  try {
    console.log("Final debugging of tag query...")
    
    // Test 1: Check if we can find any tags at all
    const anyTags = await sql`SELECT COUNT(*) as count FROM words WHERE tags IS NOT NULL`
    console.log("Words with tags:", anyTags[0].count)
    
    // Test 2: Check the exact pattern we're searching for
    const tag = "N"
    const pattern = `%"${tag}"%`
    console.log("Search pattern:", pattern)
    
    // Test 3: Try different patterns
    const patterns = [
      `%"${tag}"%`,
      `%${tag}%`,
      `%"tag":"${tag}"%`,
      `%"tag":"${tag}`
    ]
    
    for (let i = 0; i < patterns.length; i++) {
      const testPattern = patterns[i]
      const result = await sql`SELECT COUNT(*) as count FROM words WHERE tags::text LIKE ${testPattern}`
      console.log(`Pattern ${i + 1} (${testPattern}): ${result[0].count} results`)
    }
    
    // Test 4: Get a sample of what we're actually searching in
    const samples = await sql`SELECT tags FROM words WHERE tags IS NOT NULL LIMIT 3`
    console.log("\nSample tags to search in:")
    samples.forEach((row, i) => {
      console.log(`Sample ${i + 1}: ${row.tags}`)
    })
    
    // Test 5: Try a simple text search
    const simpleSearch = await sql`SELECT COUNT(*) as count FROM words WHERE tags::text LIKE '%N%'`
    console.log("Simple search for 'N':", simpleSearch[0].count)
    
    // Test 6: Try the exact query that should work
    const exactQuery = await sql`
      SELECT location, transliteration, tags 
      FROM words 
      WHERE tags::text LIKE '%N%' 
      LIMIT 3
    `
    console.log("\nExact query results:")
    exactQuery.forEach(row => {
      console.log(`Location: ${row.location}, Word: ${row.transliteration}`)
      console.log(`Tags: ${row.tags}`)
      console.log("---")
    })
    
  } catch (error) {
    console.error("Error:", error)
  }
}

debugFinal() 