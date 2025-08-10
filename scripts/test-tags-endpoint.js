import fetch from 'node-fetch';

async function testTagsEndpoint() {
  try {
    console.log('Testing /api/tags endpoint...');
    
    const response = await fetch('https://quran-word-app.vercel.app/api/tags');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Tags endpoint working!');
      console.log(`Found ${data.tags.length} tags:`);
      
      data.tags.forEach(({ tag, description }) => {
        console.log(`  ${tag}: ${description}`);
      });
    } else {
      console.log('❌ Tags endpoint failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error testing tags endpoint:', error.message);
  }
}

testTagsEndpoint(); 