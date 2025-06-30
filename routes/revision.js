const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authenticateToken = require('../middleware/authMiddleware')

const prisma = new PrismaClient()

// ✅ Ambil semua revisi dalam satu card
router.get('/card/:cardId', authenticateToken, async (req, res) => {
  const { cardId } = req.params

  try {
    const revisions = await prisma.revision.findMany({
      where: { cardId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    res.json({ message: 'Revisi berhasil diambil', data: revisions })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal ambil revisi' })
  }
})

// ✅ Tambahkan revisi baru ke card
router.post('/', authenticateToken, async (req, res) => {
  const { cardId, message } = req.body
  const userId = req.user.id

  try {
    const newRevision = await prisma.revision.create({
      data: {
        cardId,
        userId,
        message
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    })

    res.status(201).json({ message: 'Revisi berhasil ditambahkan', data: newRevision })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal tambah revisi' })
  }
})

module.exports = router