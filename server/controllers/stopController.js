const { Stop, City, Activity, Trip } = require('../models')

const verifyTripOwnership = async (tripId, userId) => {
  const trip = await Trip.findOne({ where: { id: tripId, user_id: userId } })
  return trip
}

exports.getByTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params

    const trip = await verifyTripOwnership(tripId, req.user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const stops = await Stop.findAll({
      where: { trip_id: tripId },
      order: [['order_index', 'ASC']],
      include: [
        { model: City },
        { model: Activity, through: { attributes: ['scheduled_time', 'notes'] } }
      ]
    })

    res.json(stops)
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { tripId } = req.params
    const { city_id, arrival_date, departure_date, notes } = req.body

    if (!city_id || !arrival_date || !departure_date) {
      return res.status(400).json({ error: 'city_id, arrival_date and departure_date are required' })
    }

    const trip = await verifyTripOwnership(tripId, req.user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const city = await City.findByPk(city_id)
    if (!city) return res.status(404).json({ error: 'City not found' })

    // auto assign order_index as last
    const count = await Stop.count({ where: { trip_id: tripId } })

    const stop = await Stop.create({
      trip_id: tripId,
      city_id,
      arrival_date,
      departure_date,
      notes,
      order_index: count,
    })

    const stopWithCity = await Stop.findByPk(stop.id, {
      include: [
        { model: City },
        { model: Activity, through: { attributes: ['scheduled_time', 'notes'] } }
      ]
    })

    res.status(201).json(stopWithCity)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const stop = await Stop.findByPk(req.params.id, {
      include: [{ model: Trip }]
    })

    if (!stop) return res.status(404).json({ error: 'Stop not found' })
    if (stop.Trip.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    const { arrival_date, departure_date, notes } = req.body

    await stop.update({ arrival_date, departure_date, notes })

    res.json(stop)
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const stop = await Stop.findByPk(req.params.id, {
      include: [{ model: Trip }]
    })

    if (!stop) return res.status(404).json({ error: 'Stop not found' })
    if (stop.Trip.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    await stop.destroy()

    // reorder remaining stops
    const remaining = await Stop.findAll({
      where: { trip_id: stop.trip_id },
      order: [['order_index', 'ASC']]
    })

    for (let i = 0; i < remaining.length; i++) {
      await remaining[i].update({ order_index: i })
    }

    res.json({ message: 'Stop deleted successfully' })
  } catch (err) {
    next(err)
  }
}

exports.reorder = async (req, res, next) => {
  try {
    const { tripId } = req.params
    const { stops } = req.body // array of { id, order_index }

    if (!stops || !Array.isArray(stops)) {
      return res.status(400).json({ error: 'stops array is required' })
    }

    const trip = await verifyTripOwnership(tripId, req.user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    await Promise.all(
      stops.map(({ id, order_index }) =>
        Stop.update({ order_index }, { where: { id, trip_id: tripId } })
      )
    )

    const updated = await Stop.findAll({
      where: { trip_id: tripId },
      order: [['order_index', 'ASC']],
      include: [{ model: City }]
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
}