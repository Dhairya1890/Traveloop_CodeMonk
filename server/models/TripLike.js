module.exports = (sequelize, DataTypes) => {
  const TripLike = sequelize.define('TripLike', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'trip_likes',
    timestamps: true,
    underscored: true,
  })

  return TripLike
}
