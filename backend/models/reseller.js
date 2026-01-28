'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reseller extends Model {
    static associate(models) {
      Reseller.hasMany(models.Order, { foreignKey: 'resellerId' });
    }
  }
  Reseller.init({
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    walletAddress: { type: DataTypes.STRING, allowNull: true },
    storeName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Reseller',
  });
  return Reseller;
};