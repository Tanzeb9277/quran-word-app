import { sql } from "../lib/db.js"
import fs from "fs"
import path from "path"

async function setupDatabase() {
  try {
    console.log("Setting up database tables...")
    
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), "scripts", "01-create-tables.sql")
    const sqlContent = fs.readFileSync(sqlPath, "utf8")
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.unsafe(statement)
        console.log("✓ Executed SQL statement")
      }
    }
    
    console.log("✅ Database setup complete!")
    console.log("Tables created: words, active_quizzes")
    console.log("Indexes created for better performance")
    
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  }
}

setupDatabase() 