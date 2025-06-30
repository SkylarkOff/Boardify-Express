const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authenticateToken = require('../middleware/authMiddleware')

const prisma = new PrismaClient()

// ✅ GET semua audit log (dengan filter opsional)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId, boardId, action, startDate, endDate } = req.query

    const whereClause = {
      ...(userId && { userId: parseInt(userId) }),
      ...(boardId && { boardId }),
      ...(action && { action }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        board: {
          select: { title: true }
        }
      }
    })

    res.json(logs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil audit log' })
  }
})

// ✅ POST audit log secara manual (jika dibutuhkan)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { action, boardId, details } = req.body

    const newLog = await prisma.auditLog.create({
      data: {
        action,
        boardId,
        details,
        userId: req.user.id
      }
    })

    res.status(201).json(newLog)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mencatat audit log' })
  }
})

module.exports = router