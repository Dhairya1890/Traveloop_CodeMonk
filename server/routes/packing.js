const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const packingController = require('../controllers/packingController')

router.get('/trip/:tripId',    auth, packingController.getByTrip)
router.post('/trip/:tripId',   auth, packingController.create)
router.patch('/:id',           auth, packingController.update)
router.delete('/:id',          auth, packingController.remove)
router.patch('/reset/:tripId', auth, packingController.reset)

module.exports = router