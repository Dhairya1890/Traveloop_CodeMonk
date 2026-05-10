'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'cities', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      category: {
        type: Sequelize.ENUM('sightseeing', 'food', 'adventure', 'culture', 'shopping', 'nature', 'nightlife', 'other'),
        defaultValue: 'other',
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 60,
      },
      image_url: {
        type: Sequelize.STRING(500),
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
    await queryInterface.dropTable('activities')
  }
}