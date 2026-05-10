module.exports = (sequelize, DataTypes) => {
  const PackingItem = sequelize.define('PackingItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('clothing', 'documents', 'electronics', 'toiletries', 'medicine', 'other'),
      defaultValue: 'other',
    },
    is_packed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'packing_items',
    timestamps: true,
    underscored: true,
  })

  return PackingItem
}