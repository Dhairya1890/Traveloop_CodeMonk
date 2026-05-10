const { Trip, Stop, City, Activity, BudgetItem, User } = require('../models')

exports.getAll = async (req, res, next) => {
  try {
    const trips = await Trip.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Stop,
          include: [{ model: City, attributes: ['id', 'name', 'country', 'image_url'] }]
        }
      ]
    })
    res.json(trips)
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { title, description, start_date, end_date, cover_photo, is_public, total_budget } = req.body

    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'title, start_date and end_date are required' })
    }

    const trip = await Trip.create({
      user_id: req.user.id,
      title,
      description,
      start_date,
      end_date,
      cover_photo,
      is_public: is_public || false,
      total_budget: total_budget || 0,
    })

    res.status(201).json(trip)
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        {
          model: Stop,
          include: [
            { model: City },
            { model: Activity, through: { attributes: ['scheduled_time', 'notes'] } }
          ],
          order: [['order_index', 'ASC']]
        },
        { model: BudgetItem }
      ]
    })

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' })
    }

    res.json(trip)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    })

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' })
    }

    const { title, description, start_date, end_date, cover_photo, is_public, total_budget, status } = req.body

    await trip.update({ title, description, start_date, end_date, cover_photo, is_public, total_budget, status })

    res.json(trip)
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    })

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' })
    }

    await trip.destroy()

    res.json({ message: 'Trip deleted successfully' })
  } catch (err) {
    next(err)
  }
}

exports.getPublic = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.id, is_public: true },
      include: [
        {
          model: Stop,
          include: [
            { model: City },
            { model: Activity, through: { attributes: ['scheduled_time', 'notes'] } }
          ],
          order: [['order_index', 'ASC']]
        },
        {
          model: User,
          attributes: ['id', 'name', 'avatar_url']
        }
      ]
    })

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or not public' })
    }

    res.json(trip)
  } catch (err) {
    next(err)
  }
}