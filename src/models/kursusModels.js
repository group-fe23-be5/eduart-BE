const sequelize = require('../config/database');
const {DataTypes, Sequelize, Model} = require('sequelize');

class Kursus extends Model {}

Kursus.init({
  id_kursus: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  judul: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deskiripsi: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  harga: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  video: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  silabus: {
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
  modelName: 'Kursus',
  tableName: 'kursus',
}
);

module.exports = Kursus;