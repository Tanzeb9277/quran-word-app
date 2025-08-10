import { sql } from '@/lib/db';

export async function GET() {
  try {
    // First, check if the tags table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tags'
      ) as table_exists
    `;
    
    // Handle Vercel Postgres client structure
    const tableExists = Array.isArray(tableCheck) ? tableCheck[0]?.table_exists : tableCheck.rows?.[0]?.table_exists;
    
    if (!tableExists) {
      console.log('Tags table does not exist. Please run the setup script first.');
      return Response.json(
        { 
          error: 'Tags table not found. Please run: node scripts/run-sql-commands.js',
          setup_required: true 
        },
        { status: 404 }
      );
    }

    const result = await sql`
      SELECT tag_code, description 
      FROM tags 
      ORDER BY tag_code
    `;

    // Handle Vercel Postgres client structure
    const resultArray = Array.isArray(result) ? result : result.rows || [];
    
    if (!resultArray || resultArray.length === 0) {
      console.error('Database query returned no results');
      return Response.json(
        { error: 'Database query failed' },
        { status: 500 }
      );
    }

    const tags = resultArray.map(row => ({
      tag: row.tag_code,
      description: row.description
    }));

    console.log(`Successfully fetched ${tags.length} tags`);
    return Response.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return Response.json(
      { 
        error: 'Failed to fetch tags',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
