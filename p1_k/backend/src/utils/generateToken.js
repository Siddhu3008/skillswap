const jwt = require('jsonwebtoken')

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'skillswap-default-secret-key-change-in-production-2024'
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' })
}

module.exports = generateToken






