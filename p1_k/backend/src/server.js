const path = require('path')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth.routes')
const videoRoutes = require('./routes/video.routes')
const reviewRoutes = require('./routes/review.routes')
const tutorRoutes = require('./routes/tutor.routes')
const doubtRoutes = require('./routes/doubt.routes')

dotenv.config()

const app = express()

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173']

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SkillSwap API',
    timestamp: Date.now(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/tutor', tutorRoutes)
app.use('/api/doubts', doubtRoutes)

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  if (res.headersSent) {
    return next(error)
  }
  res.status(500).json({
    message: error.message || 'Internal server error',
  })
})

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed, but server will start anyway.')
    console.warn('   User registration/login will not work until MongoDB is available.')
    console.warn('   Video uploads will not work until MongoDB is available.')
    console.warn('   To fix: Start MongoDB (mongod) or check MONGODB_URI in .env')
    console.warn('   Server is running in offline mode - API will return helpful error messages.')
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 SkillSwap API running on port ${PORT}`)
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`)
    if (mongoose.connection.readyState !== 1) {
      console.log(`⚠️  Running without MongoDB - database features disabled`)
    }
  })
}

if (require.main === module) {
  startServer()
}

module.exports = app

