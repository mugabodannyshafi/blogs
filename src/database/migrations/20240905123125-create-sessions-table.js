module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sessions', {
      sid: {
        type: Sequelize.STRING(255),
        primaryKey: true,
      },
      expires: {
        type: Sequelize.DATE(6),
        allowNull: true,
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE(6),
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sessions');
  },
};
