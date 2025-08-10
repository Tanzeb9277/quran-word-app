import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function setupTagsTableSimple() {
  try {
    console.log('📋 Tags table setup SQL commands:');
    console.log('');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '02-create-tags-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Copy and paste these SQL commands into your database:');
    console.log('=' .repeat(60));
    console.log(sqlContent);
    console.log('=' .repeat(60));
    
    console.log('');
    console.log('✅ SQL commands generated!');
    console.log('📝 You can now:');
    console.log('  1. Run these SQL commands in your database');
    console.log('  2. Test the /api/tags endpoint');
    console.log('  3. Use the enhanced random verse API');
    
  } catch (error) {
    console.error('❌ Error reading SQL file:', error.message);
  }
}

setupTagsTableSimple();
