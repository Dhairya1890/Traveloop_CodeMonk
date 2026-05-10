module.exports = (sequelize, DataTypes) => {
  const Stop = sequelize.define('Stop', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    arrival_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    departure_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
  }, {
    tableName: 'stops',
    timestamps: true,
    underscored: true,
  })

  return Stop
}