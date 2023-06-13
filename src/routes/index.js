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
const Payment = require('../models/paymentModels');
const Mentor = require('../models/mentorModels');
const Kursus = require('../models/kursusModels');
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
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });

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

    res.json({
      code: 200, 
      message: 'Logout berhasil' 
    });
  });
});

// Endpoint untuk mendapatkan daftar pengguna
// app.get('/users', async (req, res) => {
//   try {
//     // Dapatkan token dari header Authorization
//     const authHeader = req.headers.authorization;
//     console.log(`ini token ${authHeader}`);

//     if (!authHeader) {
//       return res.status(401).json({ error: 'Token tidak ditemukan' });
//     }

//     // Split header Authorization untuk mendapatkan token
//     const token = authHeader.split(' ')[1];

//     // Verifikasi token
//     jwt.verify(token, jwtSecret, async (error, decoded) => {
//       if (error) {
//         return res.status(401).json({ error: 'Token tidak valid' });
//       }

//       // Lakukan tindakan yang diperlukan untuk mendapatkan daftar pengguna dari database
//       try {
//         // Lakukan tindakan yang diperlukan untuk mendapatkan daftar pengguna dari database
//         const users = await User.findAll({
//           attributes: { exclude: ['password'] } // Exclude field 'password' from the result
//         });

//         // Mengembalikan daftar pengguna tanpa password
//         res.json(users);
//       } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Terjadi kesalahan pada server' });
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Terjadi kesalahan pada server' });
//   }
// });

app.get('/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, jwtSecret, async (error, decoded) => {
      if (error) {
        return res.status(401).json({ error: 'Token tidak valid' });
      }

      // Mengakses ID pengguna dari token yang sudah diverifikasi
      const userId = decoded.id;
      console.log(`ini userID ${userId}`);

      try {
        // Menggunakan ID pengguna untuk mendapatkan pengguna dari database
        const user = await User.findByPk(userId, {
          attributes: { exclude: ['password'] }
        });

        if (!user) {
          return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        }

        res.json(user);
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
    const artikel = await Artikel.create({
      judul,
      author,
      status,
      date,
      subJudul,
      content,
      filename,
      filepath: path,
    });

    res.json(artikel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

app.post('/uploadKursus', upload.single('image'), async (req, res) => {
  try {
    const { filename, path } = req.file;
    const {judul, deskiripsi,video, harga, silabus} = req.body;
    console.log(`ini ${judul}`)
    console.log(`ini ${deskiripsi}`)
    console.log(`ini ${video}`)
    console.log(`ini ${harga}`)

    const silabusData = [
      "Modul Gerak Dasar",
      "Modul Dasar Tempo Gerak",
      "Modul Pengaplikasian seni tari",
      "Praktek Tari Traditional"
    ];

    const kursus = await Kursus.create({
      judul,
      deskiripsi,
      video,
      harga,
      silabus: silabusData,
      filename,
      filepath: path,
    });

    res.json(kursus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});


app.post('/uploadPay', upload.single('image'), async (req, res) => {
  try {
    const { filename, path } = req.file;
    const {metode, va} = req.body;

    const payment = await Payment.create({
      metode,
      va,
      filename,
      filepath: path,
    });

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

app.post('/uploadMentor', upload.single('image'), async(req, res) => {
  try {
    const {filename, path} = req.file;
    const {nama, deskripsi, keahlian} = req.body;

    const mentor = await Mentor.create({
      nama,
      deskripsi,
      keahlian,
      filename,
      filepath: path,
    });

    res.json(mentor)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

app.get('/kursus', async (req, res) => {
  // const authHeader = req.headers.authorization;

  // if (!authHeader){
  //   return res.status(401).json({
  //     error: 'Token tidak ditemukan'
  //   });
  // }

  // const token = authHeader.split(' ')[1];

  // jwt.verify(token, jwtSecret, async (error, decoded) => {
  //   if (error){
  //     return res.status(401).json({error: 'Token tidak ditemukan'});
  //   }

  //   try {
  //     const kursus = Kursus.findAll();

  //     res.json(kursus);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  //   }
  // });

  try {
    const kursus = Kursus.findAll();

    res.json(kursus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

app.get('/mentor', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader){
    return res.status(401).json({
      error: 'Token tidak ditemukan'
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, jwtSecret, async (error, decoded) => {
    if (error){
      return res.status(401).json({error: 'Token tidak ditemukan'});
    }

    try {
      const mentor = Mentor.findAll();

      res.json(mentor)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  });
})

app.get('/payment', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader){
    return res.status(401).json({
      error: 'Token tidak ditemukan'
    });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, jwtSecret, async (error, decoded) => {
    if (error){
      return res.status(401).json({error: 'Token tidak ditemukan'});
    }

    try {
      const payment = await Payment.findAll();

      res.json(payment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  });
});

app.get('/artikel', async (req, res) => {
  // const authHeader = req.headers.authorization;

  // if (!authHeader) {
  //   return res.status(401).json({ error: 'Token tidak ditemukan' });
  // }

  //   // Split header Authorization untuk mendapatkan token
  // const token = authHeader.split(' ')[1];
  // jwt.verify(token, jwtSecret, async (error, decoded) => {
  //   if (error) {
  //     return res.status(401).json({ error: 'Token tidak valid' });
  //   }

  //   try {
  //     const artikel = await Artikel.findAll();
  
  //     res.json(artikel);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  //   }
    
  // });
  try {
    const artikel = await Artikel.findAll();

    res.json(artikel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
  
});

app.get('/payment/:id', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader){
    return res.status(401).json({error: 'Token tidak ditemukan'});
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, jwtSecret, async (error, decoded) => {
    if (error) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    try {
      const { id } = req.params;
      
      const payment = Payment.findByPk(id);

      if (!payment){
        return res.status(404).json({ error: 'Payment tidak ditemukan' });
      }

      res.json(payment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  });

});

app.get('/kursus/:id', async (req, res) => {
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
      const { id } = req.params;
      console.log(`ini ${id}`);
      const kursus = await Kursus.findByPk(id);
  
      if (!kursus) {
        return res.status(404).json({ error: 'Kursus tidak ditemukan' });
      }
  
      res.json(kursus);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  });
});

app.get('/artikel/:id', async (req, res) => {
  // const authHeader = req.headers.authorization;

  // if (!authHeader) {
  //   return res.status(401).json({ error: 'Token tidak ditemukan' });
  // }

  //   // Split header Authorization untuk mendapatkan token
  // const token = authHeader.split(' ')[1];


  // jwt.verify(token, jwtSecret, async (error, decoded) => {
  //   if (error) {
  //     return res.status(401).json({ error: 'Token tidak valid' });
  //   }

  //   try {
  //     const { id } = req.params;
  //     console.log(`ini ${id}`);
  //     const artikel = await Artikel.findByPk(id);
  
  //     if (!artikel) {
  //       return res.status(404).json({ error: 'Artikel tidak ditemukan' });
  //     }
  
  //     res.json(artikel);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  //   }
  // });

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