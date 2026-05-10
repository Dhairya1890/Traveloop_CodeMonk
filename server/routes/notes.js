const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const noteController = require('../controllers/noteController')

router.get('/trip/:tripId',   auth, noteController.getByTrip)
router.post('/trip/:tripId',  auth, noteController.create)
router.patch('/:id',          auth, noteController.update)
router.delete('/:id',         auth, noteController.remove)

module.exports = router