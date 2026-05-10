const { Trip, User, Stop, City, TripLike, sequelize } = require('../models')
const { QueryTypes, Op } = require('sequelize')

/* ── GET /api/community ─────────────────────────────────────────
   Returns paginated public trips with author, stop count, like count,
   and whether the requesting user has liked each trip.
─────────────────────────────────────────────────────────────── */
exports.getFeed = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 18 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    const userId = req.user.id

    const where = { is_public: true }
    if (status && ['planning', 'ongoing', 'completed'].includes(status)) {
      where.status = status
    }
    if (search) {
      where.title = { [Op.like]: `%${search}%` }
    }

    const { count, rows: trips } = await Trip.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar_url'],
        },
        {
          model: Stop,
          attributes: ['id'],
          include: [{ model: City, attributes: ['name', 'country'] }],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
      distinct: true,
    })

    // Fetch like counts and user's liked trips in bulk
    const tripIds = trips.map(t => t.id)

    let likeCounts = {}
    let likedByUser = new Set()

    if (tripIds.length > 0) {
      const counts = await TripLike.findAll({
        where: { trip_id: tripIds },
        attributes: ['trip_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['trip_id'],
        raw: true,
      })
      counts.forEach(r => { likeCounts[r.trip_id] = Number(r.count) })

      const userLikes = await TripLike.findAll({
        where: { trip_id: tripIds, user_id: userId },
        attributes: ['trip_id'],
        raw: true,
      })
      userLikes.forEach(r => likedByUser.add(r.trip_id))
    }

    const data = trips.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      cover_photo: t.cover_photo,
      status: t.status,
      start_date: t.start_date,
      end_date: t.end_date,
      share_token: t.share_token,
      author: t.User,
      stops: t.Stops?.map(s => ({ city: s.City?.name, country: s.City?.country })) || [],
      like_count: likeCounts[t.id] || 0,
      liked_by_me: likedByUser.has(t.id),
    }))

    res.json({
      trips: data,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
    })
  } catch (err) {
    next(err)
  }
}

/* ── POST /api/community/:tripId/like ───────────────────────────
   Toggle like — creates if not exists, deletes if exists.
   Returns { liked: bool, like_count: number }
─────────────────────────────────────────────────────────────── */
exports.toggleLike = async (req, res, next) => {
  try {
    const { tripId } = req.params
    const userId = req.user.id

    // Verify trip exists and is public
    const trip = await Trip.findOne({ where: { id: tripId, is_public: true } })
    if (!trip) return res.status(404).json({ error: 'Trip not found or not public' })

    const existing = await TripLike.findOne({ where: { trip_id: tripId, user_id: userId } })

    if (existing) {
      await existing.destroy()
    } else {
      await TripLike.create({ trip_id: tripId, user_id: userId })
    }

    const likeCount = await TripLike.count({ where: { trip_id: tripId } })

    res.json({ liked: !existing, like_count: likeCount })
  } catch (err) {
    next(err)
  }
}
