const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const tripController = require('../controllers/tripController')

router.get('/',          auth, tripController.getAll)
router.post('/',         auth, tripController.create)
router.get('/:id',       auth, tripController.getOne)
router.patch('/:id',     auth, tripController.update)
router.delete('/:id',    auth, tripController.remove)
router.get('/:id/public',      tripController.getPublic)

module.exports = router