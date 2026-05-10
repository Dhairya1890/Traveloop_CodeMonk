const { User, Trip, Stop, City, Activity } = require('../models')
const { sequelize } = require('../models')
const { QueryTypes } = require('sequelize')

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers     = await User.count()
    const totalTrips     = await Trip.count()
    const totalStops     = await Stop.count()
    const publicTrips    = await Trip.count({ where: { is_public: true } })
    const totalCities    = await City.count()
    const totalActivities = await Activity.count()

    const topCities = await sequelize.query(`
      SELECT c.id, c.name, c.country, COUNT(s.id) as stop_count
      FROM cities c
      LEFT JOIN stops s ON s.city_id = c.id
      GROUP BY c.id, c.name, c.country
      ORDER BY stop_count DESC
      LIMIT 5
    `, { type: QueryTypes.SELECT })

    const recentUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5,
    })

    const recentTrips = await Trip.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit: 5,
    })

    res.json({
      counts: {
        users: totalUsers,
        trips: totalTrips,
        stops: totalStops,
        public_trips: publicTrips,
        cities: totalCities,
        activities: totalActivities,
      },
      top_cities: topCities,
      recent_users: recentUsers,
      recent_trips: recentTrips,
    })
  } catch (err) {
    next(err)
  }
}

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Trip, attributes: ['id', 'title', 'status'] }],
      order: [['created_at', 'DESC']]
    })

    res.json(users)
  } catch (err) {
    next(err)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' })

    await user.destroy()

    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    next(err)
  }
}