const { v4: uuidv4 } = require('uuid')

module.exports = (sequelize, DataTypes) => {
  const Trip = sequelize.define('Trip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    cover_photo: {
      type: DataTypes.STRING(500),
      defaultValue: null,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    total_budget: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    status: {
      type: DataTypes.ENUM('planning', 'ongoing', 'completed'),
      defaultValue: 'planning',
    },
    share_token: {
      type: DataTypes.STRING(64),
      unique: true,
      defaultValue: () => uuidv4().replace(/-/g, ''),
    },
  }, {
    tableName: 'trips',
    timestamps: true,
    underscored: true,
  })

  return Trip
}