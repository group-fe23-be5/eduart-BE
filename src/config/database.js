const {Sequelize} = require('sequelize');


// Koneksi ke database MySQL
const sequelize = new Sequelize(
    "railway",
    "root",
    "X7nosSDmTZSfanoJ0v9A",
    {
      host: "containers-us-west-98.railway.app",
      port: 5534,
      dialect: 'mysql'
    }
  );

module.exports = sequelize;