module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define('Activity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    category: {
      type: DataTypes.ENUM('sightseeing', 'food', 'adventure', 'culture', 'shopping', 'nature', 'nightlife', 'other'),
      defaultValue: 'other',
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
    },
    image_url: {
      type: DataTypes.STRING(500),
      defaultValue: null,
    },
  }, {
    tableName: 'activities',
    timestamps: true,
    underscored: true,
  })

  return Activity
}