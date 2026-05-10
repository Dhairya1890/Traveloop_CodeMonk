const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const app = express()

app.use(helmet())
app.use(morgan('dev'))

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/api/auth',       require('./routes/auth'))
app.use('/api/trips',      require('./routes/trips'))
app.use('/api/stops',      require('./routes/stops'))
app.use('/api/cities',     require('./routes/cities'))
app.use('/api/activities', require('./routes/activities'))
app.use('/api/budget',     require('./routes/budget'))
app.use('/api/packing',    require('./routes/packing'))
app.use('/api/notes',      require('./routes/notes'))
app.use('/api/community',  require('./routes/community'))
app.use('/api/admin',      require('./routes/admin'))


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler
app.use(require('./middleware/errorHandler'))

module.exports = app