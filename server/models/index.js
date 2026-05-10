const { Sequelize } = require('sequelize')
const config = require('../config/database')
require('dotenv').config()

const env = process.env.NODE_ENV || 'development'
const dbConfig = config[env]

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
})

const db = {}
db.sequelize = sequelize
db.Sequelize = Sequelize

// Import models
db.User         = require('./User')(sequelize, Sequelize)
db.Trip         = require('./Trip')(sequelize, Sequelize)
db.Stop         = require('./Stop')(sequelize, Sequelize)
db.City         = require('./City')(sequelize, Sequelize)
db.Activity     = require('./Activity')(sequelize, Sequelize)
db.StopActivity = require('./StopActivity')(sequelize, Sequelize)
db.BudgetItem   = require('./BudgetItem')(sequelize, Sequelize)
db.PackingItem  = require('./PackingItem')(sequelize, Sequelize)
db.TripNote     = require('./TripNote')(sequelize, Sequelize)

// Associations
// User
db.User.hasMany(db.Trip, { foreignKey: 'user_id', onDelete: 'CASCADE' })
db.Trip.belongsTo(db.User, { foreignKey: 'user_id' })

// Trip
db.Trip.hasMany(db.Stop,        { foreignKey: 'trip_id', onDelete: 'CASCADE' })
db.Trip.hasMany(db.BudgetItem,  { foreignKey: 'trip_id', onDelete: 'CASCADE' })
db.Trip.hasMany(db.PackingItem, { foreignKey: 'trip_id', onDelete: 'CASCADE' })
db.Trip.hasMany(db.TripNote,    { foreignKey: 'trip_id', onDelete: 'CASCADE' })

db.Stop.belongsTo(db.Trip, { foreignKey: 'trip_id' })
db.BudgetItem.belongsTo(db.Trip,  { foreignKey: 'trip_id' })
db.PackingItem.belongsTo(db.Trip, { foreignKey: 'trip_id' })
db.TripNote.belongsTo(db.Trip,    { foreignKey: 'trip_id' })

// Stop
db.Stop.belongsTo(db.City, { foreignKey: 'city_id' })
db.City.hasMany(db.Stop,   { foreignKey: 'city_id' })

// Stop <-> Activity (many to many through StopActivity)
db.Stop.belongsToMany(db.Activity, { through: db.StopActivity, foreignKey: 'stop_id' })
db.Activity.belongsToMany(db.Stop, { through: db.StopActivity, foreignKey: 'activity_id' })

db.StopActivity.belongsTo(db.Stop,     { foreignKey: 'stop_id' })
db.StopActivity.belongsTo(db.Activity, { foreignKey: 'activity_id' })

// City
db.City.hasMany(db.Activity, { foreignKey: 'city_id', onDelete: 'CASCADE' })
db.Activity.belongsTo(db.City, { foreignKey: 'city_id' })

// TripNote optional stop
db.TripNote.belongsTo(db.Stop, { foreignKey: 'stop_id', constraints: false })

module.exports = db