module.exports = (err, req, res, next) => {
  console.error(err.stack)

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => e.message)
    })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Already exists' })
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  })
}