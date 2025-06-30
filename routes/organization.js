const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// ===================== 🏢 Workspace CRUD =====================

// ✅ Buat workspace baru
router.post('/', authenticateToken, async (req, res) => {
  const { name } = req.body;

  try {
    if (req.user.role !== 'mahasiswa') {
      return res.status(403).json({ error: 'Hanya mahasiswa yang dapat membuat organisasi' });
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id
          }
        }
      }
    });

    res.status(201).json({ message: 'Organisasi berhasil dibuat', data: organization });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal membuat organisasi' });
  }
});

// ✅ Ambil organisasi milik user
router.get('/workspace/my', authenticateToken, async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        members: { include: { user: true } }
      }
    });

    res.json({ message: 'Workspace berhasil diambil', data: organizations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil workspace' });
  }
});

// ✅ Ambil detail organisasi
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, username: true, email: true } },
        members: { include: { user: true } },
        limits: true
      }
    });

    if (!organization) return res.status(404).json({ error: 'Organisasi tidak ditemukan' });

    res.json({ organization });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil detail organisasi' });
  }
});

// ✅ Update nama organisasi
router.patch('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const org = await prisma.organization.findUnique({ where: { id } });

    if (!org) return res.status(404).json({ error: 'Organisasi tidak ditemukan' });
    if (org.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Hanya owner yang dapat mengubah nama organisasi' });
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: { name }
    });

    res.json({ message: 'Nama organisasi diperbarui', data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui organisasi' });
  }
});

// ✅ Hapus organisasi
router.delete('/:id/delete', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const org = await prisma.organization.findUnique({ where: { id } });

    if (!org) return res.status(404).json({ error: 'Organisasi tidak ditemukan' });
    if (org.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Hanya owner yang dapat menghapus organisasi' });
    }

    await prisma.organization.delete({ where: { id } });

    res.json({ message: 'Organisasi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus organisasi' });
  }
});

// ===================== 👤 Anggota =====================

// ✅ Ambil semua anggota
router.get('/:id/members', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: id },
      orderBy: { createdAt: 'asc' },
      include: { user: true }
    });

    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil anggota organisasi' });
  }
});

// ✅ Keluar dari organisasi
router.delete('/:id/leave', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const org = await prisma.organization.findUnique({ where: { id } });

    if (!org) return res.status(404).json({ error: 'Organisasi tidak ditemukan' });
    if (org.ownerId === req.user.id) {
      return res.status(403).json({ error: 'Owner tidak bisa keluar dari organisasinya sendiri' });
    }

    await prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId: req.user.id,
          organizationId: id
        }
      }
    });

    res.json({ message: 'Berhasil keluar dari organisasi' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal keluar dari organisasi' });
  }
});

// ✅ Kick member (owner only)
router.delete('/:id/kick/:userId', authenticateToken, async (req, res) => {
  const { id, userId } = req.params;

  try {
    const org = await prisma.organization.findUnique({ where: { id } });

    if (!org) return res.status(404).json({ error: 'Organisasi tidak ditemukan' });
    if (org.ownerId !== req.user.id)
      return res.status(403).json({ error: 'Hanya owner yang dapat mengeluarkan anggota' });

    if (parseInt(userId) === req.user.id)
      return res.status(400).json({ error: 'Owner tidak bisa mengeluarkan dirinya sendiri' });

    await prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId: parseInt(userId),
          organizationId: id
        }
      }
    });

    res.json({ message: 'Anggota berhasil dikeluarkan' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengeluarkan anggota' });
  }
});

// ===================== ✉️ Invitation =====================

// ✅ Invite member
router.post('/:id/invite', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    const existing = await prisma.invitation.findFirst({
      where: {
        organizationId: id,
        email,
        status: 'pending',
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'User sudah diundang' });
    }

    await prisma.invitation.create({
      data: {
        organizationId: id,
        email,
        userId: user.id,
        status: 'pending',
      }
    });

    res.status(201).json({ message: 'Undangan berhasil dikirim' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengirim undangan' });
  }
});

// ✅ Ambil undangan pending
router.get('/invitations', authenticateToken, async (req, res) => {
  try {
    const invitations = await prisma.invitation.findMany({
      where: {
        userId: req.user.id,
        status: 'pending',
      },
      include: {
        organization: true,
      }
    });

    res.json({ data: invitations });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil undangan' });
  }
});

// ✅ Terima undangan
router.patch('/:id/accept/:invitationId', authenticateToken, async (req, res) => {
  const { id, invitationId } = req.params;

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId }
    });

    if (
      !invitation ||
      invitation.userId !== req.user.id ||
      invitation.status.toLowerCase() !== 'pending'
    ) {
      return res.status(400).json({ error: 'Undangan tidak valid atau sudah diterima' });
    }

    await prisma.$transaction([
      prisma.organizationMember.create({
        data: {
          organizationId: id,
          userId: req.user.id
        }
      }),
      prisma.invitation.update({
        where: { id: invitationId },
        data: { status: 'accepted' }
      })
    ]);

    res.json({ message: 'Berhasil bergabung ke organisasi' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menerima undangan' });
  }
});

// ===================== 🔍 Cek user by email =====================
router.post('/check-user', authenticateToken, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mencari user' });
  }
});

module.exports = router;
