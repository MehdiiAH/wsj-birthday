import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const csvPath = join(__dirname, '../../wsj_issues.csv')
const outputDir = join(__dirname, '../public/data')
const outputPath = join(outputDir, 'issues.json')

function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values
}

const csv = readFileSync(csvPath, 'utf-8')
const lines = csv.trim().split('\n')

const issues = lines
  .slice(1) // skip header
  .map(line => {
    const [issue_number, name, cover_date, image_url] = parseCSVLine(line)
    if (!cover_date || !name) return null
    const is_double =
      /\d+-\d+/.test(name) || name.toLowerCase().includes('double')
    return { issue_number, name, cover_date, image_url: image_url || '', is_double }
  })
  .filter(Boolean)
  .sort((a, b) => a.cover_date.localeCompare(b.cover_date))

mkdirSync(outputDir, { recursive: true })
writeFileSync(outputPath, JSON.stringify(issues))
console.log(`✅ ${issues.length} issues converted → public/data/issues.json`)
console.log(`   Range: ${issues[0].cover_date} → ${issues[issues.length - 1].cover_date}`)
