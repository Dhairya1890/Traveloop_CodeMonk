const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const activityController = require('../controllers/activityController')

router.get('/',            auth, activityController.getAll)
router.get('/city/:cityId', auth, activityController.getByCity)
router.get('/:id',         auth, activityController.getOne)
router.post('/stop/:stopId',       auth, activityController.addToStop)
router.delete('/stop/:stopId/:activityId', auth, activityController.removeFromStop)

module.exports = router