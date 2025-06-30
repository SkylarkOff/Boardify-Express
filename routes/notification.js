const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authenticateToken = require('../middleware/authMiddleware')

const prisma = new PrismaClient()

// ✅ Ambil semua notifikasi milik user (berdasarkan token)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ message: 'Notifikasi berhasil diambil', data: notifications })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal mengambil notifikasi' })
  }
})

// ✅ Tandai notifikasi sebagai dibaca
router.patch('/:id/read', authenticateToken, async (req, res) => {
  const { id } = req.params

  try {
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    res.json({ message: 'Notifikasi ditandai sebagai dibaca', data: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal update notifikasi' })
  }
})

// ✅ Buat notifikasi baru
router.post('/', authenticateToken, async (req, res) => {
  const { userId, content } = req.body

  try {
    const newNotif = await prisma.notification.create({
      data: {
        userId,
        content
      }
    })

    res.status(201).json({ message: 'Notifikasi berhasil dibuat', data: newNotif })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal membuat notifikasi' })
  }
})

module.exports = router
