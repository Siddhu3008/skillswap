import { useCallback, useEffect, useMemo, useState } from 'react'
import Tesseract from 'tesseract.js'
import './App.css'

const EMAIL_STORAGE_KEY = 'skillswap_emails'
const LEARNER_PROFILE_KEY = 'skillswap_learner_profile'
const EMAIL_ROLE_KEY = 'skillswap_email_roles' // Store email -> role mapping
const RESET_VERSION_KEY = 'skillswap_reset_version'
const STORAGE_RESET_VERSION = 'reset-2025-12-02'
const API_BASE_URL = 'http://localhost:5000'
const difficultyLevels = ['Beginner', 'Intermediate', 'Pro']

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'learner',
}

const tutorCourses = [
  'Full-stack web development',
  'Data structures & algorithms',
  'Cloud fundamentals',
  'UI/UX for developers',
  'Data science foundations',
  'Soft skills for tech mentors',
]

const tutorTechnologies = [
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'Python',
  'TensorFlow',
  'AWS',
  'Docker',
  'PostgreSQL',
  'TypeScript',
]

const topicCatalog = [
  'Frontend architecture',
  'Backend APIs',
  'CI/CD pipelines',
  'Product analytics',
  'Agile coaching',
  'DevOps culture',
  'Cybersecurity basics',
  'Machine learning ops',
  'Prompt engineering',
  'Database design',
  'Mobile development',
  'Serverless systems',
]

const learnerTopicLibrary = [
  ...tutorCourses.map((label) => ({ label, category: 'Course' })),
  ...tutorTechnologies.map((label) => ({ label, category: 'Technology' })),
  ...topicCatalog.map((label) => ({ label, category: 'Workshop' })),
]

const uniqueLearnerTopics = Array.from(
  new Map(learnerTopicLibrary.map((topic) => [topic.label, topic])).values(),
)

const learnerProfileTemplate = {
  name: '',
  educationType: '',
  college: '',
  courseName: '',
}

const deriveCertifiedTopics = (text) => {
  if (!text) {
    return ['General pedagogy', 'Professional communication']
  }

  const pairs = [
    { regex: /data|analytics|statistics/i, topics: ['Data analytics', 'Statistics fundamentals'] },
    { regex: /cloud|aws|azure|gcp/i, topics: ['Cloud infrastructure', 'DevOps readiness'] },
    { regex: /ai|artificial intelligence|ml|machine learning/i, topics: ['AI literacy', 'Machine learning'] },
    { regex: /web|react|frontend/i, topics: ['Modern frontend', 'Component-driven UI'] },
    { regex: /python|java|node/i, topics: ['Programming best practices', 'Backend craftsmanship'] },
    { regex: /security|ethical/i, topics: ['Application security', 'Ethical mentoring'] },
  ]

  const matched = pairs
    .filter(({ regex }) => regex.test(text))
    .flatMap(({ topics }) => topics)

  if (matched.length) return matched.slice(0, 6)

  return ['Curriculum design', 'Learner engagement', 'Assessment strategy']
}

const mockAuthRequest = (payload) =>
  new Promise((resolve) => {
    const randomId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `mock-${Date.now()}-${Math.round(Math.random() * 1e5)}`

    setTimeout(() => {
      resolve({
        user: {
          id: randomId,
          fullName:
            payload.fullName ||
            (payload.role === 'tutor' ? 'SkillSwap Tutor' : 'SkillSwap Learner'),
          email: payload.email,
          role: payload.role,
          createdAt: new Date().toISOString(),
        },
        token: 'mock-token',
      })
    }, 650)
  })

function App() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [stage, setStage] = useState('auth') // auth | verify | skills | complete | dashboard | learnerProfile | learnerCatalog | learnerVideos
  const [user, setUser] = useState(null)
  const [validatedTopics, setValidatedTopics] = useState([])
  const [certificateStatus, setCertificateStatus] = useState({
    state: 'idle',
    message: '',
    text: '',
  })
  const [skills, setSkills] = useState({
    courses: [],
    technologies: [],
    topics: [],
  })
  const [savedEmails, setSavedEmails] = useState([])
  const [emailRoles, setEmailRoles] = useState({}) // Store email -> role mapping
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [uploadedVideos, setUploadedVideos] = useState([])
  const [pendingUploads, setPendingUploads] = useState([])
  const [uploadStatus, setUploadStatus] = useState({ state: 'idle', message: '' })
  const [learnerProfile, setLearnerProfile] = useState(learnerProfileTemplate)
  const [learnerSelection, setLearnerSelection] = useState({
    topic: '',
    level: '',
  })
  const [learnerVideos, setLearnerVideos] = useState([])
  const [isFetchingLearnerVideos, setIsFetchingLearnerVideos] = useState(false)
  const [tutorVideosLoading, setTutorVideosLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showVideoPopup, setShowVideoPopup] = useState(false)
  const [selectedTutorProfile, setSelectedTutorProfile] = useState(null)
  const [showTutorProfile, setShowTutorProfile] = useState(false)
  const [videoPage, setVideoPage] = useState(1)
  const [videoPagination, setVideoPagination] = useState({ page: 1, total: 0, pages: 1 })
  const [videoRating, setVideoRating] = useState(0)
  const [videoReview, setVideoReview] = useState('')
  const [videoReviews, setVideoReviews] = useState([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [loginTime, setLoginTime] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showUploadedVideos, setShowUploadedVideos] = useState(false)
  const [tutorUploadedVideos, setTutorUploadedVideos] = useState([])
  const [expandedVideoReviews, setExpandedVideoReviews] = useState({})
  const [tutorExtraDetails, setTutorExtraDetails] = useState({
    bio: '',
    experience: '',
    specialization: '',
    contact: '',
  })
  const [videoDoubts, setVideoDoubts] = useState([])
  const [doubtText, setDoubtText] = useState('')
  const [showDoubtForm, setShowDoubtForm] = useState(false)
  const [answeringDoubtId, setAnsweringDoubtId] = useState(null)
  const [doubtAnswer, setDoubtAnswer] = useState('')
  const [tutorDoubts, setTutorDoubts] = useState([])
  const [tutorDoubtsLoading, setTutorDoubtsLoading] = useState(false)
  const [expandedVideoDoubts, setExpandedVideoDoubts] = useState({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    const currentVersion = localStorage.getItem(RESET_VERSION_KEY)
    if (currentVersion !== STORAGE_RESET_VERSION) {
      localStorage.removeItem(EMAIL_STORAGE_KEY)
      localStorage.removeItem(EMAIL_ROLE_KEY)
      localStorage.removeItem(LEARNER_PROFILE_KEY)
      sessionStorage.clear()
      localStorage.setItem(RESET_VERSION_KEY, STORAGE_RESET_VERSION)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEY)) ?? []
      if (Array.isArray(stored)) {
        setSavedEmails(stored)
      }
    } catch {
      setSavedEmails([])
    }
    try {
      const storedRoles = JSON.parse(localStorage.getItem(EMAIL_ROLE_KEY)) ?? {}
      setEmailRoles(storedRoles)
    } catch {
      setEmailRoles({})
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const storedProfile = JSON.parse(localStorage.getItem(LEARNER_PROFILE_KEY))
      if (storedProfile) {
        setLearnerProfile(storedProfile)
      }
    } catch {
      setLearnerProfile(learnerProfileTemplate)
    }
  }, [])

  useEffect(() => {
    const fetchLearnerVideos = async () => {
      if (!learnerSelection.topic || !learnerSelection.level) return
      try {
        setIsFetchingLearnerVideos(true)
        const response = await fetch(
          `${API_BASE_URL}/api/videos?topic=${encodeURIComponent(learnerSelection.topic)}&level=${learnerSelection.level}&page=${videoPage}&limit=6`,
        )
        if (!response.ok) {
          throw new Error('Unable to fetch videos for this track.')
        }
        const data = await response.json()
        setLearnerVideos(data.videos ?? [])
        setVideoPagination(data.pagination ?? { page: 1, total: 0, pages: 1 })
      } catch (error) {
        console.error('Learner video fetch failed:', error)
        setLearnerVideos([])
      } finally {
        setIsFetchingLearnerVideos(false)
      }
    }

    if (stage === 'learnerVideos' && learnerSelection.topic && learnerSelection.level) {
      fetchLearnerVideos()
    } else if (stage !== 'learnerVideos') {
      setLearnerVideos([])
      setVideoPage(1)
    }
  }, [stage, learnerSelection.level, learnerSelection.topic, videoPage])

  useEffect(() => {
    setPendingUploads([])
    setUploadStatus({ state: 'idle', message: '' })
  }, [selectedTopic?.label, selectedLevel])

  useEffect(() => {
    // Clear form when returning to auth stage
    if (stage === 'auth') {
      setForm(initialForm)
    }
  }, [stage])

  const rememberEmail = (email, role = null) => {
    if (!email) return
    setSavedEmails((prev) => {
      const updated = [email, ...prev.filter((entry) => entry !== email)].slice(0, 3)
      if (typeof window !== 'undefined') {
        localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(updated))
      }
      return updated
    })
    // Store email -> role mapping
    if (role && typeof window !== 'undefined') {
      setEmailRoles((prev) => {
        const updated = { ...prev, [email]: role }
        localStorage.setItem(EMAIL_ROLE_KEY, JSON.stringify(updated))
        return updated
      })
    }
  }

  const isRegister = mode === 'register'
  const actionLabel = isRegister ? 'Create account' : 'Access dashboard'

  const endpoint = useMemo(
    () => (isRegister ? '/api/auth/register' : '/api/auth/login'),
    [isRegister],
  )

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const loadStoredLearnerProfile = () => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(LEARNER_PROFILE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const handleLogout = () => {
    setUser(null)
    setLoginTime(null)
    setShowProfileMenu(false)
    setTutorExtraDetails({ bio: '', experience: '', specialization: '', contact: '' })
    resetFlow()
  }

  const resetFlow = () => {
    setForm(initialForm)
    setStatus({ type: 'idle', message: '' })
    setStage('auth')
    setUser(null)
    setValidatedTopics([])
    setCertificateStatus({ state: 'idle', message: '', text: '' })
    setSkills({ courses: [], technologies: [], topics: [] })
    setSelectedTopic(null)
    setSelectedLevel(null)
    setUploadedVideos([])
    setPendingUploads([])
    setUploadStatus({ state: 'idle', message: '' })
    setLearnerVideos([])
    setIsFetchingLearnerVideos(false)
    setLearnerSelection({ topic: '', level: '' })

    const storedProfile = loadStoredLearnerProfile()
    if (storedProfile) {
      setLearnerProfile(storedProfile)
    } else {
      setLearnerProfile(learnerProfileTemplate)
    }
  }

  const handleAuthSuccess = (authUser, source = 'live') => {
    setUser(authUser)
    setLoginTime(new Date().toISOString())
    // Remember email and role
    rememberEmail(form.email, authUser.role)

    const suffix = source === 'mock' ? ' (preview mode)' : ''
    const successMessage = isRegister
      ? `Registration successful${suffix} — redirecting to onboarding.`
      : `Welcome back${suffix}! Redirecting to your dashboard.`

    if (authUser.role === 'tutor') {
      if (authUser.isVerified) {
        setStage('dashboard')
        setStatus({
          type: 'success',
          message: `Welcome back${suffix}! You're already verified.`,
        })
      } else {
        setStage('verify')
        setStatus({
          type: 'success',
          message: `Authentication verified${suffix}! Upload your certificates next.`,
        })
      }
    } else {
      const storedProfile = loadStoredLearnerProfile()
      if (storedProfile) {
        setLearnerProfile(storedProfile)
        setStage('learnerCatalog')
      } else {
        setLearnerProfile(learnerProfileTemplate)
        setStage('learnerProfile')
      }
      setStatus({ type: 'success', message: successMessage })
      setLearnerSelection({ topic: '', level: '' })
    }

    setForm(initialForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isRegister && form.password !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords need to match.' })
      return
    }

    setStatus({ type: 'loading', message: 'Securing your session...' })

    const payload = {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      role: form.role,
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || 'Something went wrong. Please try again.'
        throw new Error(errorMessage)
      }

      const result = await response.json()

      // Placeholder for navigation/token handling
      console.info('Auth result:', result)
      handleAuthSuccess(result.user, 'live')
    } catch (error) {
      console.error('Auth API call failed:', error)
      const shouldMock =
        error?.message?.toLowerCase().includes('failed to fetch') ||
        error?.name === 'TypeError'

      if (shouldMock) {
        setStatus({
          type: 'loading',
          message: 'API unreachable. Switching to offline preview...',
        })
        const mock = await mockAuthRequest(payload)
        handleAuthSuccess(mock.user, 'mock')
        return
      }

      setStatus({
        type: 'error',
        message: error.message ?? 'Unable to reach SkillSwap servers.',
      })
    }
  }

  const handleCertificateUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCertificateStatus({
      state: 'processing',
      message: 'Analyzing certificate via OCR...',
      text: '',
    })

    try {
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setCertificateStatus((prev) => ({
              ...prev,
              message: `Scanning text (${Math.round(m.progress * 100)}%)`,
            }))
          }
        },
      })

      const text = data?.text?.trim() ?? ''
      const isValid = /certificate|certified|degree|diploma|license|licence/i.test(text)

      if (isValid) {
        setCertificateStatus({
          state: 'success',
          message: 'Certificate validated! Moving you to skills selection.',
          text,
        })
        setValidatedTopics(deriveCertifiedTopics(text))
        // Mark tutor as verified in backend
        if (user?.email) {
          try {
            await fetch(`${API_BASE_URL}/api/tutor/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email }),
            })
          } catch (error) {
            console.error('Failed to mark tutor as verified:', error)
          }
        }
        setTimeout(() => setStage('skills'), 1200)
      } else {
        setCertificateStatus({
          state: 'error',
          message:
            'We could not verify this proof. Please upload another certificate or a clearer copy.',
          text,
        })
      }
    } catch (error) {
      console.error('Tesseract verification failed:', error)
      setCertificateStatus({
        state: 'error',
        message:
          'OCR failed. Try a higher-resolution scan or a PDF/JPG under 5MB.',
        text: '',
      })
    }
  }

  const toggleSkill = (type, value) => {
    setSkills((previous) => {
      const exists = previous[type].includes(value)
      return {
        ...previous,
        [type]: exists
          ? previous[type].filter((entry) => entry !== value)
          : [...previous[type], value],
      }
    })
  }

  const handleLearnerProfileChange = (field, value) => {
    setLearnerProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLearnerProfileSubmit = (event) => {
    event.preventDefault()
    if (!learnerProfile.name || !learnerProfile.educationType) {
      setStatus({
        type: 'error',
        message: 'Please share at least your name and education type.',
      })
      return
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(LEARNER_PROFILE_KEY, JSON.stringify(learnerProfile))
    }

    setLearnerSelection({ topic: '', level: '' })
    setStage('learnerCatalog')
    setStatus({ type: 'success', message: 'Profile saved — explore courses below.' })
  }

  const selectLearnerTopic = (label) => {
    setLearnerSelection({
      topic: label,
      level: '',
    })
    setVideoPage(1)
  }


  const openVideoPopup = (video) => {
    setSelectedVideo(video)
    setShowVideoPopup(true)
    fetchVideoReviews(video._id)
    fetchVideoDoubts(video._id)
  }

  const fetchVideoReviews = async (videoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${videoId}`)
      if (response.ok) {
        const data = await response.json()
        setVideoReviews(data.reviews ?? [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }

  const fetchVideoDoubts = async (videoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doubts/video/${videoId}`)
      if (response.ok) {
        const data = await response.json()
        setVideoDoubts(data.doubts ?? [])
      }
    } catch (error) {
      console.error('Failed to fetch doubts:', error)
    }
  }

  const submitDoubt = async () => {
    if (!selectedVideo || !doubtText.trim() || !user) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/doubts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: selectedVideo._id,
          learnerEmail: user.email,
          learnerName: user.fullName,
          doubt: doubtText.trim(),
        }),
      })

      if (response.ok) {
        setDoubtText('')
        setShowDoubtForm(false)
        await fetchVideoDoubts(selectedVideo._id)
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.message || 'Failed to submit doubt')
      }
    } catch (error) {
      console.error('Failed to submit doubt:', error)
      alert('Failed to submit doubt. Please try again.')
    }
  }

  const submitDoubtAnswer = async (doubtId) => {
    if (!doubtAnswer.trim() || !user) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/doubts/${doubtId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: doubtAnswer.trim(),
          answeredBy: user.fullName,
        }),
      })

      if (response.ok) {
        setDoubtAnswer('')
        setAnsweringDoubtId(null)
        if (selectedVideo) {
          await fetchVideoDoubts(selectedVideo._id)
        }
        // Refresh tutor doubts if in dashboard
        if (user && user.role === 'tutor') {
          await fetchTutorDoubts()
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.message || 'Failed to submit answer')
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      alert('Failed to submit answer. Please try again.')
    }
  }

  const fetchTutorDoubts = async () => {
    if (!user || user.role !== 'tutor') return
    try {
      setTutorDoubtsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/doubts/tutor?tutorName=${encodeURIComponent(user.fullName)}`)
      if (response.ok) {
        const data = await response.json()
        setTutorDoubts(data.doubts ?? [])
      }
    } catch (error) {
      console.error('Failed to fetch tutor doubts:', error)
    } finally {
      setTutorDoubtsLoading(false)
    }
  }

  const toggleVideoDoubts = (videoId) => {
    setExpandedVideoDoubts((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }))
  }

  const submitReview = async () => {
    if (!selectedVideo || !videoRating || !user) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: selectedVideo._id,
          rating: videoRating,
          review: videoReview,
          learnerEmail: user.email,
          learnerName: user.fullName,
        }),
      })

      if (response.ok) {
        await fetchVideoReviews(selectedVideo._id)
        setVideoRating(0)
        setVideoReview('')
        setShowReviewModal(false)
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
    }
  }

  const openTutorProfile = async (tutorEmail) => {
    if (!tutorEmail) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/tutor/details?email=${encodeURIComponent(tutorEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedTutorProfile(data.tutor)
        setShowTutorProfile(true)
      }
    } catch (error) {
      console.error('Failed to fetch tutor details:', error)
    }
  }

  const fetchTutorVideosWithReviews = async () => {
    if (!user || user.role !== 'tutor') return
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos?tutorName=${encodeURIComponent(user.fullName)}&limit=1000`)
      if (response.ok) {
        const data = await response.json()
        const videosWithReviews = await Promise.all(
          (data.videos || []).map(async (video) => {
            const reviewResponse = await fetch(`${API_BASE_URL}/api/reviews/${video._id}`)
            const reviewData = reviewResponse.ok ? await reviewResponse.json() : { reviews: [], averageRating: 0 }
            return {
              ...video,
              reviews: reviewData.reviews || [],
              averageRating: reviewData.averageRating || 0,
              reviewCount: reviewData.totalReviews || 0,
              views: video.views || 0,
            }
          }),
        )
        setTutorUploadedVideos(videosWithReviews)
      }
    } catch (error) {
      console.error('Failed to fetch tutor videos:', error)
    }
  }

  const deleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/videos/${videoId}?tutorName=${encodeURIComponent(user?.fullName || '')}`,
        { method: 'DELETE' },
      )
      if (response.ok) {
        await fetchTutorVideosWithReviews()
        if (stage === 'dashboard') {
          await refreshTutorVideos()
        }
      } else {
        alert('Failed to delete video. Please try again.')
      }
    } catch (error) {
      console.error('Failed to delete video:', error)
      alert('Failed to delete video. Please try again.')
    }
  }

  const toggleVideoReviews = (videoId) => {
    setExpandedVideoReviews((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }))
  }

  const selectLearnerLevel = (level) => {
    setLearnerSelection((prev) => ({
      ...prev,
      level,
    }))
    setVideoPage(1)
    // Navigate to videos page
    setStage('learnerVideos')
  }

  const editLearnerProfile = () => {
    setStage('learnerProfile')
    setStatus({ type: 'idle', message: '' })
  }

  const readyForSummary =
    skills.courses.length > 0 &&
    skills.technologies.length > 0 &&
    skills.topics.length > 0

  const finalizeTutorProfile = () => {
    setStage('complete')
  }

  const openDashboard = () => {
    setStage('dashboard')
  }

  const allTutorTopics = [
    ...skills.courses.map((course) => ({ label: course, category: 'Course' })),
    ...skills.technologies.map((tech) => ({ label: tech, category: 'Technology' })),
    ...skills.topics.map((topic) => ({ label: topic, category: 'Workshop' })),
  ]

  const handleVideoUpload = (event) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    if (!selectedTopic || !selectedLevel) {
      setUploadStatus({
        state: 'error',
        message: 'Pick a topic and difficulty level before staging videos.',
      })
      return
    }

    setPendingUploads((prev) => [...prev, ...files])
    setUploadStatus({ state: 'idle', message: '' })
    event.target.value = ''
  }

  const refreshTutorVideos = useCallback(async () => {
    if (!selectedTopic || !selectedLevel) return
    try {
      setTutorVideosLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/api/videos?topic=${encodeURIComponent(selectedTopic.label)}&level=${selectedLevel}&tutorName=${encodeURIComponent(user?.fullName || '')}`,
      )
      if (!response.ok) {
        throw new Error('Unable to fetch uploaded videos.')
      }
      const data = await response.json()
      const videosWithReviews = await Promise.all(
        (data.videos || []).map(async (video) => {
          try {
            const reviewResponse = await fetch(`${API_BASE_URL}/api/reviews/${video._id}`)
            const reviewData = reviewResponse.ok ? await reviewResponse.json() : { reviews: [], averageRating: 0 }
            return {
              ...video,
              reviews: reviewData.reviews || [],
              averageRating: reviewData.averageRating || 0,
              reviewCount: reviewData.totalReviews || 0,
              views: video.views || 0,
            }
          } catch {
            return { ...video, reviews: [], averageRating: 0, reviewCount: 0 }
          }
        }),
      )
      setUploadedVideos(videosWithReviews)
    } catch (error) {
      console.error('Tutor videos fetch failed:', error)
    } finally {
      setTutorVideosLoading(false)
    }
  }, [selectedTopic, selectedLevel, user])

  const submitPendingUploads = async () => {
    if (!pendingUploads.length) {
      setUploadStatus({ state: 'error', message: 'Select at least one video to upload.' })
      return
    }

    if (!selectedTopic || !selectedLevel) {
      setUploadStatus({
        state: 'error',
        message: 'Choose a topic and difficulty before uploading.',
      })
      return
    }

    setUploadStatus({ state: 'loading', message: 'Uploading videos to SkillSwap...' })

    try {
      for (const file of pendingUploads) {
        const formData = new FormData()
        formData.append('video', file)
        formData.append('topic', selectedTopic.label)
        formData.append('level', selectedLevel)
        formData.append('category', selectedTopic.category)
        formData.append('tutor', user?.fullName || 'SkillSwap Tutor')

        const response = await fetch(`${API_BASE_URL}/api/videos`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          if (response.status === 409 && errorData.duplicate) {
            throw new Error(errorData.message || 'This video has already been uploaded for this topic and level.')
          }
          throw new Error(errorData.message || 'Upload failed. Please try again.')
        }
      }

      setPendingUploads([])
      setUploadStatus({
        state: 'success',
        message: 'Videos stored! Learners will see them once approved.',
      })
      await refreshTutorVideos()
    } catch (error) {
      console.error('Video upload failed:', error)
      const isNetworkError =
        error?.message?.toLowerCase().includes('failed to fetch') ||
        error?.name === 'TypeError' ||
        error?.message?.toLowerCase().includes('network')
      
      if (isNetworkError) {
        setUploadStatus({
          state: 'error',
          message: 'Unable to reach SkillSwap servers. Make sure the backend is running on port 5000.',
        })
      } else {
        const errorMessage = error.message ?? 'Upload failed. Please check your connection and try again.'
        const isDuplicate = errorMessage.toLowerCase().includes('already been uploaded') || errorMessage.toLowerCase().includes('duplicate')
        setUploadStatus({
          state: isDuplicate ? 'warning' : 'error',
          message: errorMessage,
        })
      }
    }
  }

  const removePendingUpload = (indexToRemove) => {
    setPendingUploads((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  useEffect(() => {
    if (stage === 'dashboard' && selectedTopic && selectedLevel) {
      refreshTutorVideos()
    }
  }, [stage, selectedTopic, selectedLevel, refreshTutorVideos])

  useEffect(() => {
    if (stage === 'dashboard' && user && user.role === 'tutor') {
      fetchTutorDoubts()
    }
  }, [stage, user])

  const renderStagePanel = () => {
    if (stage === 'verify') {
  return (
        <section className="flex-1 rounded-2xl border border-amber-100 bg-white/90 p-6 shadow-glow">
          <button
            type="button"
            onClick={() => {
              handleLogout()
              setStage('auth')
            }}
            className="mb-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            ← Back to Login
          </button>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
              Tutor Verification
            </p>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              Upload professional proof
            </h2>
            <p className="text-sm text-slate-500">
              We rely on OCR (Tesseract) to validate the authenticity of your
              certificates. Clear scans with signatures and authority stamps
              are verified faster.
            </p>
          </div>

          <label
            htmlFor="certificateUpload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-brand-200 bg-brand-50/60 px-6 py-12 text-center transition hover:border-brand-400 hover:bg-brand-50"
          >
            <span className="text-4xl">📄</span>
            <p className="mt-3 font-semibold text-slate-900">
              Drag & drop certification proof
            </p>
            <p className="text-sm text-slate-500">
              Accepted formats: PDF, PNG, JPG (max 5MB)
            </p>
            <input
              id="certificateUpload"
              type="file"
              className="hidden"
              accept=".pdf,image/*"
              onChange={handleCertificateUpload}
            />
          </label>

          {certificateStatus.state !== 'idle' && (
            <div
              className={`mt-4 rounded-2xl border p-4 text-sm ${
                certificateStatus.state === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : certificateStatus.state === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-brand-200 bg-brand-50 text-brand-700'
              }`}
            >
              <p className="font-semibold">{certificateStatus.message}</p>
              {certificateStatus.text && (
                <p className="mt-2 line-clamp-3 text-xs opacity-80">
                  OCR excerpt: {certificateStatus.text}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
            <button type="button" onClick={resetFlow} className="font-semibold text-slate-900">
              ← Back to login
            </button>
            <p>Need help? compliance@skillswap.com</p>
          </div>
        </section>
      )
    }

    if (stage === 'skills') {
      return (
        <section className="flex-1 space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-glow">
          <button
            type="button"
            onClick={() => setStage('verify')}
            className="mb-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            ← Back
          </button>
      <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
              Tutor stack
            </p>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              What do you love teaching?
            </h2>
            <p className="text-sm text-slate-500">
              Pick at least one course and one technology so learners can match
              with you confidently.
            </p>
      </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Verified mastery
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              Topics confirmed from your certificate
            </h3>
            <p className="text-sm text-slate-500">
              These were inferred by scanning the uploaded proof via Tesseract OCR.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {validatedTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-600 shadow-sm"
                >
                  {topic}
                </span>
              ))}
              {!validatedTopics.length && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                  Awaiting verified topics...
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Signature courses</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {tutorCourses.map((course) => {
                const active = skills.courses.includes(course)
                return (
                  <button
                    key={course}
                    type="button"
                    onClick={() => toggleSkill('courses', course)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${active ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-slate-200 text-slate-600 hover:border-brand-200'}`}
                  >
                    {course}
        </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Tech fluency</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {tutorTechnologies.map((tech) => {
                const active = skills.technologies.includes(tech)
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleSkill('technologies', tech)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 text-slate-600 hover:border-brand-200'}`}
                  >
                    {tech}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Topic catalog</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Deep dives & workshops
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topicCatalog.map((topic) => {
                const active = skills.topics.includes(topic)
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleSkill('topics', topic)}
                    className={`rounded-2xl border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide transition ${
                      active
                        ? 'border-brand-500 bg-brand-100 text-brand-800'
                        : 'border-slate-200 text-slate-500 hover:border-brand-200'
                    }`}
                  >
                    {topic}
                  </button>
                )
              })}
      </div>
          </div>

          <button
            type="button"
            disabled={!readyForSummary}
            onClick={finalizeTutorProfile}
            className={`w-full rounded-2xl px-6 py-3 text-base font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${
              readyForSummary
                ? 'bg-slate-900 hover:bg-slate-800'
                : 'cursor-not-allowed bg-slate-300'
            }`}
          >
            {readyForSummary ? 'Publish tutor profile' : 'Select your stack'}
          </button>

          <p className="text-center text-xs text-slate-500">
            You can edit these later from the tutor dashboard.
          </p>
        </section>
      )
    }

    if (stage === 'complete') {
      return (
        <section className="flex-1 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-glow">
          <button
            type="button"
            onClick={() => setStage('skills')}
            className="mb-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            ← Back
          </button>
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Tutor profile ready
            </p>
            <h2 className="font-display text-3xl font-semibold text-emerald-900">
              Verification complete, {user?.fullName?.split(' ')[0] ?? 'mentor'}!
            </h2>
            <p className="text-sm text-emerald-700">
              Learners can now request sessions based on your certified focus
              areas. Check your inbox for onboarding next steps.
            </p>
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-sm font-semibold text-slate-800">Courses</p>
              <p className="text-sm text-slate-600">
                {skills.courses.join(', ')}
              </p>
              <p className="mt-4 text-sm font-semibold text-slate-800">Technologies</p>
              <p className="text-sm text-slate-600">
                {skills.technologies.join(', ')}
              </p>
              <p className="mt-4 text-sm font-semibold text-slate-800">Workshop topics</p>
              <p className="text-sm text-slate-600">
                {skills.topics.join(', ')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetFlow}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Log out
              </button>
              <button
                type="button"
                onClick={openDashboard}
                className="flex-1 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to tutor dashboard →
              </button>
            </div>
          </div>
        </section>
      )
    }

    if (stage === 'learnerProfile') {
      const initial = learnerProfile.name
        ? learnerProfile.name.charAt(0).toUpperCase()
        : '👤'

      return (
        <section className="flex-1 space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-glow">
          <button
            type="button"
            onClick={() => {
              handleLogout()
              setStage('auth')
            }}
            className="mb-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            ← Back to Login
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-600">
              {initial}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                Learner profile
              </p>
              <h2 className="font-display text-3xl font-semibold text-slate-900">
                Help us tailor your SkillSwap journey
              </h2>
              <p className="text-sm text-slate-500">
                Fill this once — you can always edit later from your dashboard.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleLearnerProfileSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input
                type="text"
                value={learnerProfile.name}
                onChange={(event) => handleLearnerProfileChange('name', event.target.value)}
                placeholder="Aarav Sharma"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Education type
              </label>
              <select
                value={learnerProfile.educationType}
                onChange={(event) =>
                  handleLearnerProfileChange('educationType', event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
                required
              >
                <option value="" disabled>
                  Select one
                </option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Bootcamp">Bootcamp</option>
                <option value="Self-paced">Self-paced</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  College / Institution
                </label>
                <input
                  type="text"
                  value={learnerProfile.college}
                  onChange={(event) => handleLearnerProfileChange('college', event.target.value)}
                  placeholder="IIT Hyderabad"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Current course / major
                </label>
                <input
                  type="text"
                  value={learnerProfile.courseName}
                  onChange={(event) =>
                    handleLearnerProfileChange('courseName', event.target.value)
                  }
                  placeholder="B.Tech Computer Science"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
            >
              Save and view courses
            </button>
          </form>
          <p className="text-xs text-slate-500">
            We store this securely on your device for a smoother onboarding next time.
          </p>
        </section>
      )
    }

    if (stage === 'learnerCatalog') {
      const initial = learnerProfile.name
        ? learnerProfile.name.charAt(0).toUpperCase()
        : '👤'

      return (
        <section className="flex-1 space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-glow">
          {learnerSelection.topic && learnerSelection.level && (
            <button
              type="button"
              onClick={() => {
                setLearnerSelection({ topic: '', level: '' })
                setVideoPage(1)
              }}
              className="mb-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
            >
              ← Back to Courses
            </button>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-600">
                {initial}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {learnerProfile.name || 'Learner'}
                </p>
                <p className="text-sm text-slate-500">
                  {learnerProfile.educationType || 'Add education'} ·{' '}
                  {learnerProfile.college || 'Add college'}
                </p>
                <p className="text-xs text-slate-400">
                  {learnerProfile.courseName || 'Preferred course'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={editLearnerProfile}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:border-slate-400"
            >
              Edit profile
            </button>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">What do you want to learn?</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {uniqueLearnerTopics.map((topic) => {
                const active = learnerSelection.topic === topic.label
                return (
                  <button
                    key={`${topic.category}-${topic.label}`}
                    type="button"
                    onClick={() => selectLearnerTopic(topic.label)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-brand-200'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {topic.category}
                    </p>
                    <p className="text-base font-semibold">{topic.label}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {learnerSelection.topic && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Difficulty preference
              </p>
              <h3 className="text-xl font-semibold text-slate-900">{learnerSelection.topic}</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {difficultyLevels.map((level) => {
                  const active = learnerSelection.level === level
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => selectLearnerLevel(level)}
                      className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300 text-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {level}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        </section>
      )
    }

    if (stage === 'learnerVideos') {
      return (
        <section className="flex-1 space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-glow">
          <button
            type="button"
            onClick={() => {
              setStage('learnerCatalog')
              setLearnerSelection({ topic: '', level: '' })
              setVideoPage(1)
            }}
            className="mb-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            ← Back to Courses
          </button>

          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
              Tutor Videos
            </p>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              {learnerSelection.topic} · {learnerSelection.level}
            </h2>
            {videoPagination.total > 0 && (
              <p className="mt-2 text-sm text-slate-500">
                {videoPagination.total} video{videoPagination.total !== 1 ? 's' : ''} found from expert tutors
              </p>
            )}
          </div>

          {isFetchingLearnerVideos ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-500">Fetching tutor content...</p>
            </div>
          ) : learnerVideos.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {learnerVideos.map((video) => (
                  <div key={video._id} className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
                    <div className="mb-3 flex items-start justify-between">
                      <button
                        type="button"
                        onClick={() => openTutorProfile(video.tutorDetails?.email)}
                        className="flex items-center gap-2 text-left hover:opacity-80"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600">
                          {video.tutorDetails?.fullName?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {video.tutorDetails?.fullName || video.tutorName}
                          </p>
                          {video.averageRating > 0 && (
                            <p className="text-xs text-slate-500">
                              ⭐ {video.averageRating.toFixed(1)} ({video.reviewCount} reviews)
                            </p>
                          )}
                        </div>
                      </button>
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        {video.category}
                      </span>
                    </div>
                    <p className="mb-2 font-semibold text-slate-900">{video.originalName}</p>
                    <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
                      <span>👁️ {video.views || 0} views</span>
                      <span>·</span>
                      <span>{(video.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openVideoPopup(video)}
                      className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Watch Video
                    </button>
                  </div>
                ))}
              </div>
              {videoPagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoPage((p) => Math.max(1, p - 1))}
                    disabled={videoPage === 1}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-slate-600">
                    Page {videoPagination.page} of {videoPagination.pages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVideoPage((p) => Math.min(videoPagination.pages, p + 1))}
                    disabled={videoPage === videoPagination.pages}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-500">
                No tutors have uploaded this combination yet. Try another level or check back soon.
              </p>
            </div>
          )}
        </section>
      )
    }

    if (stage === 'dashboard') {
      return (
        <section className="flex-1 space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-glow">
          <button
            type="button"
            onClick={() => setStage('complete')}
            className="mb-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            ← Back
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
              Tutor control center
            </p>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              Plan a new learning track
            </h2>
            <p className="text-sm text-slate-500">
              Re-use the topics you selected earlier to craft beginner,
              intermediate, or pro-level experiences and attach your best videos.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Your expertise library</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allTutorTopics.map((topic) => {
                const active = selectedTopic?.label === topic.label
                return (
                  <button
                    key={`${topic.category}-${topic.label}`}
                    type="button"
                    onClick={() => {
                      setSelectedTopic(topic)
                      setSelectedLevel(null)
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-brand-200'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {topic.category}
                    </p>
                    <p className="text-base font-semibold">{topic.label}</p>
                  </button>
                )
              })}
              {!allTutorTopics.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Head back to the previous step to pick at least one course,
                  technology, and workshop topic.
                </div>
              )}
            </div>
          </div>

          {selectedTopic && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Delivery level
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                {selectedTopic.label}
              </h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {['Beginner', 'Intermediate', 'Pro'].map((level) => {
                  const active = selectedLevel === level
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSelectedLevel(level)}
                      className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300 text-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {level}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selectedTopic && selectedLevel && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                Upload content
              </p>
              <p className="text-sm text-slate-600">
                Attach videos that cover {selectedTopic.label} for{' '}
                {selectedLevel.toLowerCase()} learners. MP4, MOV, and WebM up to 250MB
                are supported in production.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <label
                  htmlFor="video-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white px-6 py-10 text-center text-brand-600 transition hover:border-brand-400"
                >
                  <span className="text-3xl">🎥</span>
                  <p className="mt-2 font-semibold">Drop videos here or click to browse</p>
                  <p className="text-xs text-slate-500">MP4 · MOV · WebM · up to 250MB</p>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={handleVideoUpload}
                  />
                </label>

                {pendingUploads.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-800">
                      <span>Pending uploads</span>
                      <span className="text-xs text-slate-400">{pendingUploads.length} file(s)</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {pendingUploads.map((file, index) => (
                        <li
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                        >
                          <span className="font-semibold text-slate-800">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removePendingUpload(index)}
                            className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={submitPendingUploads}
                    disabled={
                      uploadStatus.state === 'loading' || pendingUploads.length === 0 || !selectedTopic
                    }
                    className={`w-full rounded-2xl px-6 py-3 text-base font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${
                      uploadStatus.state === 'loading' || pendingUploads.length === 0
                        ? 'cursor-not-allowed bg-slate-300'
                        : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    {uploadStatus.state === 'loading' ? 'Uploading...' : 'Submit to learners'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setStage('dashboard')
                      setShowUploadedVideos(true)
                      await fetchTutorVideosWithReviews()
                    }}
                    className="rounded-2xl border border-brand-200 px-6 py-3 text-base font-semibold text-brand-700 transition hover:border-brand-400 hover:text-brand-900"
                  >
                    View tutor dashboard ↗
                  </button>
                </div>

                {uploadStatus.state !== 'idle' && (
                  <div
                    className={`rounded-2xl border p-4 text-sm ${
                      uploadStatus.state === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : uploadStatus.state === 'warning'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : uploadStatus.state === 'error'
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <p className="font-semibold">{uploadStatus.message}</p>
                    {uploadStatus.state === 'warning' && (
                      <p className="mt-1 text-xs opacity-80">
                        You can still upload a different video for this topic and level.
                      </p>
                    )}
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">Published videos</p>
                    {tutorVideosLoading && (
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Loading...
                      </span>
                    )}
                  </div>
                  {uploadedVideos.length > 0 ? (
                    <div className="space-y-4">
                      {uploadedVideos.map((video) => (
                        <div
                          key={video._id}
                          className="grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3 md:grid-cols-2"
                        >
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="font-semibold text-slate-900">
                                {video.originalName}
                              </span>
                              <span className="text-xs text-slate-400">
                                {(video.size / 1024 / 1024).toFixed(1)} MB
                              </span>
                            </div>
                            <p className="mb-2 text-xs text-slate-500">
                              {video.topic} · {video.level} · {video.category}
                            </p>
                            <video
                              className="w-full rounded-lg border border-slate-100"
                              controls
                              src={`${API_BASE_URL}${video.url}`}
                              onPlay={async () => {
                                try {
                                  await fetch(`${API_BASE_URL}/api/videos/${video._id}/views`, { method: 'POST' })
                                  await refreshTutorVideos()
                                } catch (error) {
                                  console.error('Failed to increment views:', error)
                                }
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          <div>
                            <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3 text-xs text-slate-600">
                                  <span>👁️ {video.views || 0} views</span>
                                  <span>⭐ {video.averageRating > 0 ? video.averageRating.toFixed(1) : '0.0'}</span>
                                  <span>💬 {video.reviewCount || 0}</span>
                                </div>
                                {video.averageRating > 0 && (
                                  <div className="flex items-center gap-1 text-amber-400">
                                    {'★'.repeat(Math.round(video.averageRating))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleVideoReviews(video._id)}
                              className="mb-2 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <span>Reviews ({video.reviewCount || 0})</span>
                              <span className={expandedVideoReviews[video._id] ? 'rotate-180' : ''}>
                                ▼
                              </span>
                            </button>
                            {expandedVideoReviews[video._id] && (
                              <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
                                {video.reviews && video.reviews.length > 0 ? (
                                  video.reviews.map((review) => (
                                    <div key={review._id} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                                      <div className="mb-1 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-900">{review.learnerName}</p>
                                        <span className="text-amber-400">{'★'.repeat(review.rating)}</span>
                                      </div>
                                      {review.review && <p className="text-xs text-slate-600">{review.review}</p>}
                                      <p className="mt-1 text-xs text-slate-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-slate-500">No reviews yet.</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      {tutorVideosLoading
                        ? 'Fetching your videos...'
                        : 'No videos published for this combination yet.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Doubts Section for Tutor Dashboard */}
          {user && user.role === 'tutor' && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                    💭 Doubts & Questions
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">
                    Learner Doubts
                  </h3>
                  {tutorDoubtsLoading ? (
                    <p className="mt-1 text-sm text-slate-500">Loading doubts...</p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-600">
                      {tutorDoubts.length} total · {tutorDoubts.filter((d) => !d.isAnswered).length} pending
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={fetchTutorDoubts}
                  className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                >
                  Refresh
                </button>
              </div>

              {tutorDoubtsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-slate-500">Loading doubts...</p>
                </div>
              ) : tutorDoubts.length > 0 ? (
                <div className="space-y-4">
                  {tutorDoubts.map((doubt) => (
                    <div
                      key={doubt._id}
                      className={`rounded-xl border p-4 ${
                        doubt.isAnswered
                          ? 'border-emerald-200 bg-white'
                          : 'border-amber-300 bg-white shadow-sm'
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <p className="font-semibold text-slate-900">{doubt.learnerName}</p>
                            {!doubt.isAnswered && (
                              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                                Pending
                              </span>
                            )}
                            {doubt.isAnswered && (
                              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                                Answered
                              </span>
                            )}
                          </div>
                          {doubt.videoId && typeof doubt.videoId === 'object' && (
                            <p className="mb-1 text-xs font-semibold text-slate-600">
                              📹 {doubt.videoId.originalName || 'Video'} · {doubt.videoId.topic || ''} · {doubt.videoId.level || ''}
                            </p>
                          )}
                          <p className="text-sm text-slate-700">{doubt.doubt}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            Asked: {new Date(doubt.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Answer Section */}
                      {doubt.isAnswered ? (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="text-sm font-semibold text-emerald-700">
                              ✓ Your Answer
                            </p>
                            <span className="text-xs text-slate-500">
                              {new Date(doubt.answeredAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">{doubt.answer}</p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          {answeringDoubtId === doubt._id ? (
                            <div className="rounded-lg border border-brand-200 bg-white p-3">
                              <label className="mb-2 block text-sm font-medium text-slate-700">
                                Your Answer:
                              </label>
                              <textarea
                                value={doubtAnswer}
                                onChange={(e) => setDoubtAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                rows={3}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAnsweringDoubtId(null)
                                    setDoubtAnswer('')
                                  }}
                                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => submitDoubtAnswer(doubt._id)}
                                  disabled={!doubtAnswer.trim()}
                                  className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 hover:bg-brand-700"
                                >
                                  Submit Answer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setAnsweringDoubtId(doubt._id)
                                setDoubtAnswer('')
                              }}
                              className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                            >
                              Answer This Doubt
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-slate-500">
                    No doubts raised yet. Learners can ask questions while watching your videos.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between text-sm text-slate-500">
            <button type="button" onClick={() => setStage('skills')} className="font-semibold text-slate-900">
              ← Back to skills
            </button>
            <p>Need studio support? creators@skillswap.com</p>
          </div>
        </section>
      )
    }

    // Default stage => authentication
    return (
      <section className="flex-1 rounded-2xl border border-slate-100 bg-white p-6 shadow-glow">
        <div className="mb-6 flex rounded-full border border-slate-200 p-1 text-sm font-medium">
          <button
            type="button"
            className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'login' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
            onClick={() => {
              setMode('login')
              setForm(initialForm)
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'register' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
            onClick={() => {
              setMode('register')
              setForm(initialForm)
            }}
          >
            Register
          </button>
        </div>

        <div className="mb-8 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            {isRegister ? 'New to SkillSwap' : 'Welcome back'}
          </p>
          <h2 className="font-display text-3xl font-semibold text-slate-900">
            {isRegister ? 'Create your SkillSwap identity' : 'Sign in to continue'}
          </h2>
          <p className="text-sm text-slate-500">
            {isRegister
              ? 'Tell us who you want to become — we will tailor the journey.'
              : 'Enter your credentials to sync your tutoring progress.'}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
                placeholder="Alex Rivera"
                required={isRegister}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => {
                updateField('email', event.target.value)
                // Auto-set role if we know it for this email
                if (!isRegister && emailRoles[event.target.value]) {
                  updateField('role', emailRoles[event.target.value])
                }
              }}
              placeholder="you@skillswap.com"
              required
              autoComplete="off"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                id="remember-email"
                checked={savedEmails.includes(form.email)}
                onChange={(event) => {
                  if (event.target.checked) {
                    rememberEmail(form.email)
                  } else {
                    const filtered = savedEmails.filter((email) => email !== form.email)
                    setSavedEmails(filtered)
                    if (typeof window !== 'undefined') {
                      localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(filtered))
                    }
                  }
                }}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="remember-email">Remember this email on this device</label>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
              />
            </div>

            {isRegister && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => updateField('confirmPassword', event.target.value)}
                  placeholder="••••••••"
                  required={isRegister}
                  minLength={8}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
                />
              </div>
            )}
          </div>

          {isRegister && (
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Choose your role
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  Required
                </span>
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {['learner', 'tutor'].map((role) => (
                  <label
                    key={role}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${form.role === role ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-300'}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={form.role === role}
                      onChange={(event) => updateField('role', event.target.value)}
                      className="mt-1 h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                      required
                    />
                    <div>
                      <p className="font-semibold capitalize text-slate-900">{role}</p>
                      <p className="text-sm text-slate-500">
                        {role === 'learner'
                          ? 'Dive into curated lessons and accountability pods.'
                          : 'Monetize expertise through flexible tutoring slots.'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {!isRegister && form.email && emailRoles[form.email] && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-700">
              <p className="font-semibold">Registered as: {emailRoles[form.email]}</p>
            </div>
          )}

          {status.type !== 'idle' && (
            <p
              className={`text-sm ${
                status.type === 'error'
                  ? 'text-rose-600'
                  : status.type === 'success'
                    ? 'text-emerald-600'
                    : 'text-slate-500'
              }`}
            >
              {status.message}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
            disabled={status.type === 'loading'}
          >
            {status.type === 'loading' ? 'Authenticating...' : actionLabel}
          </button>

          <p className="text-center text-xs text-slate-500">
            By continuing you agree to the{' '}
            <span className="font-semibold text-slate-900">SkillSwap charter</span>.
          </p>
        </form>
      </section>
    )
  }

  const renderProfileMenu = () => {
    if (!user || stage === 'auth') return null

    return (
      <div className="fixed right-4 top-4 z-50">
        <button
          type="button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            user.role === 'tutor' 
              ? 'bg-brand-600 hover:bg-brand-700 focus:ring-brand-500' 
              : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
          }`}
        >
          <span className="text-xl">👤</span>
        </button>

        {showProfileMenu && (
          <div className={`absolute right-0 top-14 w-96 max-h-[85vh] flex flex-col rounded-2xl border-2 shadow-xl overflow-hidden ${
            user.role === 'tutor' 
              ? 'border-brand-500 bg-gradient-to-br from-white to-brand-50' 
              : 'border-emerald-500 bg-gradient-to-br from-white to-emerald-50'
          }`}>
            <div className={`flex-shrink-0 mb-4 border-b-2 pb-4 px-6 pt-6 ${
              user.role === 'tutor' ? 'border-brand-200' : 'border-emerald-200'
            }`}>
              <h3 className={`text-lg font-semibold ${
                user.role === 'tutor' ? 'text-brand-900' : 'text-emerald-900'
              }`}>{user.fullName}</h3>
              <p className={`text-sm ${
                user.role === 'tutor' ? 'text-brand-700' : 'text-emerald-700'
              }`}>{user.email}</p>
              <p className={`mt-1 text-xs font-semibold uppercase ${
                user.role === 'tutor' ? 'text-brand-600' : 'text-emerald-600'
              }`}>
                {user.role === 'tutor' ? '👨‍🏫 Tutor' : '👨‍🎓 Learner'}
              </p>
              {loginTime && (
                <p className={`mt-2 text-xs ${
                  user.role === 'tutor' ? 'text-brand-600' : 'text-emerald-600'
                }`}>
                  Logged in: {new Date(loginTime).toLocaleString()}
                </p>
              )}
              {user.role === 'tutor' && (
                <button
                  type="button"
                  onClick={async () => {
                    setShowUploadedVideos(true)
                    setShowProfileMenu(false)
                    await fetchTutorVideosWithReviews()
                  }}
                  className="mt-3 w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  📹 Uploaded Videos
                </button>
              )}
            </div>

            {user.role === 'tutor' && (
              <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={tutorExtraDetails.bio}
                    onChange={(e) =>
                      setTutorExtraDetails((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Tell learners about yourself..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Experience (Optional)
                  </label>
                  <input
                    type="text"
                    value={tutorExtraDetails.experience}
                    onChange={(e) =>
                      setTutorExtraDetails((prev) => ({ ...prev, experience: e.target.value }))
                    }
                    placeholder="e.g., 5 years in web development"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Specialization (Optional)
                  </label>
                  <input
                    type="text"
                    value={tutorExtraDetails.specialization}
                    onChange={(e) =>
                      setTutorExtraDetails((prev) => ({ ...prev, specialization: e.target.value }))
                    }
                    placeholder="e.g., React, Node.js, AWS"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Contact (Optional)
                  </label>
                  <input
                    type="text"
                    value={tutorExtraDetails.contact}
                    onChange={(e) =>
                      setTutorExtraDetails((prev) => ({ ...prev, contact: e.target.value }))
                    }
                    placeholder="Additional contact info"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  />
                </div>
              </div>
            )}

            {user.role === 'learner' && (
              <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900">Learner Profile</p>
                  <p className="mt-1 text-xs text-emerald-700">
                    {learnerProfile.name || 'Not set'}
                  </p>
                  {learnerProfile.educationType && (
                    <p className="mt-1 text-xs text-emerald-600">
                      {learnerProfile.educationType} · {learnerProfile.college || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className={`flex-shrink-0 border-t-2 pt-4 px-6 pb-6 ${
              user.role === 'tutor' ? 'border-brand-200' : 'border-emerald-200'
            }`}>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderVideoPopup = () => {
    if (!showVideoPopup || !selectedVideo) return null

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 overflow-y-auto">
        <div className="relative w-full max-w-4xl my-8 rounded-2xl bg-white p-6">
          <button
            type="button"
            onClick={() => {
              setShowVideoPopup(false)
              setSelectedVideo(null)
              setVideoRating(0)
              setVideoReview('')
              setVideoDoubts([])
              setDoubtText('')
              setShowDoubtForm(false)
              setAnsweringDoubtId(null)
              setDoubtAnswer('')
            }}
            className="absolute right-4 top-4 rounded-full bg-slate-900 p-2 text-white hover:bg-slate-800"
          >
            ✕
          </button>
          <div className="mb-4 space-y-2">
            <h3 className="text-2xl font-semibold text-slate-900">{selectedVideo.originalName}</h3>
            <p className="text-sm text-slate-500">
              {selectedVideo.topic} · {selectedVideo.level} · {selectedVideo.category}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-slate-500">
              <span>👁️ {selectedVideo.views || 0} views</span>
              <span>💬 {selectedVideo.reviewCount || 0} comments</span>
              <span>⭐ {selectedVideo.averageRating > 0 ? selectedVideo.averageRating.toFixed(1) : 'NEW'}</span>
            </div>
          </div>
          <video
            className="w-full rounded-xl border border-slate-200"
            controls
            autoPlay
            src={`${API_BASE_URL}${selectedVideo.url}`}
            onPlay={async () => {
              if (selectedVideo._id) {
                try {
                  await fetch(`${API_BASE_URL}/api/videos/${selectedVideo._id}/views`, { method: 'POST' })
                } catch (error) {
                  console.error('Failed to increment views:', error)
                }
              }
            }}
          >
            Your browser does not support the video tag.
          </video>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Rate & Review
            </button>
            <button
              type="button"
              onClick={() => setShowReviewModal(!showReviewModal)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              View Reviews ({videoReviews.length})
            </button>
          </div>
          {showReviewModal && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="mb-3 font-semibold text-slate-900">Share feedback</h4>
              <div className="mb-3">
                <label className="mb-2 block text-sm font-medium text-slate-700">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setVideoRating(star)}
                      className={`text-2xl ${star <= videoRating ? 'text-amber-400' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={videoReview}
                onChange={(e) => setVideoReview(e.target.value)}
                placeholder="Add a public comment..."
                className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVideoRating(0)
                    setVideoReview('')
                    setShowReviewModal(false)
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReview}
                  disabled={!videoRating}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
          {videoReviews.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold text-slate-900">Reviews</h4>
              {videoReviews.map((review) => (
                <div key={review._id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{review.learnerName}</p>
                    <span className="text-amber-400">{'★'.repeat(review.rating)}</span>
                  </div>
                  {review.review && <p className="text-sm text-slate-600">{review.review}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Doubts Section */}
          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-slate-900">
                💭 Doubts & Questions ({videoDoubts.length})
              </h4>
              {user && user.role === 'learner' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDoubtForm(!showDoubtForm)
                    setDoubtText('')
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {showDoubtForm ? 'Cancel' : '+ Raise a Doubt'}
                </button>
              )}
            </div>

            {/* Raise Doubt Form (Learners) */}
            {showDoubtForm && user && user.role === 'learner' && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  What's your doubt or question?
                </label>
                <textarea
                  value={doubtText}
                  onChange={(e) => setDoubtText(e.target.value)}
                  placeholder="Type your doubt here... (e.g., Can you explain how this works?)"
                  className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDoubtForm(false)
                      setDoubtText('')
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitDoubt}
                    disabled={!doubtText.trim()}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-emerald-700"
                  >
                    Submit Doubt
                  </button>
                </div>
              </div>
            )}

            {/* Display Doubts */}
            {videoDoubts.length > 0 ? (
              <div className="space-y-4">
                {videoDoubts.map((doubt) => (
                  <div
                    key={doubt._id}
                    className={`rounded-xl border p-4 ${
                      doubt.isAnswered
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-amber-200 bg-amber-50/50'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{doubt.learnerName}</p>
                          {!doubt.isAnswered && (
                            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                              Pending
                            </span>
                          )}
                          {doubt.isAnswered && (
                            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                              Answered
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700">{doubt.doubt}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(doubt.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Answer Section */}
                    {doubt.isAnswered ? (
                      <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="text-sm font-semibold text-emerald-700">
                            ✓ Answered by {doubt.answeredBy}
                          </p>
                          <span className="text-xs text-slate-500">
                            {new Date(doubt.answeredAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{doubt.answer}</p>
                      </div>
                    ) : (
                      // Answer Form (Tutors)
                      user &&
                      user.role === 'tutor' &&
                      selectedVideo.tutorName === user.fullName && (
                        <div className="mt-3">
                          {answeringDoubtId === doubt._id ? (
                            <div className="rounded-lg border border-brand-200 bg-white p-3">
                              <label className="mb-2 block text-sm font-medium text-slate-700">
                                Your Answer:
                              </label>
                              <textarea
                                value={doubtAnswer}
                                onChange={(e) => setDoubtAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                rows={3}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAnsweringDoubtId(null)
                                    setDoubtAnswer('')
                                  }}
                                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => submitDoubtAnswer(doubt._id)}
                                  disabled={!doubtAnswer.trim()}
                                  className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 hover:bg-brand-700"
                                >
                                  Submit Answer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setAnsweringDoubtId(doubt._id)
                                setDoubtAnswer('')
                              }}
                              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                            >
                              Answer This Doubt
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500">
                {user && user.role === 'learner'
                  ? 'No doubts raised yet. Be the first to ask a question!'
                  : 'No doubts raised for this video yet.'}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderTutorProfileModal = () => {
    if (!showTutorProfile || !selectedTutorProfile) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="relative w-full max-w-md rounded-2xl bg-white p-6">
          <button
            type="button"
            onClick={() => {
              setShowTutorProfile(false)
              setSelectedTutorProfile(null)
            }}
            className="absolute right-4 top-4 rounded-full bg-slate-900 p-2 text-white hover:bg-slate-800"
          >
            ✕
          </button>
          <div className="mb-4 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-600">
              {selectedTutorProfile.fullName?.charAt(0) || 'T'}
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{selectedTutorProfile.fullName}</h3>
            <p className="text-sm text-slate-500">{selectedTutorProfile.email}</p>
            {selectedTutorProfile.createdAt && (
              <p className="mt-1 text-xs text-slate-400">
                Member since {new Date(selectedTutorProfile.createdAt).getFullYear()}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderUploadedVideosModal = () => {
    if (!showUploadedVideos) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">My Uploaded Videos</h2>
            <button
              type="button"
              onClick={() => {
                setShowUploadedVideos(false)
                setTutorUploadedVideos([])
              }}
              className="rounded-full bg-slate-900 p-2 text-white hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
          {tutorUploadedVideos.length === 0 ? (
            <p className="text-center text-slate-500">No videos uploaded yet.</p>
          ) : (
            <div className="space-y-6">
              {tutorUploadedVideos.map((video) => (
                <div key={video._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-1 font-semibold text-slate-900">{video.originalName}</h3>
                          <p className="mb-2 text-sm text-slate-600">
                            {video.topic} · {video.level} · {video.category}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteVideo(video._id)}
                          className="ml-2 rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                      <video
                        className="w-full rounded-lg border border-slate-200"
                        controls
                        src={`${API_BASE_URL}${video.url}`}
                        onPlay={async () => {
                          try {
                            await fetch(`${API_BASE_URL}/api/videos/${video._id}/views`, { method: 'POST' })
                            await fetchTutorVideosWithReviews()
                          } catch (error) {
                            console.error('Failed to increment views:', error)
                          }
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div>
                      <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">Stats</p>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>👁️ {video.views || 0} views</span>
                            <span>⭐ {video.averageRating > 0 ? video.averageRating.toFixed(1) : '0.0'} rating</span>
                            <span>💬 {video.reviewCount || 0} reviews</span>
                          </div>
                          {video.averageRating > 0 && (
                            <div className="flex items-center gap-1 text-amber-400">
                              {'★'.repeat(Math.round(video.averageRating))}
                              <span className="text-xs text-slate-500">
                                ({video.averageRating.toFixed(1)}/5)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <button
                          type="button"
                          onClick={() => toggleVideoReviews(video._id)}
                          className="mb-2 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <span>Reviews ({video.reviewCount || 0})</span>
                          <span className={expandedVideoReviews[video._id] ? 'rotate-180' : ''}>
                            ▼
                          </span>
                        </button>
                        {expandedVideoReviews[video._id] && (
                          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
                            {video.reviews && video.reviews.length > 0 ? (
                              video.reviews.map((review) => (
                                <div key={review._id} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                                  <div className="mb-1 flex items-center justify-between">
                                    <p className="text-xs font-semibold text-slate-900">{review.learnerName}</p>
                                    <span className="text-amber-400">{'★'.repeat(review.rating)}</span>
                                  </div>
                                  {review.review && <p className="text-xs text-slate-600">{review.review}</p>}
                                  <p className="mt-1 text-xs text-slate-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500">No reviews yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      {renderProfileMenu()}
      {renderVideoPopup()}
      {renderTutorProfileModal()}
      {renderUploadedVideosModal()}
      <div className="mx-auto flex max-w-6xl flex-col gap-10 rounded-3xl bg-white/70 p-6 shadow-2xl shadow-brand-600/20 backdrop-blur md:flex-row md:p-10">
        <section className="flex-1 space-y-8 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-8 text-white">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/40 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/80">
            SkillSwap
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
          </p>
          <div className="space-y-4">
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Learn. Teach. Grow faster together.
            </h1>
            <p className="text-base text-white/85 sm:text-lg">
              Unlock peer-to-peer learning by joining as a dedicated tutor or a
              curious learner. SkillSwap matches goals, schedules, and expectations
              to keep growth intentional.
            </p>
      </div>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-white/15 text-center text-lg leading-8">1</span>
              Curate your role — tutor or learner — upfront.
            </li>
            <li className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-white/15 text-center text-lg leading-8">2</span>
              Share top skills or focus areas to personalize matches.
            </li>
            <li className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-white/15 text-center text-lg leading-8">3</span>
              Track commitments with transparent feedback loops.
            </li>
          </ul>
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Early beta · invite only
          </p>
        </section>

        {renderStagePanel()}
      </div>
    </div>
  )
}

export default App
