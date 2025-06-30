const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
  // Mendukung header Authorization yang case-insensitive
  const authHeader = req.headers.authorization || req.headers.Authorization

  // Cek apakah token tersedia
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan. Akses ditolak.' })
  }

  // Verifikasi token JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token tidak valid atau kadaluarsa.' });
    }

    console.log('✅ Decoded user in middleware:', user); // Tambahkan baris ini
    req.user = user; // user = { id, email, role }
    next();
  });

}

module.exports = authenticateToken