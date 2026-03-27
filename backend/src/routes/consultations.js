const router = require('express').Router()
const { Consultation } = require('../models/Models')

router.post('/', async (req, res) => {
  try {
    const consultation = await Consultation.create(req.body)
    res.json({ success:true, consultation })
  } catch(e) { res.status(400).json({ success:false, message:e.message }) }
})

module.exports = router
