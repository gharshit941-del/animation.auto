const express = require('express');
const Video = require('../models/Video');
const User = require('../models/User');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Generate faceless video
router.post('/generate', verifyToken, upload.single('audio'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Check credits (owner has infinite)
    if (!user.isOwner && user.credits <= 0) {
      return res.status(402).json({ error: 'Insufficient credits' });
    }
    
    const video = new Video({
      userId: req.user.userId,
      title: req.body.title || 'Faceless Video',
      script: req.body.script,
      template: req.body.template || 'default'
    });
    
    await video.save();
    
    // Simulate video processing
    setTimeout(async () => {
      video.status = 'completed';
      
      // Generate sample video URL (in production, use FFmpeg)
      video.videoUrl = `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`;
      video.thumbnail = `https://picsum.photos/320/240?random=${video._id}`;
      
      await video.save();
      
      // Deduct credits
      if (!user.isOwner) {
        user.credits -= 1;
        await user.save();
      }
      
      // Emit socket event
      req.io.emit('video-ready', { videoId: video._id });
    }, 5000);
    
    res.json({ videoId: video._id, status: 'processing' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user videos
router.get('/my-videos', verifyToken, async (req, res) => {
  const videos = await Video.find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .populate('userId', 'phone plan');
  res.json(videos);
});

module.exports = router;
