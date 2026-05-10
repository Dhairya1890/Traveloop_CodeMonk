const { BudgetItem, Trip } = require('../models')

const verifyTripOwnership = async (tripId, userId) => {
  return await Trip.findOne({ where: { id: tripId, user_id: userId } })
}

exports.getByTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params

    const trip = await verifyTripOwnership(tripId, req.user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const items = await BudgetItem.findAll({
      where: { trip_id: tripId },
      order: [['category', 'ASC']]
    })

    // compute summary
    const summary = {
      total_estimated: 0,
      total_actual: 0,
      by_category: {}
    }

    items.forEach(item => {
      summary.total_estimated += parseFloat(item.estimated_cost || 0)
      summary.total_actual    += parseFloat(item.actual_cost || 0)

      if (!summary.by_category[item.category]) {
        summary.by_category[item.category] = { estimated: 0, actual: 0 }
      }
      summary.by_category[item.category].estimated += parseFloat(item.estimated_cost || 0)
      summary.by_category[item.category].actual    += parseFloat(item.actual_cost || 0)
    })

    res.json({ items, summary })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { tripId } = req.params
    const { category, label, estimated_cost, actual_cost } = req.body

    if (!category || !label) {
      return res.status(400).json({ error: 'category and label are required' })
    }

    const trip = await verifyTripOwnership(tripId, req.user.id)
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const item = await BudgetItem.create({
      trip_id: tripId,
      category,
      label,
      estimated_cost: estimated_cost || 0,
      actual_cost:    actual_cost    || null,
    })

    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const item = await BudgetItem.findByPk(req.params.id, {
      include: [{ model: Trip }]
    })

    if (!item) return res.status(404).json({ error: 'Budget item not found' })
    if (item.Trip.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    const { category, label, estimated_cost, actual_cost } = req.body

    await item.update({ category, label, estimated_cost, actual_cost })

    res.json(item)
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const item = await BudgetItem.findByPk(req.params.id, {
      include: [{ model: Trip }]
    })

    if (!item) return res.status(404).json({ error: 'Budget item not found' })
    if (item.Trip.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    await item.destroy()

    res.json({ message: 'Budget item deleted successfully' })
  } catch (err) {
    next(err)
  }
}