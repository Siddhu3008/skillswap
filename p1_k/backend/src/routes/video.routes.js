const { Router } = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { uploadVideo, listVideos, deleteVideo, incrementViews } = require('../controllers/video.controller')

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'videos')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    const ext = path.extname(file.originalname) || '.mp4'
    cb(null, `${uniqueSuffix}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB
})

const router = Router()

router.get('/', listVideos)
router.post('/', upload.single('video'), uploadVideo)
router.delete('/:videoId', deleteVideo)
router.post('/:videoId/views', incrementViews)

// Error handling for multer
router.use((error, req, res, next) => {
  if (error && error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Video file exceeds 250MB limit.' })
    }
    return res.status(400).json({ message: `Upload error: ${error.message}` })
  }
  next(error)
})

module.exports = router

