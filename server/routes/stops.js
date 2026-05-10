const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const stopController = require('../controllers/stopController')

router.get('/trip/:tripId',       auth, stopController.getByTrip)
router.post('/trip/:tripId',      auth, stopController.create)
router.patch('/:id',              auth, stopController.update)
router.delete('/:id',             auth, stopController.remove)
router.patch('/reorder/:tripId',  auth, stopController.reorder)

module.exports = router