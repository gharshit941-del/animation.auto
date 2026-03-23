const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Login with phone
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    let user = await User.findOne({ phone });
    
    if (!user) {
      user = new User({ phone });
      await user.save();
    }
    
    const token = jwt.sign({ userId: user._id, isOwner: user.isOwner }, 'secret_key');
    res.json({ token, user: { id: user._id, phone: user.phone, plan: user.plan, credits: user.credits } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
