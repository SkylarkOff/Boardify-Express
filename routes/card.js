const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// 🔒 Validasi akses user terhadap board (via organization)
async function userHasAccessToBoard(userId, boardId) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { organization: true }
  });
  if (!board) return false;

  const member = await prisma.organizationMember.findFirst({
    where: {
      userId,
      organizationId: board.organizationId
    }
  });

  return !!member;
}

// ✅ Create Card (langsung ke board)
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, boardId, deadline } = req.body;

  if (!title || !boardId) {
    return res.status(400).json({ error: 'Field title dan boardId wajib' });
  }

  try {
    const access = await userHasAccessToBoard(req.user.id, boardId);
    if (!access) return res.status(403).json({ error: 'Akses ditolak ke board ini' });

    const newCard = await prisma.card.create({
      data: {
        title,
        description,
        board: { connect: { id: boardId } },
        deadline: deadline ? new Date(deadline) : null,
      }
    });

    res.status(201).json({ message: 'Card berhasil dibuat', data: newCard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal membuat card' });
  }
});

// ✅ Get semua card berdasarkan board
router.get('/board/:boardId', authenticateToken, async (req, res) => {
  const { boardId } = req.params;

  try {
    const access = await userHasAccessToBoard(req.user.id, boardId);
    if (!access) return res.status(403).json({ error: 'Akses ditolak ke board ini' });

    const cards = await prisma.card.findMany({
      where: { boardId },
      include: { files: true }
    });

    res.json({ message: 'Data card berhasil diambil', data: cards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil cards' });
  }
});

// ✅ Get card by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const card = await prisma.card.findUnique({
      where: { id },
      include: { files: true, board: true }
    });

    if (!card) return res.status(404).json({ error: 'Card tidak ditemukan' });

    const access = await userHasAccessToBoard(req.user.id, card.boardId);
    if (!access) return res.status(403).json({ error: 'Akses ditolak ke card ini' });

    res.json({ message: 'Card ditemukan', data: card });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil card' });
  }
});

// ✅ Update Card
router.patch('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, deadline } = req.body;

  try {
    const card = await prisma.card.findUnique({ where: { id }, include: { board: true } });
    if (!card) return res.status(404).json({ error: 'Card tidak ditemukan' });

    const access = await userHasAccessToBoard(req.user.id, card.boardId);
    if (!access) return res.status(403).json({ error: 'Akses ditolak ke card ini' });

    const updated = await prisma.card.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(deadline !== undefined && { deadline: new Date(deadline) }),
      }
    });

    res.json({ message: 'Card berhasil diperbarui', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memperbarui card' });
  }
});

// ✅ Delete Card
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const card = await prisma.card.findUnique({ where: { id }, include: { board: true } });
    if (!card) return res.status(404).json({ error: 'Card tidak ditemukan' });

    const access = await userHasAccessToBoard(req.user.id, card.boardId);
    if (!access) return res.status(403).json({ error: 'Akses ditolak ke card ini' });

    await prisma.card.delete({ where: { id } });

    res.json({ message: 'Card berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus card' });
  }
});

module.exports = router;
