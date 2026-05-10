const { Trip, Stop, City, Activity, BudgetItem, User } = require('../models')
const { v4: uuidv4 } = require('uuid')

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
      where: { share_token: req.params.token, is_public: true },
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

/* ── Copy Trip ──────────────────────────────────────────────────
   Duplicates a public trip (title, dates, description, cover,
   and all stops) for the authenticated requesting user.
   Returns the new trip.
─────────────────────────────────────────────────────────────── */
exports.copyTrip = async (req, res, next) => {
  try {
    const original = await Trip.findOne({
      where: { share_token: req.params.token, is_public: true },
      include: [
        {
          model: Stop,
          include: [
            { model: City },
            { model: Activity, through: { attributes: ['scheduled_time', 'notes'] } }
          ],
          order: [['order_index', 'ASC']]
        }
      ]
    })

    if (!original) {
      return res.status(404).json({ error: 'Trip not found or not public' })
    }

    // Create new trip for requesting user
    const newTrip = await Trip.create({
      user_id: req.user.id,
      title: `Copy of ${original.title}`,
      description: original.description,
      start_date: original.start_date,
      end_date: original.end_date,
      cover_photo: original.cover_photo,
      total_budget: original.total_budget,
      is_public: false,
      status: 'planning',
    })

    // Duplicate all stops (without activities — activities are city-level shared resources)
    if (original.Stops?.length > 0) {
      await Promise.all(original.Stops.map(s =>
        Stop.create({
          trip_id: newTrip.id,
          city_id: s.city_id,
          arrival_date: s.arrival_date,
          departure_date: s.departure_date,
          notes: s.notes,
          order_index: s.order_index,
        })
      ))
    }

    res.status(201).json({ trip: newTrip, message: 'Trip copied to your account!' })
  } catch (err) {
    next(err)
  }
}