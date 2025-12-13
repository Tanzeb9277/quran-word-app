import postgres from 'postgres'

// Determine if we're connecting to Supabase (requires SSL)
const dbHost = process.env.DB_HOST || 'localhost'
const isSupabase = dbHost.includes('supabase') || dbHost.includes('pooler.supabase.com')

// Configure SSL based on connection type
// Supabase requires SSL, local databases typically don't
const sslConfig = isSupabase 
  ? { rejectUnauthorized: false } // Supabase uses self-signed certificates
  : false

// Log connection info in development (without sensitive data)
if (process.env.NODE_ENV !== 'production') {
  console.log('Database connection config:', {
    host: dbHost,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'quran_local',
    ssl: isSupabase ? 'enabled' : 'disabled',
    isSupabase
  })
}

// Configure connection to PostgreSQL database
const sql = postgres({
  host: dbHost,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'quran_local',
  username: process.env.DB_USER || 'quran',
  password: process.env.DB_PASSWORD || 'quran123',
  ssl: sslConfig,
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout of 10 seconds
  onnotice: () => {}, // Suppress notices
  transform: {
    undefined: null
  }
})

export { sql }