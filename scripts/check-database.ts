import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  try {
    // Get today's date in WIB
    const now = new Date()
    const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
    const todayString = wibTime.toISOString().split('T')[0]
    
    console.log('=== DATABASE CHECK ===')
    console.log('Today WIB:', todayString)
    console.log('Current WIB Time:', wibTime.toLocaleTimeString('id-ID'))
    
    // Check students
    const students = await prisma.student.count()
    console.log('\nTotal Students:', students)
    
    // Check today's attendance
    const todayAttendances = await prisma.attendance.findMany({
      where: { date: todayString },
      include: { student: { select: { name: true } } }
    })
    
    console.log('\nToday Attendances:', todayAttendances.length)
    todayAttendances.forEach(att => {
      console.log(`- ${att.student.name}: ${att.status} at ${att.time}`)
    })
    
    // Check all attendances
    const allAttendances = await prisma.attendance.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { student: { select: { name: true } } }
    })
    
    console.log('\nRecent 10 Attendances:')
    allAttendances.forEach(att => {
      console.log(`- ${att.date} ${att.time}: ${att.student.name} - ${att.status}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
