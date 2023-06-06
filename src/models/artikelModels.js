const sequelize = require('../config/database');
const {DataTypes, Sequelize, Model} = require('sequelize');

class Artikel extends Model {}

Artikel.init({
  id_artikel: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  judul: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
  },
  subJudul: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.JSON,
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
},{
  sequelize,
  modelName: 'Artikel',
  tableName: 'artikels',
}
);

module.exports = Artikel;