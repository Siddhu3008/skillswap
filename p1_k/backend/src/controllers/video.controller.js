const path = require('path')
const fs = require('fs')
const Video = require('../models/Video')
const User = require('../models/User')
const Review = require('../models/Review')

const ensureUploadDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Video file is required.' })
    }

    const { topic, level, category, tutor } = req.body

    if (!topic || !level || !category) {
      return res.status(400).json({
        message: 'Topic, level, and category are required metadata.',
      })
    }

    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'videos')
    ensureUploadDir(uploadsDir)

    // Check for duplicate video (same original name, topic, level, and tutor)
    const existingVideo = await Video.findOne({
      originalName: req.file.originalname,
      topic,
      level,
      tutorName: tutor ?? 'SkillSwap Tutor',
    })

    if (existingVideo) {
      return res.status(409).json({
        message: `This video "${req.file.originalname}" has already been uploaded for ${topic} (${level}).`,
        duplicate: true,
      })
    }

    const savedVideo = await Video.create({
      topic,
      level,
      category,
      tutorName: tutor ?? 'SkillSwap Tutor',
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/videos/${req.file.filename}`,
    })

    console.log(`✅ Video uploaded: ${savedVideo.originalName} (${savedVideo.topic}, ${savedVideo.level})`)
    return res.status(201).json({ video: savedVideo })
  } catch (error) {
    console.error('Video upload failed:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }
    if (error.name === 'MongoServerError' || error.message?.includes('MongoServerError')) {
      return res.status(503).json({ message: 'Database connection failed. Check MongoDB.' })
    }
    return res.status(500).json({ message: 'Unable to store video. Please try again.' })
  }
}

const listVideos = async (req, res) => {
  try {
    const { topic, level, page = 1, limit = 10, tutorName } = req.query
    const query = {}

    if (topic) query.topic = topic
    if (level) query.level = level
    if (tutorName) query.tutorName = tutorName

    // Check if MongoDB is connected
    const mongoose = require('mongoose')
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        videos: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 1,
        },
      })
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const videos = await Video.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
    const total = await Video.countDocuments(query)

    // Get tutor details and average ratings for each video
    const videosWithDetails = await Promise.all(
      videos.map(async (video) => {
        const tutor = await User.findOne({ fullName: video.tutorName, role: 'tutor' }).catch(() => null)
        const reviews = await Review.find({ videoId: video._id })
        const avgRating = reviews.length
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0

        return {
          ...video.toObject(),
          tutorDetails: tutor
            ? {
                fullName: tutor.fullName,
                email: tutor.email,
                createdAt: tutor.createdAt,
              }
            : {
                fullName: video.tutorName,
                email: null,
                createdAt: null,
              },
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
          views: video.views || 0,
        }
      }),
    )

    return res.json({
      videos: videosWithDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error('Video fetch failed:', error)
    // If MongoDB is not connected, return empty results instead of error
    if (error.name === 'MongooseServerSelectionError' || error.message?.includes('MongoServerError')) {
      return res.json({
        videos: [],
        pagination: {
          page: parseInt(req.query.page || 1),
          limit: parseInt(req.query.limit || 10),
          total: 0,
          pages: 1,
        },
      })
    }
    return res.status(500).json({ message: 'Unable to fetch videos.' })
  }
}

const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params
    const { tutorName } = req.query

    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required.' })
    }

    const video = await Video.findById(videoId)
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' })
    }

    if (tutorName && video.tutorName !== tutorName) {
      return res.status(403).json({ message: 'You can only delete your own videos.' })
    }

    // Delete the file from disk
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'videos', video.fileName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Delete video from database
    await Video.findByIdAndDelete(videoId)

    // Delete associated reviews
    const Review = require('../models/Review')
    await Review.deleteMany({ videoId })

    return res.json({ message: 'Video deleted successfully.' })
  } catch (error) {
    console.error('Video deletion failed:', error)
    return res.status(500).json({ message: 'Unable to delete video.' })
  }
}

const incrementViews = async (req, res) => {
  try {
    const { videoId } = req.params
    const video = await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true })
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' })
    }
    return res.json({ views: video.views })
  } catch (error) {
    console.error('View increment failed:', error)
    return res.status(500).json({ message: 'Unable to increment views.' })
  }
}

module.exports = {
  uploadVideo,
  listVideos,
  deleteVideo,
  incrementViews,
}

