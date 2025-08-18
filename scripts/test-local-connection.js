import { config } from 'dotenv'
import postgres from 'postgres'

// Load environment variables from .env.local
config({ path: '.env.local' })

async function testLocalConnection() {
  console.log('Testing local database connection...')
  console.log('Environment variables:')
  console.log('- DB_HOST:', process.env.DB_HOST)
  console.log('- DB_PORT:', process.env.DB_PORT)
  console.log('- DB_NAME:', process.env.DB_NAME)
  console.log('- DB_USER:', process.env.DB_USER)
  console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : 'NOT SET')
  
  try {
    const sql = postgres({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connect_timeout: 30,
    })
    
    console.log('\nAttempting to connect...')
    const result = await sql`SELECT 1 as test, NOW() as timestamp`
    
    console.log('✅ Connection successful!')
    console.log('Result:', result[0])
    
    await sql.end()
  } catch (error) {
    console.error('❌ Connection failed:')
    console.error('- Error:', error.message)
    console.error('- Code:', error.code)
    console.error('- Errno:', error.errno)
    
    if (error.code === 'CONNECT_TIMEOUT') {
      console.log('\n💡 This is a CONNECT_TIMEOUT error. Possible causes:')
      console.log('1. Firewall blocking outbound connections on port 5432')
      console.log('2. Network configuration issues')
      console.log('3. Supabase service temporarily unavailable')
    }
  }
}

testLocalConnection()
