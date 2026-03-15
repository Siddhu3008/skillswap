const express = require('express')
const router = express.Router()
const {
  createDoubt,
  getDoubtsByVideo,
  getDoubtsByTutor,
  answerDoubt,
} = require('../controllers/doubt.controller')

// Create a doubt
router.post('/', createDoubt)

// Get doubts for a specific video
router.get('/video/:videoId', getDoubtsByVideo)

// Get all doubts for a tutor
router.get('/tutor', getDoubtsByTutor)

// Answer a doubt
router.post('/:doubtId/answer', answerDoubt)

module.exports = router






