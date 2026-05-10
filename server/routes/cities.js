const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const cityController = require('../controllers/cityController')

router.get('/',     auth, cityController.getAll)
router.get('/:id',  auth, cityController.getOne)

module.exports = router