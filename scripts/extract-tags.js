import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractTagsFromDatabase() {
  try {
    console.log('Extracting tags from database...');
    
    const result = await sql`
      SELECT DISTINCT 
        jsonb_array_elements(tags::jsonb)->>'tag' as tag,
        jsonb_array_elements(tags::jsonb)->>'description' as description
      FROM words 
      WHERE tags IS NOT NULL 
      AND tags != '[]'
      ORDER BY tag, description
    `;
    
    return result;
  } catch (error) {
    console.error('Database extraction failed:', error.message);
    return null;
  }
}

function extractTagsFromJSON() {
  console.log('Extracting tags from JSON files...');
  
  const dataDir = path.join(__dirname, '../public/data');
  const tagPairs = new Set();
  
  try {
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
    
    for (const file of files) {
      console.log(`Processing ${file}...`);
      const filePath = path.join(dataDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.words && Array.isArray(data.words)) {
        for (const word of data.words) {
          if (word.tags && Array.isArray(word.tags)) {
            for (const tag of word.tags) {
              if (tag.tag && tag.description !== undefined) {
                tagPairs.add(`${tag.tag}:${tag.description}`);
              }
            }
          }
        }
      }
    }
    
    return Array.from(tagPairs).map(pair => {
      const [tag, description] = pair.split(':', 2);
      return { tag, description };
    }).sort((a, b) => {
      if (a.tag !== b.tag) return a.tag.localeCompare(b.tag);
      return a.description.localeCompare(b.description);
    });
    
  } catch (error) {
    console.error('JSON extraction failed:', error.message);
    return null;
  }
}

async function main() {
  console.log('Starting tag extraction...\n');
  
  // Try database first (faster)
  let tags = await extractTagsFromDatabase();
  
  if (!tags) {
    console.log('Falling back to JSON files...\n');
    tags = extractTagsFromJSON();
  }
  
  if (!tags) {
    console.error('Failed to extract tags from both database and JSON files');
    process.exit(1);
  }
  
  console.log(`\nFound ${tags.length} unique tag-description pairs:\n`);
  
  // Group by tag for better readability
  const groupedTags = {};
  for (const { tag, description } of tags) {
    if (!groupedTags[tag]) {
      groupedTags[tag] = new Set();
    }
    groupedTags[tag].add(description);
  }
  
  // Display results
  for (const [tag, descriptions] of Object.entries(groupedTags)) {
    console.log(`${tag}:`);
    for (const description of Array.from(descriptions).sort()) {
      console.log(`  - ${description}`);
    }
    console.log('');
  }
  
  // Save to file
  const outputPath = path.join(__dirname, 'unique-tags.json');
  fs.writeFileSync(outputPath, JSON.stringify(tags, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
  
  // Also save grouped version
  const groupedOutputPath = path.join(__dirname, 'grouped-tags.json');
  const groupedData = {};
  for (const [tag, descriptions] of Object.entries(groupedTags)) {
    groupedData[tag] = Array.from(descriptions).sort();
  }
  fs.writeFileSync(groupedOutputPath, JSON.stringify(groupedData, null, 2));
  console.log(`Grouped results saved to: ${groupedOutputPath}`);
  
  console.log(`\nTotal unique tags: ${Object.keys(groupedTags).length}`);
  console.log(`Total unique tag-description pairs: ${tags.length}`);
}

// Run the script
main().catch(console.error);
