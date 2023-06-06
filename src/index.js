require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// const User = require('./models/userModels');
const router = require('./routes/index');
const sequelize = require('./config/database');
const {Sequelize} = require('sequelize');
const app = express();
const jwtSecret = process.env.JWT_SECRET;

const port = process.env.PORT || 3000;



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use('/assets', express.static('uploads'))

// Sinkronisasi model dengan database
sequelize.sync({force: false})
  .then(() => {
    // Jalankan server
  app.listen(port, () => {
    console.log(`Server berjalan pada http://localhost:${port}`);
  });
    console.log('Tabel pengguna telah dibuat');
  })
  .catch(error => {
    console.error('Terjadi kesalahan saat sinkronisasi tabel:', error);
  });

app.use(router);



  