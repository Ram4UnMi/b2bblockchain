'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      Supplier.hasMany(models.Product, { foreignKey: 'supplierId' });
      Supplier.hasMany(models.Order, { foreignKey: 'supplierId' });
    }
  }
  Supplier.init({
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    walletAddress: { type: DataTypes.STRING, allowNull: true },
    companyName: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Supplier',
  });
  return Supplier;
};