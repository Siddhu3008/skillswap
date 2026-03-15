const mongoose = require('mongoose')
const User = require('./src/models/User')
const Video = require('./src/models/Video')
const Review = require('./src/models/Review')

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap'
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

const viewData = async () => {
  await connectDB()

  console.log('\n' + '='.repeat(60))
  console.log('📊 SKILLSWAP DATABASE SUMMARY')
  console.log('='.repeat(60) + '\n')

  // Users Summary
  const totalUsers = await User.countDocuments()
  const tutors = await User.countDocuments({ role: 'tutor' })
  const learners = await User.countDocuments({ role: 'learner' })
  const verifiedTutors = await User.countDocuments({ role: 'tutor', isVerified: true })

  console.log('👥 USERS:')
  console.log(`   Total Users: ${totalUsers}`)
  console.log(`   Tutors: ${tutors} (${verifiedTutors} verified)`)
  console.log(`   Learners: ${learners}`)
  
  if (totalUsers > 0) {
    console.log('\n   Recent Users:')
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5)
    recentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.fullName} (${user.email}) - ${user.role}${user.isVerified ? ' ✓' : ''}`)
    })
  }

  // Videos Summary
  const totalVideos = await Video.countDocuments()
  const videosByLevel = {
    Beginner: await Video.countDocuments({ level: 'Beginner' }),
    Intermediate: await Video.countDocuments({ level: 'Intermediate' }),
    Pro: await Video.countDocuments({ level: 'Pro' }),
  }
  const totalViews = await Video.aggregate([
    { $group: { _id: null, total: { $sum: '$views' } } }
  ])
  const totalViewsCount = totalViews.length > 0 ? totalViews[0].total : 0

  console.log('\n📹 VIDEOS:')
  console.log(`   Total Videos: ${totalVideos}`)
  console.log(`   Beginner: ${videosByLevel.Beginner}`)
  console.log(`   Intermediate: ${videosByLevel.Intermediate}`)
  console.log(`   Pro: ${videosByLevel.Pro}`)
  console.log(`   Total Views: ${totalViewsCount}`)

  if (totalVideos > 0) {
    console.log('\n   Recent Videos:')
    const recentVideos = await Video.find().sort({ createdAt: -1 }).limit(5)
    recentVideos.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.originalName}`)
      console.log(`      Topic: ${video.topic} | Level: ${video.level} | Tutor: ${video.tutorName}`)
      console.log(`      Views: ${video.views} | Size: ${(video.size / 1024 / 1024).toFixed(2)} MB`)
    })
  }

  // Reviews Summary
  const totalReviews = await Review.countDocuments()
  const avgRating = await Review.aggregate([
    { $group: { _id: null, avg: { $avg: '$rating' } } }
  ])
  const avgRatingValue = avgRating.length > 0 ? avgRating[0].avg.toFixed(2) : '0.00'

  console.log('\n⭐ REVIEWS:')
  console.log(`   Total Reviews: ${totalReviews}`)
  console.log(`   Average Rating: ${avgRatingValue}/5.0`)

  if (totalReviews > 0) {
    const ratingDistribution = {
      5: await Review.countDocuments({ rating: 5 }),
      4: await Review.countDocuments({ rating: 4 }),
      3: await Review.countDocuments({ rating: 3 }),
      2: await Review.countDocuments({ rating: 2 }),
      1: await Review.countDocuments({ rating: 1 }),
    }
    console.log('\n   Rating Distribution:')
    Object.entries(ratingDistribution).reverse().forEach(([rating, count]) => {
      const stars = '★'.repeat(parseInt(rating))
      console.log(`   ${stars} (${rating}): ${count}`)
    })

    console.log('\n   Recent Reviews:')
    const recentReviews = await Review.find().sort({ createdAt: -1 }).limit(5)
    recentReviews.forEach((review, index) => {
      console.log(`   ${index + 1}. ${review.learnerName} - ${'★'.repeat(review.rating)}`)
      if (review.review) {
        console.log(`      "${review.review.substring(0, 50)}${review.review.length > 50 ? '...' : ''}"`)
      }
    })
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Summary Complete!')
  console.log('='.repeat(60) + '\n')

  await mongoose.connection.close()
  process.exit(0)
}

viewData().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})






