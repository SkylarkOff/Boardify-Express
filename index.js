require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { PrismaClient } = require('@prisma/client')

// Inisialisasi
const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Routes
const authRoutes = require('./routes/auth')
const mahasiswaRoutes = require('./routes/mahasiswa')
const dosenRoutes = require('./routes/dosen')
const organizationRoutes = require('./routes/organization')
const boardRoutes = require('./routes/board')
const cardRoutes = require('./routes/card')
const fileRoutes = require('./routes/file')
const notificationRoutes = require('./routes/notification')
const revisionRoutes = require('./routes/revision')
const auditLogRoutes = require('./routes/auditlog')

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/mahasiswa', mahasiswaRoutes)
app.use('/api/dosen', dosenRoutes)
app.use('/api/organization', organizationRoutes)
app.use('/api/board', boardRoutes)
app.use('/api/card', cardRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/notification', notificationRoutes)
app.use('/api/revision', revisionRoutes)
app.use('/api/auditlog', auditLogRoutes)

// Root Endpoint
app.get('/', (req, res) => {
  res.send('AMAN LAH AMAN 👍')
})

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Terjadi error:', err.stack)
  res.status(500).json({
    message: 'Terjadi kesalahan di server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// Jalankan server
app.listen(3000, '0.0.0.0', () => {
  console.log("Running on 0.0.0.0:3000");
});