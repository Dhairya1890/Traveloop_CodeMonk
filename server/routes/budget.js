const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const budgetController = require('../controllers/budgetController')

router.get('/trip/:tripId',    auth, budgetController.getByTrip)
router.post('/trip/:tripId',   auth, budgetController.create)
router.patch('/:id',           auth, budgetController.update)
router.delete('/:id',          auth, budgetController.remove)

module.exports = router