const { City, Activity } = require('../models')
const { Op } = require('sequelize')

exports.getAll = async (req, res, next) => {
  try {
    const { search, country, region, sort } = req.query

    const where = {}

    if (search) {
      where[Op.or] = [
        { name:    { [Op.like]: `%${search}%` } },
        { country: { [Op.like]: `%${search}%` } },
      ]
    }

    if (country) where.country = { [Op.like]: `%${country}%` }
    if (region)  where.region  = { [Op.like]: `%${region}%` }

    const order = []
    if (sort === 'popular')  order.push(['popularity_score', 'DESC'])
    if (sort === 'cheapest') order.push(['cost_index', 'ASC'])
    if (sort === 'expensive') order.push(['cost_index', 'DESC'])
    if (!order.length)       order.push(['name', 'ASC'])

    const cities = await City.findAll({ where, order })

    res.json(cities)
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const city = await City.findByPk(req.params.id, {
      include: [
        {
          model: Activity,
          attributes: ['id', 'name', 'category', 'cost', 'duration_minutes', 'image_url', 'description']
        }
      ]
    })

    if (!city) return res.status(404).json({ error: 'City not found' })

    res.json(city)
  } catch (err) {
    next(err)
  }
}