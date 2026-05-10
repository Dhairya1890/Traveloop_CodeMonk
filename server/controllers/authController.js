const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar_url: user.avatar_url,
  language_pref: user.language_pref,
  role: user.role,
  created_at: user.created_at,
})

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const user = await User.create({ name, email, password_hash })
    const token = generateToken(user.id)

    res.status(201).json({ token, user: safeUser(user) })
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user.id)

    res.json({ token, user: safeUser(user) })
  } catch (err) {
    next(err)
  }
}

exports.me = async (req, res, next) => {
  try {
    res.json({ user: safeUser(req.user) })
  } catch (err) {
    next(err)
  }
}

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar_url, language_pref } = req.body

    await req.user.update({ name, avatar_url, language_pref })

    res.json({ user: safeUser(req.user) })
  } catch (err) {
    next(err)
  }
}