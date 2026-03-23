const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create UPI order
router.post('/create-order', async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };
    
    const order = await rzp.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
