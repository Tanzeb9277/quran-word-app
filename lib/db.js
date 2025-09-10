import postgres from 'postgres'

// Configure connection to local PostgreSQL database
const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'quran_local',
  username: process.env.DB_USER || 'quran',
  password: process.env.DB_PASSWORD || 'quran123',
  ssl: false, // Disable SSL for local database
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout of 10 seconds
})

export { sql }