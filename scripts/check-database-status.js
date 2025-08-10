import { sql } from '../lib/db.js';

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking database status...\n');
    
    // Check if we can connect to the database
    console.log('1. Testing database connection...');
    const connectionTest = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful\n');
    
    // Check if tags table exists
    console.log('2. Checking if tags table exists...');
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tags'
      ) as table_exists
    `;
    
    console.log('Table check result:', tableCheck);
    
    // The Vercel Postgres client might return results directly
    const tableExists = Array.isArray(tableCheck) ? tableCheck[0]?.table_exists : tableCheck.rows?.[0]?.table_exists;
    
    if (tableExists) {
      console.log('✅ Tags table exists\n');
      
      // Check how many tags are in the table
      console.log('3. Counting tags in the table...');
      const countResult = await sql`SELECT COUNT(*) as tag_count FROM tags`;
      const tagCount = Array.isArray(countResult) ? countResult[0]?.tag_count : countResult.rows?.[0]?.tag_count;
      console.log(`✅ Found ${tagCount} tags in the table\n`);
      
      // Show a few sample tags
      console.log('4. Sample tags:');
      const sampleTags = await sql`
        SELECT tag_code, description 
        FROM tags 
        ORDER BY tag_code 
        LIMIT 5
      `;
      
      const tagsArray = Array.isArray(sampleTags) ? sampleTags : sampleTags.rows || [];
      tagsArray.forEach(row => {
        console.log(`   ${row.tag_code}: ${row.description}`);
      });
      
      console.log('\n🎉 Database is ready! You can now use the /api/tags endpoint.');
      
    } else {
      console.log('❌ Tags table does not exist\n');
      console.log('📝 To create the tags table, run:');
      console.log('   node scripts/run-sql-commands.js');
      console.log('   or');
      console.log('   node scripts/setup-tags-table-simple.js (for manual SQL)');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your database connection');
    console.log('2. Verify your environment variables');
    console.log('3. Make sure the database is accessible');
  }
}

checkDatabaseStatus();
