const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Payment extends Model {}

Payment.init(
  {
    idPayment: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    metode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    va: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filepath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
  }
);

module.exports = Payment;
