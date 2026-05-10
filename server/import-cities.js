/**
 * import-cities.js
 * Reads worldcities.csv from the project root and bulk-inserts into
 * the `cities` table. Run once from the server/ directory:
 *
 *   node import-cities.js
 *
 * CSV columns: city, city_ascii, lat, lng, country, iso2, iso3,
 *              admin_name, capital, population, id
 */

'use strict'

const path   = require('path')
const fs     = require('fs')
const readline = require('readline')
require('dotenv').config()

const { Sequelize } = require('sequelize')
const dbConfig = require('./config/database')

const env = process.env.NODE_ENV || 'development'
const cfg = dbConfig[env]

const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
  host:    cfg.host,
  dialect: cfg.dialect,
  logging: false,
})

const CSV_PATH = path.resolve(__dirname, '..', 'worldcities.csv')
const BATCH    = 500  // rows per INSERT

/* ── Helpers ──────────────────────────────────────────────── */
function cleanNum(s) {
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

// Very simple CSV line parser that handles quoted fields
function parseLine(line) {
  const fields = []
  let cur = '', inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuote = !inQuote }
    else if (ch === ',' && !inQuote) { fields.push(cur); cur = '' }
    else { cur += ch }
  }
  fields.push(cur)
  return fields
}

/* ── Map region from country ──────────────────────────────── */
const REGION_MAP = {
  'Japan':'Asia','China':'Asia','India':'Asia','Indonesia':'Asia','Thailand':'Asia',
  'Vietnam':'Asia','South Korea':'Asia','Philippines':'Asia','Malaysia':'Asia','Bangladesh':'Asia',
  'Pakistan':'Asia','Sri Lanka':'Asia','Nepal':'Asia','Cambodia':'Asia','Myanmar':'Asia',
  'Singapore':'Asia','Taiwan':'Asia','Hong Kong':'Asia','Macau':'Asia',
  'France':'Europe','Germany':'Europe','Italy':'Europe','Spain':'Europe','UK':'Europe',
  'United Kingdom':'Europe','Netherlands':'Europe','Belgium':'Europe','Switzerland':'Europe',
  'Austria':'Europe','Sweden':'Europe','Norway':'Europe','Denmark':'Europe','Finland':'Europe',
  'Portugal':'Europe','Greece':'Europe','Poland':'Europe','Czech Republic':'Europe',
  'Hungary':'Europe','Romania':'Europe','Croatia':'Europe','Serbia':'Europe',
  'Turkey':'Europe/Asia',
  'United States':'North America','USA':'North America','Canada':'North America','Mexico':'North America',
  'Cuba':'North America','Jamaica':'North America','Dominican Republic':'North America',
  'Brazil':'South America','Argentina':'South America','Colombia':'South America',
  'Chile':'South America','Peru':'South America','Venezuela':'South America',
  'Ecuador':'South America','Bolivia':'South America','Uruguay':'South America',
  'Nigeria':'Africa','South Africa':'Africa','Egypt':'Africa','Kenya':'Africa',
  'Ethiopia':'Africa','Ghana':'Africa','Tanzania':'Africa','Uganda':'Africa',
  'Morocco':'Africa','Algeria':'Africa','Tunisia':'Africa','Sudan':'Africa',
  'Australia':'Oceania','New Zealand':'Oceania','Papua New Guinea':'Oceania',
  'Saudi Arabia':'Middle East','UAE':'Middle East','United Arab Emirates':'Middle East',
  'Qatar':'Middle East','Kuwait':'Middle East','Bahrain':'Middle East',
  'Israel':'Middle East','Jordan':'Middle East','Lebanon':'Middle East','Iraq':'Middle East',
  'Iran':'Middle East','Oman':'Middle East','Yemen':'Middle East',
  'Russia':'Europe/Asia','Ukraine':'Europe','Kazakhstan':'Asia','Uzbekistan':'Asia',
}

function getRegion(country) {
  return REGION_MAP[country] || null
}

/* ── Main ─────────────────────────────────────────────────── */
async function main() {
  await sequelize.authenticate()
  console.log('✅ DB connected')

  // Clear existing seeded cities to avoid duplicates
  await sequelize.query("DELETE FROM cities WHERE cost_index IS NULL OR cost_index = 0")
  console.log('🗑  Cleared placeholder cities')

  const rl = readline.createInterface({
    input: fs.createReadStream(CSV_PATH, 'utf8'),
    crlfDelay: Infinity,
  })

  let header = true
  let batch  = []
  let total  = 0
  const now  = new Date()

  for await (const rawLine of rl) {
    const line = rawLine.replace(/\r/g, '')
    if (header) { header = false; continue }
    if (!line.trim()) continue

    const [city, city_ascii, lat, lng, country, , , admin_name, , population] = parseLine(line)

    const name = (city || city_ascii || '').trim()
    const ctry = (country || '').trim()
    if (!name || !ctry) continue

    // Score popularity by population (0-10 scale, cap at 40M)
    const pop = parseFloat(population) || 0
    const popularity_score = pop > 0 ? Math.min(10, (pop / 4_000_000)) : null

    batch.push({
      name,
      country: ctry,
      region:  getRegion(ctry),
      cost_index:       null,
      popularity_score: popularity_score ? Math.round(popularity_score * 100) / 100 : null,
      image_url:        null,
      description:      admin_name ? `${name}, ${admin_name}, ${ctry}` : null,
      latitude:         cleanNum(lat),
      longitude:        cleanNum(lng),
      created_at:       now,
      updated_at:       now,
    })

    if (batch.length >= BATCH) {
      await sequelize.getQueryInterface().bulkInsert('cities', batch, {
        ignoreDuplicates: true,
      }).catch(() => {}) // skip batch errors silently
      total += batch.length
      process.stdout.write(`\r  Inserted ${total.toLocaleString()} rows…`)
      batch = []
    }
  }

  // Final batch
  if (batch.length > 0) {
    await sequelize.getQueryInterface().bulkInsert('cities', batch, {
      ignoreDuplicates: true,
    }).catch(() => {})
    total += batch.length
  }

  console.log(`\n✅ Done! ${total.toLocaleString()} cities imported.`)
  await sequelize.close()
}

main().catch(err => {
  console.error('❌ Import failed:', err.message)
  process.exit(1)
})
