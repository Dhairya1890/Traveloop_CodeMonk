'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stop_activities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      stop_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'stops', key: 'id' },
        onDelete: 'CASCADE',
      },
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'activities', key: 'id' },
        onDelete: 'CASCADE',
      },
      scheduled_time: {
        type: Sequelize.TIME,
        defaultValue: null,
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
    await queryInterface.dropTable('stop_activities')
  }
}