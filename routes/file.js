const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authenticateToken = require('../middleware/authMiddleware')

const prisma = new PrismaClient()

// ✅ Upload file ke card tertentu
router.post('/', authenticateToken, async (req, res) => {
  const { cardId, url, name, type } = req.body

  try {
    const newFile = await prisma.file.create({
      data: {
        cardId,
        url,
        name,
        type
      }
    })

    res.status(201).json({ message: 'File berhasil di-upload', data: newFile })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal upload file' })
  }
})

// ✅ Ambil semua file dari card tertentu
router.get('/card/:cardId', authenticateToken, async (req, res) => {
  const { cardId } = req.params

  try {
    const files = await prisma.file.findMany({
      where: { cardId }
    })

    res.json({ message: 'Data file berhasil diambil', data: files })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal mengambil file' })
  }
})

// ✅ Hapus file by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params

  try {
    await prisma.file.delete({
      where: { id }
    })

    res.json({ message: 'File berhasil dihapus' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal menghapus file' })
  }
})

module.exports = router
