const { Router } = require('express')
const { getTutorDetails, markTutorAsVerified } = require('../controllers/tutor.controller')

const router = Router()

router.get('/details', getTutorDetails)
router.post('/verify', markTutorAsVerified)

module.exports = router

