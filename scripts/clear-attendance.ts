import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Memulai pembersihan data absensi...')

  // 1. Hapus semua data di tabel Attendance
  const deleted = await prisma.attendance.deleteMany({})
  console.log(`✅ Berhasil menghapus ${deleted.count} data absensi dari database.`)

  // 2. Hapus file bukti upload di public/uploads
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir)
    let fileCount = 0
    for (const file of files) {
      if (file !== '.gitkeep') { // Jangan hapus .gitkeep jika ada
        fs.unlinkSync(path.join(uploadDir, file))
        fileCount++
      }
    }
    console.log(`✅ Berhasil menghapus ${fileCount} file bukti dari folder uploads.`)
  }

  console.log('✨ Reset selesai! Semua data kehadiran kembali ke 0.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
