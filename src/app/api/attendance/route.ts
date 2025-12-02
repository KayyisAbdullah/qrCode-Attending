import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const studentId = searchParams.get('studentId')

    const where: any = {}
    
    if (date) {
      where.date = date
    }
    
    if (studentId) {
      where.studentId = studentId
    }

    const attendances = await db.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            username: true,
            class: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(attendances)

  } catch (error) {
    console.error('Get attendances error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create new attendance record
export async function POST(request: NextRequest) {
  try {
    const { qrCode, studentId, status, notes, adminId } = await request.json()

    if (!qrCode && !studentId) {
      return NextResponse.json(
        { message: 'QR Code atau Student ID harus disediakan' },
        { status: 400 }
      )
    }

    let student = null

    // If QR Code is provided, find student by QR Code
    if (qrCode) {
      student = await db.student.findUnique({
        where: { qrCode },
        select: {
          id: true,
          name: true,
          class: true
        }
      })
    } else if (studentId) {
      student = await db.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          name: true,
          class: true
        }
      })
    }

    if (!student) {
      return NextResponse.json(
        { message: 'Siswa tidak ditemukan' },
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
        { message: 'Siswa sudah melakukan absensi hari ini' },
        { status: 400 }
      )
    }

    // Determine status based on time if not provided
    let attendanceStatus = status || 'HADIR'
    if (!status) {
      const currentTime = new Date()
      const currentHour = currentTime.getHours()
      const currentMinute = currentTime.getMinutes()
      
      // Consider late if after 7:30 AM
      if (currentHour > 7 || (currentHour === 7 && currentMinute > 30)) {
        attendanceStatus = 'TERLAMBAT'
      }
    }

    // Create attendance record
    const attendance = await db.attendance.create({
      data: {
        studentId: student.id,
        adminId,
        date: today,
        time: new Date().toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: attendanceStatus as any,
        notes,
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
      attendance
    })

  } catch (error) {
    console.error('Create attendance error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}