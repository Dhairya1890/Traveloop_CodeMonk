'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add share_token to trips
    await queryInterface.addColumn('trips', 'share_token', {
      type: Sequelize.STRING(64),
      allowNull: true,
      unique: true,
      after: 'status',
    })

    // Back-fill existing trips with a UUID token
    await queryInterface.sequelize.query(`
      UPDATE trips
      SET share_token = REPLACE(UUID(), '-', '')
      WHERE share_token IS NULL
    `)
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('trips', 'share_token')
  },
}
