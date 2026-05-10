const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const tripController = require('../controllers/tripController')

router.get('/',                auth, tripController.getAll)
router.post('/',               auth, tripController.create)
router.get('/public/:token',         tripController.getPublic)     // no auth — public
router.post('/public/:token/copy', auth, tripController.copyTrip)  // auth required to copy
router.get('/:id',             auth, tripController.getOne)
router.patch('/:id',           auth, tripController.update)
router.delete('/:id',          auth, tripController.remove)

module.exports = router