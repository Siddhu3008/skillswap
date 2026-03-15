const { Schema, model } = require('mongoose')

const reviewSchema = new Schema(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    learnerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    learnerName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true },
)

reviewSchema.index({ videoId: 1, learnerEmail: 1 }, { unique: true })

module.exports = model('Review', reviewSchema)

