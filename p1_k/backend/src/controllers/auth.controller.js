const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const allowedRoles = ['learner', 'tutor']

const sanitizeUser = ({ _id, fullName, email, role, createdAt, isVerified }) => ({
  id: _id,
  fullName,
  email,
  role,
  createdAt,
  isVerified: isVerified || false,
})

const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' })
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Role must be learner or tutor.' })
    }

    // Check if MongoDB is connected
    const mongoose = require('mongoose')
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database is not available. Please install and start MongoDB to create an account. The server is running in offline mode.' 
      })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res
        .status(409)
        .json({ message: 'An account with that email already exists.' })
    }

    const user = await User.create({ fullName, email, password, role })
    const token = generateToken(user._id.toString())

    return res.status(201).json({
      user: sanitizeUser(user),
      token,
    })
  } catch (error) {
    console.error('Register error:', error.name, error.message)
    // Handle MongoDB connection/buffering errors
    if (error.name === 'MongoServerError' || 
        error.message?.includes('MongoServerError') || 
        error.message?.includes('MongooseServerSelectionError') ||
        error.message?.includes('buffering timed out') ||
        error.name === 'MongooseError') {
      return res.status(503).json({ 
        message: 'Database connection failed. MongoDB is not running. Please install and start MongoDB to use this feature.' 
      })
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message || 'Validation failed. Check your input.' })
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with that email already exists.' })
    }
    return res.status(500).json({ message: error.message || 'Unable to register user. Please try again.' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    // Check if MongoDB is connected
    const mongoose = require('mongoose')
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database is not available. Please install and start MongoDB to sign in. The server is running in offline mode.' 
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const passwordMatches = await user.comparePassword(password)
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const token = generateToken(user._id.toString())

    return res.json({
      user: sanitizeUser(user),
      token,
    })
  } catch (error) {
    console.error('Login error:', error.name, error.message, error.stack)
    // Handle MongoDB connection/buffering errors
    if (error.name === 'MongoServerError' || 
        error.message?.includes('MongoServerError') || 
        error.message?.includes('MongooseServerSelectionError') ||
        error.message?.includes('buffering timed out') ||
        error.name === 'MongooseError') {
      return res.status(503).json({ 
        message: 'Database connection failed. MongoDB is not running. Please install and start MongoDB to use this feature.' 
      })
    }
    if (error.message?.includes('JWT_SECRET')) {
      return res.status(500).json({ message: 'Server configuration error. Contact support.' })
    }
    return res.status(500).json({ message: error.message || 'Unable to sign in. Please try again.' })
  }
}

module.exports = {
  register,
  login,
}

