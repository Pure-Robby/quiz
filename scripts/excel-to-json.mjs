import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const inputPath = path.join(rootDir, 'cryptic_film_titles.xlsx')
const outputPath = path.join(rootDir, 'public', 'quiz.json')

const workbook = XLSX.readFile(inputPath)
const sheetName = workbook.SheetNames[0]
const sheet = workbook.Sheets[sheetName]
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

const clueKeys = ['clue', 'question', 'Clue', 'Question', 'Cryptic', 'cryptic']
const answerKeys = ['answer', 'Answer', 'Film', 'film', 'Movie', 'movie', 'Title', 'title']

function findColumn(row, keys) {
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k)) return k
  }
  const first = Object.keys(row)[0]
  return first || null
}

const sample = rows[0]
if (!sample) {
  console.error('No rows in sheet')
  process.exit(1)
}

const clueCol = findColumn(sample, clueKeys) || Object.keys(sample)[0]
const answerCol = findColumn(sample, answerKeys) || Object.keys(sample)[1] || Object.keys(sample)[0]

const quiz = rows
  .map((row, i) => ({
    id: i + 1,
    clue: String(row[clueCol] ?? '').trim(),
    answer: String(row[answerCol] ?? '').trim(),
  }))
  .filter((q) => q.clue || q.answer)

const publicDir = path.join(rootDir, 'public')
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(quiz, null, 2), 'utf8')
console.log(`Wrote ${quiz.length} questions to public/quiz.json`)
