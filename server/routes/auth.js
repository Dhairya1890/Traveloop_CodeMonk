const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const authController = require('../controllers/authController')
const validate = require('../middleware/validate')
const auth = require('../middleware/auth')

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]

router.post('/register', registerRules, validate, authController.register)
router.post('/login',    loginRules,    validate, authController.login)
router.get('/me',        auth,                    authController.me)
router.patch('/me',      auth,                    authController.updateProfile)
router.patch('/password', auth,                   authController.changePassword)

module.exports = router