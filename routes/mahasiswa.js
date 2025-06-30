const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authenticateToken = require('../middleware/authMiddleware')

const prisma = new PrismaClient()

// ✅ Ambil profil mahasiswa berdasarkan token
router.get('/profil', authenticateToken, async (req, res) => {
  try { 
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      },
    })

    if (!mahasiswa) {
      return res.status(404).json({ error: 'Mahasiswa tidak ditemukan' })
    }

    res.json({
      message: 'Profil mahasiswa ditemukan',
      data: {
        id: mahasiswa.id,
        nim: mahasiswa.nim,
        nama: mahasiswa.nama,
        fakultas: mahasiswa.fakultas,
        prodi: mahasiswa.prodi,
        user: mahasiswa.user
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal ambil profil mahasiswa' })
  }
})


// 🔄 Perbarui profil mahasiswa berdasarkan token
router.put('/profil', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'MAHASISWA') {
      return res.status(403).json({ error: 'Akses ditolak' })
    }

    const { nim, nama, fakultas, prodi } = req.body

    // Validasi input minimal
    if (!nim || !nama || !fakultas || !prodi) {
      return res.status(400).json({ error: 'Semua field wajib diisi' })
    }

    const updatedMahasiswa = await prisma.mahasiswa.update({
      where: { userId: req.user.id },
      data: { nim, nama, fakultas, prodi },
    })

    res.json({
      message: 'Profil mahasiswa berhasil diperbarui',
      data: updatedMahasiswa,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal update profil mahasiswa' })
  }
})

module.exports = router
