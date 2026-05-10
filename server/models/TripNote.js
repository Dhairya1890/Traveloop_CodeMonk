module.exports = (sequelize, DataTypes) => {
  const TripNote = sequelize.define('TripNote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stop_id: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'trip_notes',
    timestamps: true,
    underscored: true,
  })

  return TripNote
}