const Doubt = require('../models/Doubt')
const Video = require('../models/Video')

// Create a new doubt
const createDoubt = async (req, res) => {
  try {
    const { videoId, learnerEmail, learnerName, doubt } = req.body

    if (!videoId || !learnerEmail || !learnerName || !doubt) {
      return res.status(400).json({
        message: 'Video ID, learner email, learner name, and doubt text are required',
      })
    }

    // Verify video exists
    const video = await Video.findById(videoId)
    if (!video) {
      return res.status(404).json({ message: 'Video not found' })
    }

    const newDoubt = new Doubt({
      videoId,
      learnerEmail,
      learnerName,
      doubt: doubt.trim(),
    })

    await newDoubt.save()

    res.status(201).json({
      message: 'Doubt raised successfully',
      doubt: newDoubt,
    })
  } catch (error) {
    console.error('Create doubt error:', error)
    res.status(500).json({
      message: error.message || 'Failed to raise doubt',
    })
  }
}

// Get all doubts for a video
const getDoubtsByVideo = async (req, res) => {
  try {
    const { videoId } = req.params

    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required' })
    }

    const doubts = await Doubt.find({ videoId })
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      doubts,
      total: doubts.length,
      answered: doubts.filter((d) => d.isAnswered).length,
      unanswered: doubts.filter((d) => !d.isAnswered).length,
    })
  } catch (error) {
    console.error('Get doubts error:', error)
    res.status(500).json({
      message: error.message || 'Failed to fetch doubts',
    })
  }
}

// Get all doubts for a tutor (all videos uploaded by tutor)
const getDoubtsByTutor = async (req, res) => {
  try {
    const { tutorName } = req.query

    if (!tutorName) {
      return res.status(400).json({ message: 'Tutor name is required' })
    }

    // Find all videos by this tutor
    const videos = await Video.find({ tutorName }).select('_id')
    const videoIds = videos.map((v) => v._id)

    if (videoIds.length === 0) {
      return res.json({
        doubts: [],
        total: 0,
        answered: 0,
        unanswered: 0,
      })
    }

    const doubts = await Doubt.find({ videoId: { $in: videoIds } })
      .populate('videoId', 'originalName topic level tutorName')
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      doubts,
      total: doubts.length,
      answered: doubts.filter((d) => d.isAnswered).length,
      unanswered: doubts.filter((d) => !d.isAnswered).length,
    })
  } catch (error) {
    console.error('Get tutor doubts error:', error)
    res.status(500).json({
      message: error.message || 'Failed to fetch doubts',
    })
  }
}

// Answer a doubt
const answerDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params
    const { answer, answeredBy } = req.body

    if (!doubtId || !answer || !answeredBy) {
      return res.status(400).json({
        message: 'Doubt ID, answer text, and answered by are required',
      })
    }

    const doubt = await Doubt.findById(doubtId)
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' })
    }

    doubt.answer = answer.trim()
    doubt.answeredBy = answeredBy.trim()
    doubt.answeredAt = new Date()
    doubt.isAnswered = true

    await doubt.save()

    res.json({
      message: 'Doubt answered successfully',
      doubt,
    })
  } catch (error) {
    console.error('Answer doubt error:', error)
    res.status(500).json({
      message: error.message || 'Failed to answer doubt',
    })
  }
}

module.exports = {
  createDoubt,
  getDoubtsByVideo,
  getDoubtsByTutor,
  answerDoubt,
}






