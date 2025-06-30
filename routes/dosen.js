const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authenticateToken = require('../middleware/authMiddleware')

const prisma = new PrismaClient()

// ✅ GET profil dosen berdasarkan token
router.get('/profil', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'DOSEN') {
      return res.status(403).json({ error: 'Akses ditolak' })
    }

    const dosen = await prisma.dosen.findUnique({
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
      }
    })

    if (!dosen) {
      return res.status(404).json({ error: 'Dosen tidak ditemukan' })
    }

    res.json({
      message: 'Profil dosen ditemukan',
      data: {
        id: dosen.id,
        nip: dosen.nip,
        nama: dosen.nama,
        user: dosen.user
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal ambil profil dosen' })
  }
})


// 🔄 Update profil dosen berdasarkan token
router.put('/profil', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'DOSEN') {
      return res.status(403).json({ error: 'Akses ditolak' })
    }

    const { nip, nama } = req.body

    const updatedDosen = await prisma.dosen.update({
      where: { userId: req.user.id },
      data: {
        nip,
        nama,
      },
    })

    res.json({
      message: 'Profil dosen berhasil diperbarui',
      data: updatedDosen,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal update profil dosen' })
  }
})


module.exports = router