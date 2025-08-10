import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateSimplifiedTags() {
  try {
    // Read the manual mapping file
    const mappingPath = path.join(__dirname, 'tag-mapping-template.json');
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    
    // Create simplified tags
    const simplifiedTags = {};
    
    for (const [tag, data] of Object.entries(mapping)) {
      if (data.suggested_catch_all && data.suggested_catch_all.trim() !== '') {
        simplifiedTags[tag] = data.suggested_catch_all;
      } else {
        console.warn(`Warning: No catch-all description for tag "${tag}"`);
        // Use the first original description as fallback
        if (data.original_descriptions && data.original_descriptions.length > 0) {
          simplifiedTags[tag] = data.original_descriptions[0];
        }
      }
    }
    
    // Save simplified tags
    const outputPath = path.join(__dirname, 'simplified-tags.json');
    fs.writeFileSync(outputPath, JSON.stringify(simplifiedTags, null, 2));
    
    console.log(`Simplified tags saved to: ${outputPath}`);
    console.log(`\nGenerated ${Object.keys(simplifiedTags).length} simplified tags:`);
    
    for (const [tag, description] of Object.entries(simplifiedTags)) {
      console.log(`  ${tag}: "${description}"`);
    }
    
  } catch (error) {
    console.error('Error generating simplified tags:', error.message);
  }
}

generateSimplifiedTags();
