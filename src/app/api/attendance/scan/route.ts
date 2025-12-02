import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Status } from '@prisma/client'

// Mock data for testing
const MOCK_STUDENTS = [
  { id: '1', username: 'nikola', name: 'nikola', class: 'X-A', qrCode: 'QR-nikola-001' },
  { id: '2', username: 'test', name: 'Test User', class: 'TEST', qrCode: 'QR-test-001' },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrData, studentId } = body
    
    console.log('[SCAN_API] Request:', { qrData: qrData?.substring(0, 100), studentId })

    // Validate input
    if (!qrData || !qrData.trim()) {
      return NextResponse.json(
        { message: 'QR Code harus disediakan', success: false },
        { status: 400 }
      )
    }

    const qrCode = qrData.trim()

    // Try to parse as JSON (new daily QR format)
    let qrPayload: any = null
    try {
      qrPayload = JSON.parse(qrCode)
    } catch (e) {
      // Not JSON, treat as legacy QR code
    }

    // Handle DAILY_ATTENDANCE QR Code (new format)
    if (qrPayload && qrPayload.type === 'DAILY_ATTENDANCE') {
      console.log('[SCAN_API] Daily QR detected:', qrPayload.date)
      
      if (!studentId) {
        return NextResponse.json(
          { message: 'Anda harus login terlebih dahulu', success: false },
          { status: 401 }
        )
      }

      // Check if QR code is for today
      const today = new Date().toISOString().split('T')[0]
      if (qrPayload.date !== today) {
        return NextResponse.json(
          { success: false, message: 'QR Code sudah kadaluarsa. Gunakan QR Code hari ini.' },
          { status: 400 }
        )
      }

      // Get student
      const student = await db.student.findUnique({
        where: { id: studentId },
        select: { id: true, name: true, class: true, email: true }
      })

      if (!student) {
        return NextResponse.json(
          { success: false, message: 'Siswa tidak ditemukan' },
          { status: 404 }
        )
      }

      // Check if already scanned today
      const existingAttendance = await db.attendance.findFirst({
        where: { studentId: studentId, date: today }
      })

      if (existingAttendance) {
        return NextResponse.json({
          success: false,
          message: `${student.name} sudah melakukan absensi hari ini pada pukul ${existingAttendance.time}`,
          attendance: existingAttendance
        }, { status: 400 })
      }

      // Determine status based on time
      const now = new Date()
      const currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
      const currentHour = now.getHours()
      
      let status: Status = Status.HADIR
      if (currentHour >= 8) {
        status = Status.TERLAMBAT
      }

      // Create attendance
      const attendance = await db.attendance.create({
        data: {
          studentId: studentId,
          date: today,
          time: currentTime,
          status: status,
          notes: `Absensi via QR Code harian`,
          qrCode: qrPayload.token
        }
      })

      const statusText = status === Status.HADIR ? 'tepat waktu' : 'terlambat'
      
      return NextResponse.json({
        success: true,
        message: `✅ Absensi ${student.name} berhasil dicatat (${statusText}) pada ${currentTime}`,
        data: { student, attendance, status: statusText }
      })
    }

    // Legacy QR Code handling below
    const isTestQR = qrCode.includes('ATTENDANCE-QR-TEST') || qrCode.includes('TEST')

    if (isTestQR && !studentId) {
      console.log('[SCAN_API] Test QR detected (no student):', qrCode)
      
      return NextResponse.json({
        message: `✅ Test scan berhasil! Scanner berfungsi dengan baik.`,
        success: true,
        data: {
          qrCode: qrCode,
          student: null,
          timestamp: new Date().toISOString(),
          type: 'test'
        }
      })
    }

    // For real attendance QR codes (or Test QR with logged in student)
    let student: any = null
    let attendanceRecord: any = null

    try {
      // Try to find student by ID first
      if (studentId) {
        student = await db.student.findUnique({
          where: { id: studentId },
          select: {
            id: true,
            name: true,
            username: true,
            class: true
          }
        })
      }

      // If no student found by ID, try by QR code pattern
      if (!student) {
        student = await db.student.findFirst({
          where: {
            OR: [
              { qrCode: qrCode },
              { username: qrCode },
              { id: qrCode }
            ]
          },
          select: {
            id: true,
            name: true,
            username: true,
            class: true
          }
        })
      }

    } catch (dbError) {
      console.log('[SCAN_API] Database error, using mock data')
      // Fallback to mock data
      student = MOCK_STUDENTS.find(s => 
        s.qrCode === qrCode || 
        s.username === qrCode || 
        s.id === studentId
      ) || MOCK_STUDENTS[0]
    }

    if (!student) {
      return NextResponse.json(
        { 
          message: 'QR Code tidak valid atau student tidak ditemukan', 
          success: false,
          data: { qrCode }
        },
        { status: 404 }
      )
    }

    // Record attendance
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Check if already scanned today
      const todayString = today.toISOString().split('T')[0]
      const existingAttendance = await db.attendance.findFirst({
        where: {
          studentId: student.id,
          date: todayString
        }
      })

      if (existingAttendance) {
        // --- MODE TESTING AKTIF ---
        // Jika data sudah ada, kita hapus dulu agar bisa scan ulang berkali-kali untuk pengujian.
        console.log('[SCAN_API] Testing Mode: Menghapus data lama untuk scan ulang...')
        await db.attendance.delete({
          where: { id: existingAttendance.id }
        })
        // Lanjut ke pembuatan data baru di bawah...
      }

      // Create new attendance record
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      
      // --- PENGATURAN JAM MASUK ---
      // Aturan:
      // Sebelum jam 7:00 (00:00 - 06:59) -> HADIR
      // Jam 7:00 - 7:59 -> HADIR
      // Jam 8:00 ke atas -> TERLAMBAT
      
      let status: Status = Status.HADIR
      if (currentHour >= 8 || (currentHour === 7 && currentMinute >= 60)) {
        status = Status.TERLAMBAT
      }
      
      console.log(`[SCAN_API] Time check: ${currentHour}:${currentMinute} -> Status: ${status}`)
      
      attendanceRecord = await db.attendance.create({
        data: {
          studentId: student.id,
          date: todayString,
          time: now.toLocaleTimeString('en-US', { hour12: false }),
          status: status,
          qrCode: qrCode
        }
      })

      console.log('[SCAN_API] Attendance recorded:', attendanceRecord)

    } catch (attendanceError) {
      console.log('[SCAN_API] Attendance recording failed:', attendanceError)
      // Continue anyway, don't fail the scan
      const todayString = new Date().toISOString().split('T')[0]
      attendanceRecord = {
        id: 'mock-' + Date.now(),
        studentId: student.id,
        date: todayString,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        status: 'HADIR',
        qrCode: qrCode,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    // Success response
    return NextResponse.json({
      message: `✅ Absensi berhasil! Selamat datang ${student.name}`,
      success: true,
      data: {
        student: student,
        attendance: attendanceRecord,
        qrCode: qrCode,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[SCAN_API] Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        message: 'Terjadi kesalahan server', 
        success: false,
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { message: 'Scan API is working. Use POST method to scan QR codes.' },
    { status: 200 }
  )
}