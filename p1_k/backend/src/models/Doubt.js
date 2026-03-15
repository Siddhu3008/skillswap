const { Schema, model } = require('mongoose')

const doubtSchema = new Schema(
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
    doubt: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      trim: true,
      default: '',
    },
    answeredBy: {
      type: String,
      trim: true,
      default: '',
    },
    answeredAt: {
      type: Date,
      default: null,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

doubtSchema.index({ videoId: 1, createdAt: -1 })

module.exports = model('Doubt', doubtSchema)






