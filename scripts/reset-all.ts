import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import util from 'util'

// Set default DATABASE_URL if not present (for local development)
if (!process.env.DATABASE_URL) {
  // Check if we're using PostgreSQL or SQLite based on schema
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
  
  if (schemaContent.includes('provider = "postgresql"')) {
    console.log('⚠️  DATABASE_URL not set. PostgreSQL schema detected.')
    console.log('⚠️  Please set DATABASE_URL environment variable for PostgreSQL.')
    console.log('⚠️  Example: DATABASE_URL="postgresql://user:pass@localhost:5432/db"')
    process.exit(1)
  } else {
    process.env.DATABASE_URL = "file:./dev.db"
    console.log('⚠️  DATABASE_URL not set, using SQLite default:', process.env.DATABASE_URL)
  }
}

const execPromise = util.promisify(exec)
const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Memulai reset total database...')

  try {
    // 1. Hapus semua data (urutan penting karena foreign keys)
    console.log('1️⃣  Menghapus data Absensi...')
    await prisma.attendance.deleteMany({})
    
    console.log('2️⃣  Menghapus data Siswa...')
    await prisma.student.deleteMany({})
    
    console.log('3️⃣  Menghapus data Admin...')
    await prisma.admin.deleteMany({})

    // 2. Hapus file bukti upload
    console.log('4️⃣  Membersihkan file upload...')
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir)
      for (const file of files) {
        if (file !== '.gitkeep') {
          fs.unlinkSync(path.join(uploadDir, file))
        }
      }
    }

    // 3. Jalankan Seeding
    console.log('5️⃣  Menjalankan seeding data awal (Admin & Siswa default)...')
    // Gunakan npm run db:seed agar sesuai dengan konfigurasi package.json
    const { stdout, stderr } = await execPromise('npm run db:seed')
    console.log(stdout)
    if (stderr) console.error(stderr)
    
    console.log('\n✨ Reset Selesai!')
    console.log('----------------------------------------')
    console.log('🔑 Akun Admin Default:')
    console.log('   Username: admin')
    console.log('   Password: admin123')
    console.log('\n🎓 Akun Siswa Contoh:')
    console.log('   Username: muhammad')
    console.log('   Password: password123')
    console.log('----------------------------------------')

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat reset:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
