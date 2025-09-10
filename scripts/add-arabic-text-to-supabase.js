import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function addArabicTextColumn() {
  console.log('Adding arabic_text column to Supabase database...');
  
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
    
    console.log('Adding arabic_text column...');
    await sql`ALTER TABLE words ADD COLUMN IF NOT EXISTS arabic_text TEXT`;
    console.log('✅ arabic_text column added successfully');
    
    console.log('Creating index on arabic_text column...');
    await sql`CREATE INDEX IF NOT EXISTS idx_words_arabic_text ON words(arabic_text) WHERE arabic_text IS NOT NULL`;
    console.log('✅ Index created successfully');
    
    // Verify the column was added
    console.log('\nVerifying column was added...');
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'words' AND column_name = 'arabic_text'
    `;
    
    if (result.length > 0) {
      console.log('✅ Verification successful: arabic_text column exists');
      console.log(`Column type: ${result[0].data_type}`);
    } else {
      console.log('❌ Verification failed: arabic_text column not found');
    }
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

addArabicTextColumn();

