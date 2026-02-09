import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const pagePath = path.join(
  process.cwd(),
  'Mushaf_pages_json',
  'Mushaf_pages_json',
  'page_1.json'
)

async function main() {
  const { sql } = await import('../lib/db.js')

  const page = JSON.parse(fs.readFileSync(pagePath, 'utf8'))
  const lines = (page.lines || []).filter(
    (line) =>
      typeof line.first_word_id === 'number' &&
      typeof line.last_word_id === 'number'
  )

  const output = {
    page_number: page.page_number || 1,
    info: page.info || {},
    lines: []
  }

  for (const line of lines) {
    const result = await sql`
      SELECT 
        id,
        surah_number,
        verse,
        location,
        transliteration,
        translation,
        grammar,
        image_url,
        root_latin,
        root_arabic,
        arabic_text,
        tags
      FROM words
      WHERE id BETWEEN ${line.first_word_id} AND ${line.last_word_id}
      ORDER BY id
    `

    const rows = Array.isArray(result) ? result : result.rows || []
    const words = rows.map((word) => ({
      ...word,
      tags: typeof word.tags === 'string' ? JSON.parse(word.tags) : word.tags,
      mushaf_line: line.line_number
    }))

    if (words.length !== line.last_word_id - line.first_word_id + 1) {
      console.warn(
        `Line ${line.line_number}: expected ${
          line.last_word_id - line.first_word_id + 1
        } words, got ${words.length}`
      )
    }

    output.lines.push({
      page_number: line.page_number,
      line_number: line.line_number,
      line_type: line.line_type,
      is_centered: line.is_centered,
      first_word_id: line.first_word_id,
      last_word_id: line.last_word_id,
      surah_number: line.surah_number,
      words
    })

    console.log(
      `Line ${line.line_number}: fetched ${words.length} words (ids ${line.first_word_id}-${line.last_word_id})`
    )
  }

  const outDir = path.join(process.cwd(), 'scripts', 'output')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'page1-mushaf-lines.json')
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8')
  console.log(`Saved file to ${outPath}`)

  await sql.end()
}

main().catch((err) => {
  console.error('Extraction failed:', err)
  process.exit(1)
})
