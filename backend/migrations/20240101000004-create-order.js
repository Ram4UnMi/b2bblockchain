'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      resellerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Resellers', key: 'id' }
      },
      supplierId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Suppliers', key: 'id' }
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Products', key: 'id' }
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      totalPrice: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: { 
        type: Sequelize.ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled'), 
        defaultValue: 'pending' 
      },
      txHash: { type: Sequelize.STRING, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};