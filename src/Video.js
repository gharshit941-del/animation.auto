const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  script: String,
  template: String,
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  videoUrl: String,
  thumbnail: String,
  duration: Number,
  creditsUsed: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
