import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupCompleteTagSystem() {
  try {
    console.log('🚀 Setting up complete tag system...\n');
    
    // Step 1: Extract unique tags from database
    console.log('📊 Step 1: Extracting unique tags from database...');
    const extractScript = path.join(__dirname, 'extract-tags.js');
    const { execSync } = await import('child_process');
    execSync(`node ${extractScript}`, { stdio: 'inherit' });
    console.log('✅ Unique tags extracted\n');
    
    // Step 2: Analyze tags and create template
    console.log('🔍 Step 2: Analyzing tags and creating template...');
    const analyzeScript = path.join(__dirname, 'analyze-tags.js');
    execSync(`node ${analyzeScript}`, { stdio: 'inherit' });
    console.log('✅ Tag analysis complete\n');
    
    // Step 3: Update template with suggestions
    console.log('💡 Step 3: Adding suggested catch-all descriptions...');
    const updateScript = path.join(__dirname, 'update-tag-suggestions.js');
    execSync(`node ${updateScript}`, { stdio: 'inherit' });
    console.log('✅ Suggestions added to template\n');
    
    // Step 4: Generate simplified tags
    console.log('📝 Step 4: Generating simplified tags...');
    const generateScript = path.join(__dirname, 'generate-simplified-tags.js');
    execSync(`node ${generateScript}`, { stdio: 'inherit' });
    console.log('✅ Simplified tags generated\n');
    
    // Step 5: Set up database table
    console.log('🗄️ Step 5: Setting up database tags table...');
    const setupScript = path.join(__dirname, 'setup-tags-table.js');
    execSync(`node ${setupScript}`, { stdio: 'inherit' });
    console.log('✅ Database table created\n');
    
    console.log('🎉 Complete tag system setup finished!');
    console.log('\n📋 What was created:');
    console.log('  • Unique tags extracted from database');
    console.log('  • Tag analysis with detailed descriptions');
    console.log('  • Simplified tag mapping template');
    console.log('  • Simplified tags JSON file');
    console.log('  • Database tags table with descriptions');
    console.log('  • /api/tags endpoint for fetching tags');
    console.log('  • Enhanced random verse API with tag descriptions');
    
    console.log('\n🔗 Available endpoints:');
    console.log('  • GET /api/tags - Fetch all tags with descriptions');
    console.log('  • GET/POST /api/words/random-verse - Enhanced with tag descriptions');
    
  } catch (error) {
    console.error('❌ Error in complete setup:', error.message);
  }
}

setupCompleteTagSystem();
