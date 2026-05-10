'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      region: {
        type: Sequelize.STRING(100),
        defaultValue: null,
      },
      cost_index: {
        type: Sequelize.DECIMAL(4, 2),
        defaultValue: null,
      },
      popularity_score: {
        type: Sequelize.DECIMAL(4, 2),
        defaultValue: null,
      },
      image_url: {
        type: Sequelize.STRING(500),
        defaultValue: null,
      },
      description: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 7),
        defaultValue: null,
      },
      longitude: {
        type: Sequelize.DECIMAL(10, 7),
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
    await queryInterface.dropTable('cities')
  }
}