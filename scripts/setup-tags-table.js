import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupTagsTable() {
  try {
    console.log('Setting up tags table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '02-create-tags-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await sql.unsafe(sqlContent);
    
    console.log('✅ Tags table created and populated successfully!');
    console.log('You can now use the /api/tags endpoint to fetch all tags.');
    
  } catch (error) {
    console.error('❌ Error setting up tags table:', error.message);
  }
}

setupTagsTable();
