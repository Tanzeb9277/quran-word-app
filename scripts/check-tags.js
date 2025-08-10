import { sql } from "../lib/db.js"

async function checkTags() {
  try {
    console.log("Checking tags structure in database...")
    
    // Get a few sample records with tags
    const samples = await sql`SELECT location, tags FROM words WHERE tags IS NOT NULL LIMIT 5`
    
    console.log("\nSample tags from database:")
    samples.forEach(row => {
      console.log(`Location: ${row.location}, Tags:`, JSON.stringify(row.tags))
    })
    
    // Test different query approaches
    console.log("\nTesting different query approaches...")
    
    // Approach 1: Direct tag match
    const test1 = await sql`SELECT COUNT(*) as count FROM words WHERE tags @> '[{"tag": "N"}]'`
    console.log("Approach 1 (direct tag):", test1[0].count)
    
    // Approach 2: Check if tag exists in array
    const test2 = await sql`SELECT COUNT(*) as count FROM words WHERE tags::text LIKE '%"tag":"N"%'`
    console.log("Approach 2 (text search):", test2[0].count)
    
    // Approach 3: Check for any tag with 'N'
    const test3 = await sql`SELECT COUNT(*) as count FROM words WHERE tags::text LIKE '%"N"%'`
    console.log("Approach 3 (simple text):", test3[0].count)
    
    // Get some actual results
    const results = await sql`SELECT location, transliteration, tags FROM words WHERE tags::text LIKE '%"N"%' LIMIT 3`
    console.log("\nSample results with 'N' tag:")
    results.forEach(row => {
      console.log(`Location: ${row.location}, Word: ${row.transliteration}, Tags:`, JSON.stringify(row.tags))
    })
    
  } catch (error) {
    console.error("Error:", error)
  }
}

checkTags() 