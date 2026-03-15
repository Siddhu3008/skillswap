const User = require('../models/User')

const getTutorDetails = async (req, res) => {
  try {
    const { email } = req.query
    if (!email) {
      return res.status(400).json({ message: 'Tutor email is required.' })
    }

    const tutor = await User.findOne({ email, role: 'tutor' })
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found.' })
    }

    return res.json({
      tutor: {
        fullName: tutor.fullName,
        email: tutor.email,
        createdAt: tutor.createdAt,
        isVerified: tutor.isVerified || false,
      },
    })
  } catch (error) {
    console.error('Tutor details fetch failed:', error)
    return res.status(500).json({ message: 'Unable to fetch tutor details.' })
  }
}

const markTutorAsVerified = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const tutor = await User.findOneAndUpdate(
      { email, role: 'tutor' },
      { isVerified: true },
      { new: true },
    )

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found.' })
    }

    return res.json({ message: 'Tutor verified successfully.', isVerified: true })
  } catch (error) {
    console.error('Tutor verification failed:', error)
    return res.status(500).json({ message: 'Unable to verify tutor.' })
  }
}

module.exports = {
  getTutorDetails,
  markTutorAsVerified,
}
