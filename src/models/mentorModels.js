const sequelize = require('../config/database');
const {DataTypes, Sequelize, Model} = require('sequelize');

class Mentor extends Model {}

Mentor.init({
  id_mentor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  keahlian: {
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
},{
  sequelize,
  modelName: 'Mentor',
  tableName: 'mentors',
}
);

module.exports = Mentor;