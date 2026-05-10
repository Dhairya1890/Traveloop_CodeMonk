const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const communityController = require('../controllers/communityController')

router.get('/',              auth, communityController.getFeed)
router.post('/:tripId/like', auth, communityController.toggleLike)

module.exports = router
