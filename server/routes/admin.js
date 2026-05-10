const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const adminController = require('../controllers/adminController')

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

router.get('/stats',    auth, isAdmin, adminController.getStats)
router.get('/users',    auth, isAdmin, adminController.getUsers)
router.delete('/users/:id', auth, isAdmin, adminController.deleteUser)

module.exports = router