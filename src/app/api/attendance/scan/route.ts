import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json(
        { message: 'QR Code harus disediakan', success: false },
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
        class: true,
        qrCode: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { message: 'QR Code tidak valid atau siswa tidak ditemukan', success: false },
        { status: 404 }
      )
    }

    // Check if student already has attendance for today
    const today = new Date().toISOString().split('T')[0]
    const existingAttendance = await db.attendance.findFirst({
      where: {
        studentId: student.id,
        date: today
      }
    })

    if (existingAttendance) {
      return NextResponse.json(
        { 
          message: 'Siswa sudah melakukan absensi hari ini',
          success: false,
          alreadyMarked: true,
          attendance: existingAttendance
        },
        { status: 400 }
      )
    }

    // Determine status based on current time
    const currentTime = new Date()
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    
    let status = 'HADIR'
    if (currentHour > 7 || (currentHour === 7 && currentMinute > 30)) {
      status = 'TERLAMBAT'
    }

    // Create attendance record
    const attendance = await db.attendance.create({
      data: {
        studentId: student.id,
        date: today,
        time: currentTime.toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: status as any,
        qrCode
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            username: true,
            class: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Absensi berhasil dicatat',
      success: true,
      attendance,
      student
    })

  } catch (error) {
    console.error('Scan attendance error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server', success: false },
      { status: 500 }
    )
  }
}