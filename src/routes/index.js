require('dotenv').config();
const express = require('express');
const multer = require('multer');
const router = express.Router();
const sequelize = require('../config/database');
const {Sequelize} = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModels');
const Artikel = require('../models/artikelModels');
const app = express();
const jwtSecret = process.env.JWT_SECRET;

// Endpoint untuk registrasi
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Periksa apakah pengguna sudah terdaftar
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tambahkan pengguna ke database
    await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Endpoint untuk login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari pengguna berdasarkan username
    const user = await User.findOne({
      where: { email }
    });

    // Periksa apakah pengguna ditemukan dan cocokkan password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Buat token JWT
    const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1h' });

    // Set token sebagai cookie pada response
    res.cookie('token', token, { httpOnly: true });

    res.json({
        code: 200,
        message: 'Login berhasil',
        access_token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Endpoint untuk logout
app.post('/logout', (req, res) => {
  // Dapatkan token dari header Authorization
  const token = req.headers.authorization;
  console.log(`ini token ${token}`);

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  // Hapus cookie yang berisi token
  res.clearCookie('token');

  // Lakukan validasi dan verifikasi token
  jwt.verify(token, jwtSecret, (error, decoded) => {
    if (error) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Lakukan tindakan tambahan setelah berhasil logout, misalnya menghapus token dari database atau melakukan log aktivitas

    res.json({ message: 'Logout berhasil' });
  });
});

// Endpoint untuk mendapatkan daftar pengguna
app.get('/users', async (req, res) => {
  try {
    // Dapatkan token dari header Authorization
    const authHeader = req.headers.authorization;
    console.log(`ini token ${authHeader}`);

    if (!authHeader) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    // Split header Authorization untuk mendapatkan token
    const token = authHeader.split(' ')[1];

    // Verifikasi token
    jwt.verify(token, jwtSecret, async (error, decoded) => {
      if (error) {
        return res.status(401).json({ error: 'Token tidak valid' });
      }

      // Lakukan tindakan yang diperlukan untuk mendapatkan daftar pengguna dari database
      try {
        // Lakukan tindakan yang diperlukan untuk mendapatkan daftar pengguna dari database
        const users = await User.findAll({
          attributes: { exclude: ['password'] } // Exclude field 'password' from the result
        });

        // Mengembalikan daftar pengguna tanpa password
        res.json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Konfigurasi multer untuk mengunggah file
const storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + '-' + file.originalname;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

const formData = new FormData();



// API untuk mengunggah gambar
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { filename, path } = req.file;
    const { judul, author, status, date, subJudul, content} = req.body;
    const contentData = [
      {
        text: '"Aku mencoba untuk mempertahankan Semua kenangan yang telah kita bagi Tapi semuanya merosot di hadapanku Dan aku tidak tahu apa yang harus kuperbuat"'
      },
      {
        text: '"Apakah kau masih merindukanku Seperti yang kurasakan setiap hari? Atau kau sudah melupakan diriku Seperti bintang-bintang di langit yang jauh?"'
      },
      {
        text: '"Aku mencoba untuk tidak menangis Tetapi air mataku terus mengalir Karena kau tidak di sini untuk menghiburku Dan hatiku terus merana dan sepi"'
      },
      {
        text: '"Kita mungkin berada di sisi lain dunia Tapi aku akan selalu mencintaimu Walaupun kau terlalu jauh untuk dicapai Dan aku harus melanjutkan hidupku tanpamu"'
      }
    ];
    // formData.append('content', JSON.stringify(contentData));

    // const parsedContent = JSON.parse(contentData);
    // console.log(`ini artikel ${contentData}`);

    // Tambahkan data gambar ke database
    const artikel = await Artikel.create({
      judul,
      author,
      status,
      date,
      subJudul,
      content: contentData,
      filename,
      filepath: path,
    });

    res.json(artikel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

app.get('/artikel', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

    // Split header Authorization untuk mendapatkan token
  const token = authHeader.split(' ')[1];
  jwt.verify(token, jwtSecret, async (error, decoded) => {
    if (error) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    try {
      const artikel = await Artikel.findAll();
  
      res.json(artikel);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
    
  });
  
});

app.get('/artikel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`ini ${id}`);
    const artikel = await Artikel.findByPk(id);

    if (!artikel) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan' });
    }

    res.json(artikel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});



module.exports = app;