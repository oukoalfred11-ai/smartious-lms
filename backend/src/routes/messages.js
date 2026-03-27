const router = require('express').Router()
const { Message } = require('../models/Models')
const { auth } = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({ $or: [{ senderId: req.user._id }, { recipientId: req.user._id }] }).sort('-createdAt').limit(50).populate('senderId','firstName lastName role').populate('recipientId','firstName lastName role')
    res.json({ success:true, messages })
  } catch(e) { res.status(500).json({ success:false, message:e.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const msg = await Message.create({ ...req.body, senderId: req.user._id })
    res.json({ success:true, message: msg })
  } catch(e) { res.status(400).json({ success:false, message:e.message }) }
})

module.exports = router
