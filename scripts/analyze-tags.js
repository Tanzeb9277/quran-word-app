import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function analyzeTags() {
  try {
    // Read the existing unique tags file
    const tagsPath = path.join(__dirname, 'unique-tags.json');
    const tags = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
    
    // Group by tag
    const groupedTags = {};
    for (const { tag, description } of tags) {
      if (!groupedTags[tag]) {
        groupedTags[tag] = new Set();
      }
      groupedTags[tag].add(description);
    }
    
    console.log('Tag Analysis:\n');
    
    // Analyze each tag
    for (const [tag, descriptions] of Object.entries(groupedTags)) {
      const descArray = Array.from(descriptions).sort();
      console.log(`${tag}:`);
      console.log(`  Count: ${descArray.length} descriptions`);
      console.log(`  Descriptions:`);
      descArray.forEach(desc => {
        console.log(`    - "${desc}"`);
      });
      console.log('');
    }
    
    // Create a template for manual mapping
    const template = {};
    for (const tag of Object.keys(groupedTags)) {
      template[tag] = {
        "suggested_catch_all": "",
        "notes": "",
        "original_descriptions": Array.from(groupedTags[tag]).sort()
      };
    }
    
    // Save template
    const templatePath = path.join(__dirname, 'tag-mapping-template.json');
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
    console.log(`\nTemplate saved to: ${templatePath}`);
    console.log('Please edit this file to add catch-all descriptions manually.');
    
  } catch (error) {
    console.error('Error analyzing tags:', error.message);
  }
}

analyzeTags();
