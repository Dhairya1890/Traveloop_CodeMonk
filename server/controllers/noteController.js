const { TripNote, Trip, Stop } = require('../models')

const verifyTripOwnership = async (tripId, userId) => {
  return await Trip.findOne({ where: { id: tripId, user_id: userId } })
}

exports.getByTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params

    const trip = await verifyTripOwnership(tripId, req.user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const notes = await TripNote.findAll({
      where: { trip_id: tripId },
      include: [{ model: Stop, attributes: ['id', 'arrival_date', 'departure_date'] }],
      order: [['created_at', 'DESC']]
    })

    res.json(notes)
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { tripId } = req.params
    const { content, stop_id } = req.body

    if (!content) return res.status(400).json({ error: 'content is required' })

    const trip = await verifyTripOwnership(tripId, req.user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    if (stop_id) {
      const stop = await Stop.findOne({ where: { id: stop_id, trip_id: tripId } })
      if (!stop) return res.status(404).json({ error: 'Stop not found' })
    }

    const note = await TripNote.create({
      trip_id: tripId,
      stop_id: stop_id || null,
      content,
    })

    res.status(201).json(note)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const note = await TripNote.findByPk(req.params.id, {
      include: [{ model: Trip }]
    })

    if (!note) return res.status(404).json({ error: 'Note not found' })
    if (note.Trip.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    const { content, stop_id } = req.body

    await note.update({ content, stop_id })

    res.json(note)
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const note = await TripNote.findByPk(req.params.id, {
      include: [{ model: Trip }]
    })

    if (!note) return res.status(404).json({ error: 'Note not found' })
    if (note.Trip.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    await note.destroy()

    res.json({ message: 'Note deleted successfully' })
  } catch (err) {
    next(err)
  }
}