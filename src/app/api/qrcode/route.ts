import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Generate QR Code for student
export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json()

    if (!studentId) {
      return NextResponse.json(
        { message: 'Student ID harus disediakan' },
        { status: 400 }
      )
    }

    // Find student
    const student = await db.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        class: true,
        qrCode: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { message: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // Generate new QR code if doesn't exist
    if (!student.qrCode) {
      const newQrCode = `QR${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      await db.student.update({
        where: { id: studentId },
        data: { qrCode: newQrCode }
      })

      student.qrCode = newQrCode
    }

    // In a real implementation, you would generate an actual QR code image
    // For now, we'll return the QR code data that can be used to generate one
    const qrData = {
      studentId: student.id,
      name: student.name,
      username: student.username,
      class: student.class,
      qrCode: student.qrCode,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'QR Code berhasil digenerate',
      qrData,
      student
    })

  } catch (error) {
    console.error('Generate QR Code error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// Verify QR Code
export async function PUT(request: NextRequest) {
  try {
    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json(
        { message: 'QR Code harus disediakan' },
        { status: 400 }
      )
    }

    // Find student by QR Code
    const student = await db.student.findUnique({
      where: { qrCode },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        class: true,
        qrCode: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { message: 'QR Code tidak valid' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'QR Code valid',
      student
    })

  } catch (error) {
    console.error('Verify QR Code error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}