'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Supplier, { foreignKey: 'supplierId' });
      Product.hasMany(models.Order, { foreignKey: 'productId' });
      Product.hasMany(models.Rating, { foreignKey: 'productId' });
    }
  }
  Product.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    imageUrl: DataTypes.STRING,
    category: DataTypes.STRING,
    supplierId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
    paranoid: true // Enable Soft Deletes
  });
  return Product;
};