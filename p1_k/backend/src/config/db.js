const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap'

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
    })
    console.log('✅ Connected to MongoDB:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
    console.log('✅ Database: skillswap')
    console.log('✅ MongoDB is ready for operations')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.error('💡 Make sure MongoDB is running. Try: mongod (or start MongoDB service)')
    console.error('💡 The server will start anyway, but database operations will fail.')
    throw error
  }
}

module.exports = connectDB

