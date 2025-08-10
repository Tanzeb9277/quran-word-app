import { sql } from "../lib/db.js"
import fs from "fs"
import path from "path"

async function populateDatabase() {
  try {
    const dataDir = path.join(process.cwd(), "public", "data")
    
    // Get all JSON files in the data directory
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        // Sort by surah number (001.json should come before 002.json, etc.)
        const aNum = parseInt(a.replace('.json', ''))
        const bNum = parseInt(b.replace('.json', ''))
        return aNum - bNum
      })

    console.log(`Found ${files.length} surah files to process`)

    let totalWordsProcessed = 0

    for (const file of files) {
      const filePath = path.join(dataDir, file)
      const surahNumber = parseInt(file.replace('.json', ''))
      
      console.log(`Processing Surah ${surahNumber} (${file})...`)
      
      try {
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"))
        
        // Validate the data structure
        if (!jsonData.metadata || !jsonData.words || !Array.isArray(jsonData.words)) {
          console.warn(`Skipping ${file}: Invalid data structure`)
          continue
        }

        // Clear existing data for this surah
        await sql`DELETE FROM words WHERE surah_number = ${surahNumber}`

        // Insert words for this surah
        for (const word of jsonData.words) {
          await sql`
            INSERT INTO words (
              surah_number, verse, location, transliteration, translation, 
              grammar, image_url, root_latin, root_arabic, tags
            ) VALUES (
              ${surahNumber},
              ${word.verse},
              ${word.location},
              ${word.transliteration},
              ${word.translation},
              ${word.grammar},
              ${word.image_url},
              ${word.root?.root_latin || null},
              ${word.root?.root_arabic || null},
              ${JSON.stringify(word.tags)}
            )
            ON CONFLICT (location) DO UPDATE SET
              transliteration = EXCLUDED.transliteration,
              translation = EXCLUDED.translation,
              grammar = EXCLUDED.grammar,
              image_url = EXCLUDED.image_url,
              root_latin = EXCLUDED.root_latin,
              root_arabic = EXCLUDED.root_arabic,
              tags = EXCLUDED.tags
          `
        }

        totalWordsProcessed += jsonData.words.length
        console.log(`✓ Successfully inserted ${jsonData.words.length} words for Surah ${surahNumber}`)
        
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message)
      }
    }

    console.log(`\n🎉 Database population complete!`)
    console.log(`Total words processed: ${totalWordsProcessed}`)
    console.log(`Total surahs processed: ${files.length}`)
    
  } catch (error) {
    console.error("Error populating database:", error)
    process.exit(1)
  }
}

populateDatabase()
