import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { qrData, studentId } = await request.json()

    if (!qrData || !studentId) {
      return NextResponse.json(
        { message: 'Data QR Code dan Student ID harus disediakan' },
        { status: 400 }
      )
    }

    // Parse QR data
    let qrPayload
    try {
      qrPayload = JSON.parse(qrData)
    } catch (error) {
      return NextResponse.json(
        { message: 'QR Code tidak valid' },
        { status: 400 }
      )
    }

    // Validate QR code type
    if (qrPayload.type !== 'DAILY_ATTENDANCE') {
      return NextResponse.json(
        { message: 'QR Code bukan untuk absensi harian' },
        { status: 400 }
      )
    }

    // Check if QR code is for today
    const today = new Date().toISOString().split('T')[0]
    if (qrPayload.date !== today) {
      return NextResponse.json(
        { message: 'QR Code sudah kadaluarsa. Gunakan QR Code hari ini.' },
        { status: 400 }
      )
    }

    // Check if student exists
    const student = await db.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        class: true,
        email: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { message: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if student already has attendance today
    const existingAttendance = await db.attendance.findFirst({
      where: {
        studentId: studentId,
        date: today
      }
    })

    if (existingAttendance) {
      return NextResponse.json(
        { 
          message: 'Anda sudah melakukan absensi hari ini',
          attendance: existingAttendance
        },
        { status: 400 }
      )
    }

    // Determine attendance status based on time
    const now = new Date()
    const currentTime = now.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // Set status based on time
    // Sebelum jam 7:00 -> HADIR
    // Jam 7:00 - 7:59 -> HADIR  
    // Jam 8:00 ke atas -> TERLAMBAT
    let status = 'HADIR'
    if (currentHour >= 8 || (currentHour === 7 && currentMinute >= 60)) {
      status = 'TERLAMBAT'
    }

    // Create attendance record
    const attendance = await db.attendance.create({
      data: {
        studentId: studentId,
        date: today,
        time: currentTime,
        status: status as any,
        notes: `Absensi via QR Code harian`,
        qrCode: qrPayload.token
      },
      include: {
        student: {
          select: {
            name: true,
            class: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Absensi berhasil dicatat',
      attendance,
      status: status
    })

  } catch (error) {
    console.error('Verify daily QR Code error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
