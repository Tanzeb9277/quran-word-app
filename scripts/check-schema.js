import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function checkSchema() {
  console.log('Checking database schema...');
  console.log('Environment variables:');
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_NAME:', process.env.DB_NAME);
  console.log('- DB_USER:', process.env.DB_USER);
  
  try {
    const sql = postgres({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });
    
    console.log('\nChecking columns in words table...');
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'words' 
      ORDER BY ordinal_position
    `;
    
    console.log('\nColumns in words table:');
    result.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if arabic_text column exists
    const arabicTextExists = result.some(col => col.column_name === 'arabic_text');
    console.log(`\nArabic_text column exists: ${arabicTextExists ? '✅ YES' : '❌ NO'}`);
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema();

