const { Router } = require('express')
const { createReview, getVideoReviews } = require('../controllers/review.controller')

const router = Router()

router.post('/', createReview)
router.get('/:videoId', getVideoReviews)

module.exports = router

