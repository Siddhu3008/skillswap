const { Schema, model } = require('mongoose')

const videoSchema = new Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Pro'],
      required: true,
    },
    category: {
      type: String,
      enum: ['Course', 'Technology', 'Workshop'],
      required: true,
    },
    tutorName: {
      type: String,
      default: 'SkillSwap Tutor',
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

module.exports = model('Video', videoSchema)










