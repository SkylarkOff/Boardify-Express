# 🛠️ Boardify Mobile - Backend API

**Boardify Mobile - Backend** adalah REST API yang dibangun menggunakan **Node.js (Express)** dan **Prisma ORM**, dirancang untuk mendukung aplikasi **Boardify Mobile** — sebuah platform bimbingan skripsi yang mempermudah kolaborasi antara mahasiswa dan dosen melalui sistem task dan revisi yang terstruktur.

> Backend ini khusus dikembangkan untuk versi mobile dari platform **Boardify**  
> 👉 Boardify Mobile: [https://github.com/SkylarkOff/Boardify](https://github.com/SkylarkOff/Boardify)

---

## 👨‍💻 Tim Pengembang

| Peran             | Nama                   |
|-------------------|------------------------|
| Backend Developer |**Rifa Amril Sahputra** |

---

## 🧰 Teknologi

- **Node.js** + **Express**
- **Prisma ORM**
- **MySQL** (Database)
- **JWT** untuk autentikasi
- **dotenv** untuk environment configuration
- **CORS** & **Helmet** untuk keamanan
- **Clerk (opsional)** jika ingin integrasi login dari sistem web


---

## 🚀 Fitur Utama

- 🔐 Autentikasi login/register untuk dosen & mahasiswa (JWT)
- 📋 CRUD API untuk:
  - **Board Skripsi**
  - **Card / Tugas / Revisi**
  - **Mahasiswa & Dosen**
- 📅 Deadline & progres tracking
- 🧠 Integrasi task prioritization (opsional)
- 🚀 Role-based API untuk membedakan hak akses

