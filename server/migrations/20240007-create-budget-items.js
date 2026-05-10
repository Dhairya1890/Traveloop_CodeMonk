'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('budget_items', {
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
      category: {
        type: Sequelize.ENUM('transport', 'stay', 'food', 'activity', 'shopping', 'other'),
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      estimated_cost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      actual_cost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: null,
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
    await queryInterface.dropTable('budget_items')
  }
}