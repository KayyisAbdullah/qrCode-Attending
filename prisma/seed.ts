import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create default admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      email: 'admin@sekolah.sch.id',
      name: 'Administrator'
    }
  })

  console.log('Created admin:', admin)

  // Create sample students
  const students = [
    {
      username: 'muhammad',
      password: 'password123',
      email: 'muhammad@email.com',
      name: 'Muhammad',
      class: 'X-A'
    },
    {
      username: 'ahmad123',
      password: 'ahmad123',
      email: 'ahmad@email.com',
      name: 'Ahmad Rizki',
      class: 'X-A'
    },
    {
      username: 'siti123',
      password: 'siti123',
      email: 'siti@email.com',
      name: 'Siti Nurhaliza',
      class: 'X-B'
    },
    {
      username: 'budi123',
      password: 'budi123',
      email: 'budi@email.com',
      name: 'Budi Santoso',
      class: 'XI-A'
    },
    {
      username: 'diana123',
      password: 'diana123',
      email: 'diana@email.com',
      name: 'Diana Putri',
      class: 'XI-B'
    },
    {
      username: 'eko123',
      password: 'eko123',
      email: 'eko@email.com',
      name: 'Eko Prasetyo',
      class: 'XII-A'
    }
  ]

  for (const studentData of students) {
    const hashedPassword = await bcrypt.hash(studentData.password, 10)
    const qrCode = `QR${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const student = await prisma.student.upsert({
      where: { username: studentData.username },
      update: {},
      create: {
        ...studentData,
        password: hashedPassword,
        qrCode
      }
    })

    console.log('Created student:', student.name)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })