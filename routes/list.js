const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authenticateToken = require('../middleware/authMiddleware')

const prisma = new PrismaClient()

// 🔒 Fungsi util untuk validasi keanggotaan board
async function userHasAccessToBoard(userId, boardId) {
  // boardId sekarang adalah string, langsung pakai saja
  const board = await prisma.board.findUnique({
    where: { id: boardId }, // id string
  })
  if (!board) return false

  const member = await prisma.organizationMember.findFirst({
    where: {
      organizationId: board.organizationId,
      userId,
    },
  })

  return !!member
}

// ✅ GET semua list dari sebuah board
router.get('/:boardId', authenticateToken, async (req, res) => {
  const boardId = req.params.boardId

  if (!boardId) return res.status(400).json({ error: 'boardId tidak valid' })

  try {
    const hasAccess = await userHasAccessToBoard(req.user.id, boardId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Akses ditolak ke board ini' })
    }

    const lists = await prisma.list.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
      include: { cards: true }
    })

    res.json(lists)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal mengambil data list' })
  }
})

// ✅ Tambah list ke board
router.post('/', authenticateToken, async (req, res) => {
  const { title, boardId } = req.body

  if (!title || !boardId) {
    return res.status(400).json({ error: 'Field title dan boardId wajib diisi dan valid' })
  }

  try {
    const hasAccess = await userHasAccessToBoard(req.user.id, boardId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Akses ditolak ke board ini' })
    }

    const count = await prisma.list.count({ where: { boardId } })

    const newList = await prisma.list.create({
      data: {
        title,
        boardId,
        position: count
      }
    })

    res.status(201).json(newList)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal membuat list' })
  }
})

// ✅ Edit judul atau posisi list
router.put('/:id/edit', authenticateToken, async (req, res) => {
  const listId = req.params.id
  const { title, position } = req.body

  try {
    const existingList = await prisma.list.findUnique({ where: { id: listId } })
    if (!existingList) return res.status(404).json({ error: 'List tidak ditemukan' })

    const hasAccess = await userHasAccessToBoard(req.user.id, existingList.boardId)
    if (!hasAccess) return res.status(403).json({ error: 'Akses ditolak ke board ini' })

    if (position !== undefined && isNaN(Number(position))) {
      return res.status(400).json({ error: 'Posisi harus berupa angka' })
    }

    const updatedList = await prisma.list.update({
      where: { id: listId },
      data: {
        ...(title && { title }),
        ...(position !== undefined && { position: Number(position) })
      }
    })

    res.json(updatedList)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal memperbarui list' })
  }
})

// ✅ Hapus list
router.delete('/:id', authenticateToken, async (req, res) => {
  const listId = req.params.id

  try {
    const existingList = await prisma.list.findUnique({ where: { id: listId } })
    if (!existingList) return res.status(404).json({ error: 'List tidak ditemukan' })

    const hasAccess = await userHasAccessToBoard(req.user.id, existingList.boardId)
    if (!hasAccess) return res.status(403).json({ error: 'Akses ditolak ke board ini' })

    await prisma.list.delete({ where: { id: listId } })
    res.json({ message: 'List berhasil dihapus' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menghapus list' })
  }
})

module.exports = router
