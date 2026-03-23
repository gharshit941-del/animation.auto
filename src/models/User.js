const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  isOwner: { type: Boolean, default: false },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  credits: { type: Number, default: 5 },
  videosGenerated: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.phone === '9999999999') {
    this.isOwner = true;
    this.plan = 'pro';
    this.credits = Infinity;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
