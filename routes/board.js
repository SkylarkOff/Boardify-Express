const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// Buat board baru
router.post('/', authenticateToken, async (req, res) => {
  const { title, organizationId, background } = req.body;

  try {
    if ((req.user.role || '').toLowerCase() !== 'mahasiswa') {
      return res.status(403).json({ error: 'Hanya mahasiswa yang dapat membuat board' });
    }

    const newBoard = await prisma.board.create({
      data: {
        title,
        background,
        organization: {
          connect: { id: organizationId },
        },
        creator: {
          connect: { id: req.user.id },
        },
      },
    });

    res.status(201).json({ message: 'Board berhasil dibuat', board: newBoard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal membuat board' });
  }
});



// Ambil semua board dalam workspace
router.get('/org/:organizationId', authenticateToken, async (req, res) => {
  const { organizationId } = req.params;

  try {
    // Cek apakah user merupakan anggota org tersebut
    const member = await prisma.OrganizationMember.findFirst({
      where: {
        userId: req.user.id,
        organizationId: organizationId,
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Akses ditolak: Bukan anggota organisasi' });
    }

    const boards = await prisma.board.findMany({
      where: {  organizationId: organizationId, },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ boards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil boards' });
  }
});


// Ambil detail board
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const board = await prisma.board.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        background: true,
        createdAt: true,
        updatedAt: true,
        creatorId: true,
        organizationId: true,
      },
    });

    if (!board) return res.status(404).json({ error: 'Board tidak ditemukan' });

    // Cek apakah user adalah anggota organisasi board ini
    const isMember = await prisma.organizationMember.findFirst({
      where: {
        userId: req.user.id,
        organizationId: board.organizationId,
      },
    });

    if (!isMember) return res.status(403).json({ error: 'Akses ditolak' });

    res.json({ board });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil detail board' });
  }
});



// Edit board (hanya owner)
router.put('/:id/edit', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const board = await prisma.board.findUnique({ where: { id } });

    if (!board) return res.status(404).json({ error: 'Board tidak ditemukan' });

    // Hanya pembuat board yang bisa mengedit
    if (board.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Hanya pembuat yang dapat mengedit board' });
    }

    const updated = await prisma.board.update({
      where: { id },
      data: { title }
    });

    res.json({ message: 'Board berhasil diperbarui', board: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal edit board' });
  }
});


// Hapus board (hanya owner)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const board = await prisma.board.findUnique({ where: { id } });

    if (!board) return res.status(404).json({ error: 'Board tidak ditemukan' });

    if (board.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Hanya pembuat yang dapat menghapus board' });
    }

    await prisma.board.delete({
      where: { id }
    });

    res.json({ message: 'Board berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus board' });
  }
});


module.exports = router;