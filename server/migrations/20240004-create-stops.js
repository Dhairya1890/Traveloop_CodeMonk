'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stops', {
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
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'cities', key: 'id' },
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      arrival_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      departure_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('stops')
  }
}