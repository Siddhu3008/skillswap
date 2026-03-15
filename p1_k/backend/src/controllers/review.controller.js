const Review = require('../models/Review')
const Video = require('../models/Video')

const createReview = async (req, res) => {
  try {
    const { videoId, rating, review, learnerEmail, learnerName } = req.body

    if (!videoId || !rating || !learnerEmail || !learnerName) {
      return res.status(400).json({ message: 'Video ID, rating, learner email, and name are required.' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' })
    }

    const video = await Video.findById(videoId)
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' })
    }

    const existingReview = await Review.findOne({ videoId, learnerEmail })
    if (existingReview) {
      existingReview.rating = rating
      existingReview.review = review || ''
      await existingReview.save()
      return res.json({ review: existingReview, updated: true })
    }

    const newReview = await Review.create({
      videoId,
      learnerEmail,
      learnerName,
      rating,
      review: review || '',
    })

    return res.status(201).json({ review: newReview, updated: false })
  } catch (error) {
    console.error('Review creation failed:', error)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this video.' })
    }
    return res.status(500).json({ message: 'Unable to create review.' })
  }
}

const getVideoReviews = async (req, res) => {
  try {
    const { videoId } = req.params
    const reviews = await Review.find({ videoId }).sort({ createdAt: -1 })
    const averageRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    })
  } catch (error) {
    console.error('Review fetch failed:', error)
    return res.status(500).json({ message: 'Unable to fetch reviews.' })
  }
}

module.exports = {
  createReview,
  getVideoReviews,
}

