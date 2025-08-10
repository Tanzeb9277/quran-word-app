import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateTagSuggestions() {
  try {
    // Read the existing template
    const templatePath = path.join(__dirname, 'tag-mapping-template.json');
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    
    // Define suggested catch-all descriptions based on analysis
    const suggestions = {
      "ACC": "accusative particle",
      "ADJ": "adjective",
      "AMD": "amendment particle", 
      "ANS": "answer particle",
      "AVR": "averting particle",
      "CAUS": "causative particle",
      "CERT": "certainty particle",
      "CIRC": "circumstantial particle",
      "COM": "comitative particle",
      "COND": "conditional",
      "CONJ": "conjunction",
      "DEM": "demonstrative",
      "EMPH": "emphatic particle",
      "EQ": "equalization particle",
      "EXH": "exhortation particle",
      "EXL": "explanation particle",
      "EXP": "exceptive particle",
      "FUT": "future particle",
      "IMPN": "imperative particle",
      "IMPV": "imperative particle",
      "INC": "inceptive particle",
      "INL": "Quranic initials",
      "INT": "interpretation particle",
      "INTG": "interrogative",
      "LOC": "location adverb",
      "N": "noun",
      "NEG": "negative particle",
      "P": "preposition",
      "PN": "proper noun",
      "PREV": "preventive particle",
      "PRO": "prohibition particle",
      "PRON": "pronoun",
      "PRP": "purpose particle",
      "REL": "relative pronoun",
      "REM": "resumption particle",
      "RES": "restriction particle",
      "RET": "retraction particle",
      "RSLT": "result particle",
      "SUB": "subordinating conjunction",
      "SUP": "supplemental particle",
      "SUR": "surprise particle",
      "T": "time adverb",
      "V": "verb",
      "VOC": "vocative particle"
    };
    
    // Update template with suggestions
    for (const [tag, suggestion] of Object.entries(suggestions)) {
      if (template[tag]) {
        template[tag].suggested_catch_all = suggestion;
        template[tag].notes = `Simplified from ${template[tag].original_descriptions.length} detailed descriptions`;
      }
    }
    
    // Save updated template
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
    
    console.log('Updated tag mapping template with suggested catch-all descriptions:');
    console.log('');
    
    for (const [tag, suggestion] of Object.entries(suggestions)) {
      console.log(`${tag}: "${suggestion}"`);
    }
    
    console.log(`\nUpdated template saved to: ${templatePath}`);
    console.log('You can now run: node scripts/generate-simplified-tags.js');
    
  } catch (error) {
    console.error('Error updating tag suggestions:', error.message);
  }
}

updateTagSuggestions();
