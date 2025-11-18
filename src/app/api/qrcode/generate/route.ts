import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { db } from '@/lib/db'

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

    // Create QR data
    const qrData = {
      studentId: student.id,
      name: student.name,
      username: student.username,
      class: student.class,
      qrCode: student.qrCode,
      timestamp: new Date().toISOString()
    }

    // Generate QR Code as base64 image
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return NextResponse.json({
      message: 'QR Code berhasil digenerate',
      qrCodeImage,
      qrData,
      student
    })

  } catch (error) {
    console.error('Generate QR Code image error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}