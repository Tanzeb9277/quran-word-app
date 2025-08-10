import { sql } from "../lib/db.js"

async function debugTags() {
  try {
    console.log("Debugging tags structure...")
    
    // Get raw data
    const rawData = await sql`SELECT location, tags FROM words WHERE tags IS NOT NULL LIMIT 3`
    
    console.log("\nRaw tags data:")
    rawData.forEach(row => {
      console.log(`Location: ${row.location}`)
      console.log(`Tags (raw): ${row.tags}`)
      console.log(`Tags (typeof): ${typeof row.tags}`)
      console.log(`Tags (length): ${row.tags.length}`)
      console.log("---")
    })
    
    // Test the exact query we're using
    console.log("\nTesting exact query from API:")
    const testQuery = await sql`SELECT COUNT(*) as count FROM words WHERE tags::text LIKE '%"tag":"N"%'`
    console.log("Count with '%\"tag\":\"N\"%':", testQuery[0].count)
    
    // Test with different patterns
    const test1 = await sql`SELECT COUNT(*) as count FROM words WHERE tags::text LIKE '%N%'`
    console.log("Count with '%N%':", test1[0].count)
    
    const test2 = await sql`SELECT COUNT(*) as count FROM words WHERE tags::text LIKE '%tag%'`
    console.log("Count with '%tag%':", test2[0].count)
    
    // Get actual results
    const results = await sql`SELECT location, transliteration, tags FROM words WHERE tags::text LIKE '%N%' LIMIT 3`
    console.log("\nActual results:")
    results.forEach(row => {
      console.log(`Location: ${row.location}, Word: ${row.transliteration}`)
      console.log(`Tags: ${row.tags}`)
      console.log("---")
    })
    
  } catch (error) {
    console.error("Error:", error)
  }
}

debugTags() 