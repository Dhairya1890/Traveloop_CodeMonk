const { Activity, City, Stop, StopActivity, Trip } = require('../models')
const { Op } = require('sequelize')

exports.getAll = async (req, res, next) => {
  try {
    const { search, category, city_id, min_cost, max_cost } = req.query

    const where = {}

    if (search) {
      where.name = { [Op.like]: `%${search}%` }
    }

    if (category) where.category = category
    if (city_id)  where.city_id  = city_id

    if (min_cost || max_cost) {
      where.cost = {}
      if (min_cost) where.cost[Op.gte] = parseFloat(min_cost)
      if (max_cost) where.cost[Op.lte] = parseFloat(max_cost)
    }

    const activities = await Activity.findAll({
      where,
      include: [{ model: City, attributes: ['id', 'name', 'country'] }],
      order: [['name', 'ASC']]
    })

    res.json(activities)
  } catch (err) {
    next(err)
  }
}

exports.getByCity = async (req, res, next) => {
  try {
    const { cityId } = req.params
    const { category } = req.query

    const where = { city_id: cityId }
    if (category) where.category = category

    const activities = await Activity.findAll({
      where,
      order: [['name', 'ASC']]
    })

    res.json(activities)
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const activity = await Activity.findByPk(req.params.id, {
      include: [{ model: City, attributes: ['id', 'name', 'country'] }]
    })

    if (!activity) return res.status(404).json({ error: 'Activity not found' })

    res.json(activity)
  } catch (err) {
    next(err)
  }
}

exports.addToStop = async (req, res, next) => {
  try {
    const { stopId } = req.params
    const { activity_id, scheduled_time, notes } = req.body

    if (!activity_id) return res.status(400).json({ error: 'activity_id is required' })

    // verify stop belongs to user
    const stop = await Stop.findByPk(stopId, {
      include: [{ model: Trip }]
    })

    if (!stop) return res.status(404).json({ error: 'Stop not found' })
    if (stop.Trip.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    const activity = await Activity.findByPk(activity_id)
    if (!activity) return res.status(404).json({ error: 'Activity not found' })

    // check if already added
    const existing = await StopActivity.findOne({
      where: { stop_id: stopId, activity_id }
    })
    if (existing) return res.status(409).json({ error: 'Activity already added to this stop' })

    const stopActivity = await StopActivity.create({
      stop_id: stopId,
      activity_id,
      scheduled_time: scheduled_time || null,
      notes: notes || null,
    })

    res.status(201).json(stopActivity)
  } catch (err) {
    next(err)
  }
}

exports.removeFromStop = async (req, res, next) => {
  try {
    const { stopId, activityId } = req.params

    const stop = await Stop.findByPk(stopId, {
      include: [{ model: Trip }]
    })

    if (!stop) return res.status(404).json({ error: 'Stop not found' })
    if (stop.Trip.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' })

    const stopActivity = await StopActivity.findOne({
      where: { stop_id: stopId, activity_id: activityId }
    })

    if (!stopActivity) return res.status(404).json({ error: 'Activity not found on this stop' })

    await stopActivity.destroy()

    res.json({ message: 'Activity removed from stop' })
  } catch (err) {
    next(err)
  }
}