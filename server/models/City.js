module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define('City', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(100),
      defaultValue: null,
    },
    cost_index: {
      type: DataTypes.DECIMAL(4, 2),
      defaultValue: null,
      comment: '1-10 scale, 10 being most expensive',
    },
    popularity_score: {
      type: DataTypes.DECIMAL(4, 2),
      defaultValue: null,
    },
    image_url: {
      type: DataTypes.STRING(500),
      defaultValue: null,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      defaultValue: null,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      defaultValue: null,
    },
  }, {
    tableName: 'cities',
    timestamps: true,
    underscored: true,
  })

  return City
}