module.exports = (sequelize, DataTypes) => {
  const StopActivity = sequelize.define('StopActivity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    stop_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    scheduled_time: {
      type: DataTypes.TIME,
      defaultValue: null,
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
  }, {
    tableName: 'stop_activities',
    timestamps: true,
    underscored: true,
  })

  return StopActivity
}