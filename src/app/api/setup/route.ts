import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('[SETUP] Starting database setup...')

    // Check if admin already exists
    let existingAdmin
    try {
      existingAdmin = await db.admin.findUnique({
        where: { username: 'admin' }
      })
    } catch (error) {
      console.log('[SETUP] Database not initialized, will create tables')
    }

    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Database already setup. Admin exists.',
        success: true,
        admin: { username: existingAdmin.username, name: existingAdmin.name }
      })
    }

    // Create default admin
    console.log('[SETUP] Creating default admin...')
    const hashedAdminPassword = await bcrypt.hash('admin123', 10)
    const admin = await db.admin.create({
      data: {
        username: 'admin',
        password: hashedAdminPassword,
        email: 'admin@qrcode-attending.com',
        name: 'Administrator'
      }
    })
    console.log('[SETUP] Admin created:', admin.username)

    // Create sample students
    console.log('[SETUP] Creating sample students...')
    const studentPassword = await bcrypt.hash('password123', 10)
    
    const students = await Promise.all([
      db.student.create({
        data: {
          username: 'muhammad',
          password: studentPassword,
          email: 'muhammad@student.com',
          name: 'Muhammad Ali',
          class: '12 IPA 1',
          qrCode: 'QR-MUHAMMAD-001'
        }
      }),
      db.student.create({
        data: {
          username: 'fatimah',
          password: studentPassword,
          email: 'fatimah@student.com',
          name: 'Fatimah Zahra',
          class: '12 IPA 2',
          qrCode: 'QR-FATIMAH-002'
        }
      }),
      db.student.create({
        data: {
          username: 'ahmad',
          password: studentPassword,
          email: 'ahmad@student.com',
          name: 'Ahmad Hassan',
          class: '11 IPS 1',
          qrCode: 'QR-AHMAD-003'
        }
      })
    ])

    console.log('[SETUP] Students created:', students.length)

    return NextResponse.json({ 
      message: 'Database setup successful!',
      success: true,
      data: {
        admin: {
          username: 'admin',
          password: 'admin123'
        },
        students: students.map(s => ({
          username: s.username,
          name: s.name,
          class: s.class,
          password: 'password123'
        }))
      }
    })

  } catch (error: any) {
    console.error('[SETUP] Setup error:', error)
    return NextResponse.json({ 
      message: 'Setup failed',
      error: error.message || String(error),
      success: false 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to setup database',
    instructions: 'Send POST request to /api/setup to initialize database with default data'
  })
}
