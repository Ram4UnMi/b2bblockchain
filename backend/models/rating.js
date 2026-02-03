'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.Product, { foreignKey: 'productId' });
      Rating.belongsTo(models.Reseller, { foreignKey: 'resellerId' });
    }
  }
  Rating.init({
    productId: DataTypes.INTEGER,
    resellerId: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    comment: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Rating',
  });
  return Rating;
};