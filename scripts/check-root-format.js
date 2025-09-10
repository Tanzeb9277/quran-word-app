import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function checkRootFormat() {
  console.log('Checking root format in database...');
  
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
    
    console.log('\nSample root_arabic values:');
    const result = await sql`
      SELECT DISTINCT root_arabic 
      FROM words 
      WHERE root_arabic IS NOT NULL 
      ORDER BY root_arabic
      LIMIT 15
    `;
    
    result.forEach(row => {
      console.log(`- '${row.root_arabic}'`);
    });
    
    console.log('\nSample root_latin values:');
    const latinResult = await sql`
      SELECT DISTINCT root_latin 
      FROM words 
      WHERE root_latin IS NOT NULL 
      ORDER BY root_latin
      LIMIT 15
    `;
    
    latinResult.forEach(row => {
      console.log(`- '${row.root_latin}'`);
    });
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRootFormat();

