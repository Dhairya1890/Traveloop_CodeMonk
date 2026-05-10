'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('packing_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      trip_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'trips', key: 'id' },
        onDelete: 'CASCADE',
      },
      label: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM('clothing', 'documents', 'electronics', 'toiletries', 'medicine', 'other'),
        defaultValue: 'other',
      },
      is_packed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    })
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('packing_items')
  }
}