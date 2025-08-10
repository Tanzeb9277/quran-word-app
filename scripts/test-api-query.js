import { sql } from "../lib/db.js"

async function testAPIQuery() {
  try {
    const tag = "N" // Test with N tag
    
    console.log(`Testing query for tag: ${tag}`)
    
    // Test the exact query the API should use
    const results = await sql`
      SELECT * FROM words 
      WHERE tags::text LIKE ${`%"${tag}"%`}
      ORDER BY surah_number, location
      LIMIT 5
    `
    
    console.log(`Found ${results.length} results`)
    
    results.forEach(row => {
      console.log(`Location: ${row.location}, Word: ${row.transliteration}, Tags: ${row.tags}`)
    })
    
    // Test with surah filter
    console.log("\nTesting with surah filter:")
    const resultsWithSurah = await sql`
      SELECT * FROM words 
      WHERE surah_number = 1
      AND tags::text LIKE ${`%"${tag}"%`}
      ORDER BY location
      LIMIT 3
    `
    
    console.log(`Found ${resultsWithSurah.length} results in surah 1`)
    
    resultsWithSurah.forEach(row => {
      console.log(`Location: ${row.location}, Word: ${row.transliteration}, Tags: ${row.tags}`)
    })
    
  } catch (error) {
    console.error("Error:", error)
  }
}

testAPIQuery() 