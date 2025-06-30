const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

// ✅ Registrasi user hanya dengan username, email, dan password
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 🔍 Cek apakah email atau username sudah digunakan
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: 'Email atau Username sudah digunakan' });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🆕 Buat user baru
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'MAHASISWA', // default role
      },
    });

    // 🎉 Kirim respons sukses
    res.status(201).json({
      message: 'Berhasil daftar',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal daftar' });
  }
});
// n/regis mahasiswa


// Cek apakah email atau username terdaftar
router.post('/check-user', async (req, res) => {
  const { input } = req.body;
  console.log('🔎 Cek user:', input);

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input },
          { username: input },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    return res.status(200).json({ message: 'User ditemukan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});
// n/cek-email


// Login + Kirim JWT
router.post('/login', async (req, res) => {
  const { input, password } = req.body;
  console.log('🔐 Proses login dimulai untuk:', input); // Log input awal

  try {
    // Cari user berdasarkan email atau username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input },
          { username: input },
        ],
      },
    });

    if (!user) {
      console.warn('❌ User tidak ditemukan untuk:', input);
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Cek password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.warn('❌ Password tidak cocok untuk user:', user.email);
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Buat JWT token
    const token = jwt.sign(
      { id: user.id,
        email: user.email,
        role: user.role.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Login sukses: ${user.email} (role: ${user.role})`);

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('🔥 Error saat login:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
});
// n/login


// Tambah dosen
router.post('/register-dosen', async (req, res) => {
  const { username, email, password, nip, nama, fakultas, prodi } = req.body

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing) {
      return res.status(400).json({ error: 'Email atau Username sudah digunakan' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'DOSEN',
        dosen: {
          create: { nip, nama, fakultas, prodi },
        },
      },
      include: { dosen: true },
    })

    res.status(201).json({
      message: 'Berhasil daftar dosen',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        dosen: newUser.dosen,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal daftar dosen' })
  }
})


// n/tambah-dosen

module.exports = router