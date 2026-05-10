const { PackingItem, Trip } = require('../models')

const verifyTripOwnership = async (tripId, userId) => {
  return await Trip.findOne({ where: { id: tripId, user_id: userId } })
}

exports.getByTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params

    const trip = await verifyTripOwnership(tripId, req.user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const items = await PackingItem.findAll({
      where: { trip_id: tripId },
      order: [['category', 'ASC'], ['label', 'ASC']]
    })

    // group by category
    const grouped = {}
    items.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    })

    res.json({ items, grouped })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { tripId } = req.params
    const { label, category } = req.body

    if (!label) return res.status(400).json({ error: 'label is required' })

    const trip = await verifyTripOwnership(tripId, req.user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const item = await PackingItem.create({
      trip_id: tripId,
      label,
      category: category || 'other',
      is_packed: false,
    })

    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const item = await PackingItem.findByPk(req.params.id, {
      include: [{ model: Trip }]
    })

    if (!item) return res.status(404).json({ error: 'Packing item not found' })
    if (item.Trip.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    const { label, category, is_packed } = req.body

    await item.update({ label, category, is_packed })

    res.json(item)
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const item = await PackingItem.findByPk(req.params.id, {
      include: [{ model: Trip }]
    })

    if (!item) return res.status(404).json({ error: 'Packing item not found' })
    if (item.Trip.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    await item.destroy()

    res.json({ message: 'Packing item deleted successfully' })
  } catch (err) {
    next(err)
  }
}

exports.reset = async (req, res, next) => {
  try {
    const { tripId } = req.params

    const trip = await verifyTripOwnership(tripId, req.user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    await PackingItem.update(
      { is_packed: false },
      { where: { trip_id: tripId } }
    )

    const items = await PackingItem.findAll({
      where: { trip_id: tripId },
      order: [['category', 'ASC'], ['label', 'ASC']]
    })

    res.json(items)
  } catch (err) {
    next(err)
  }
}