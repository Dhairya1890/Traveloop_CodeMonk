module.exports = (sequelize, DataTypes) => {
  const BudgetItem = sequelize.define('BudgetItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('transport', 'stay', 'food', 'activity', 'shopping', 'other'),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    estimated_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    actual_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: null,
    },
  }, {
    tableName: 'budget_items',
    timestamps: true,
    underscored: true,
  })

  return BudgetItem
}