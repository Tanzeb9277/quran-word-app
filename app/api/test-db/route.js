import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test simple query with timeout
    const result = await sql`SELECT 1 as test, NOW() as timestamp`
    
    console.log('Database connection successful:', result[0])
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful",
      test: result[0]?.test,
      timestamp: result[0]?.timestamp,
      connection: "Active"
    })
  } catch (error) {
    console.error("Database connection test failed:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      address: error.address,
      port: error.port
    })
    
    let errorMessage = "Database connection failed"
    let status = 500
    
    if (error.code === 'CONNECT_TIMEOUT') {
      errorMessage = "Connection timeout - check IP allowlist and network settings"
      status = 503
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = "Host not found - check DB_HOST environment variable"
      status = 500
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = "Connection refused - check database is running and accessible"
      status = 503
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: error.message,
      code: error.code,
      troubleshooting: {
        checkIPAllowlist: "Ensure Vercel IPs are allowed in Supabase",
        checkEnvironment: "Verify environment variables are set correctly",
        checkNetwork: "Check if there are firewall restrictions"
      }
    }, { status })
  }
}
