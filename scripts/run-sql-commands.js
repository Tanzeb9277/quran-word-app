import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSqlCommands() {
  try {
    console.log('🗄️ Running SQL commands to create tags table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '02-create-tags-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual commands
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`Found ${commands.length} SQL commands to execute...`);
    
    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`Executing command ${i + 1}/${commands.length}...`);
      
      try {
        await sql.unsafe(command);
        console.log(`✅ Command ${i + 1} executed successfully`);
      } catch (error) {
        console.log(`⚠️ Command ${i + 1} failed (might already exist):`, error.message);
      }
    }
    
    console.log('');
    console.log('🎉 Tags table setup complete!');
    console.log('📝 You can now:');
    console.log('  • Test the /api/tags endpoint');
    console.log('  • Use the enhanced random verse API');
    
  } catch (error) {
    console.error('❌ Error running SQL commands:', error.message);
  }
}

runSqlCommands();
