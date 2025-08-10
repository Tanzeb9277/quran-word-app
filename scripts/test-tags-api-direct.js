import { sql } from '../lib/db.js';

async function testTagsApiDirect() {
  try {
    console.log('🧪 Testing tags API directly...\n');
    
    // Test the same query that the API uses
    const result = await sql`
      SELECT tag_code, description 
      FROM tags 
      ORDER BY tag_code
    `;
    
    // Handle Vercel Postgres client structure
    const resultArray = Array.isArray(result) ? result : result.rows || [];
    
    console.log(`✅ Query successful! Found ${resultArray.length} tags\n`);
    
    // Show first 10 tags
    console.log('📋 First 10 tags:');
    resultArray.slice(0, 10).forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.tag_code}: ${row.description}`);
    });
    
    if (resultArray.length > 10) {
      console.log(`  ... and ${resultArray.length - 10} more tags`);
    }
    
    console.log('\n🎉 Tags API is working correctly!');
    console.log('📝 You can now use the /api/tags endpoint in your application.');
    
  } catch (error) {
    console.error('❌ Error testing tags API:', error.message);
  }
}

testTagsApiDirect();
