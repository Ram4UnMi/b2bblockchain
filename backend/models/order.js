'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.Reseller, { foreignKey: 'resellerId' });
      Order.belongsTo(models.Supplier, { foreignKey: 'supplierId' });
      Order.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }
  Order.init({
    resellerId: { type: DataTypes.INTEGER, allowNull: false },
    supplierId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { 
      type: DataTypes.ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled'), 
      defaultValue: 'pending' 
    },
    txHash: { type: DataTypes.STRING, allowNull: true } // Blockchain Transaction Hash
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};