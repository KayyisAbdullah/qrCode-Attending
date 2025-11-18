'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  QrCode, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  LogOut,
  User,
  Camera,
  History
} from 'lucide-react'

interface Attendance {
  id: string
  date: string
  time: string
  status: 'hadir' | 'izin' | 'sakit' | 'terlambat'
  description?: string
}

interface Student {
  id: string
  name: string
  username: string
  class: string
  email: string
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [scanResult, setScanResult] = useState<string>('')
  const [scanMessage, setScanMessage] = useState('')
  const [scanStatus, setScanStatus] = useState<'success' | 'error' | 'info'>('info')

  useEffect(() => {
    // Simulate fetching student data
    const mockStudent: Student = {
      id: '1',
      name: 'Ahmad Rizki',
      username: 'ahmad123',
      class: 'X-A',
      email: 'ahmad@email.com'
    }

    const mockAttendances: Attendance[] = [
      { id: '1', date: '2024-01-15', time: '07:30', status: 'hadir' },
      { id: '2', date: '2024-01-14', time: '07:45', status: 'terlambat' },
      { id: '3', date: '2024-01-13', time: '07:25', status: 'hadir' },
      { id: '4', date: '2024-01-12', time: '-', status: 'izin', description: 'Sakit' },
      { id: '5', date: '2024-01-11', time: '07:35', status: 'hadir' },
    ]

    setTimeout(() => {
      setStudent(mockStudent)
      setAttendances(mockAttendances)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleScanQRCode = () => {
    setShowScanner(true)
    setScanResult('')
    setScanMessage('Memindai QR Code...')
    setScanStatus('info')

    // Simulate QR Code scanning
    setTimeout(() => {
      const mockQRCode = `QR001-${Date.now()}`
      setScanResult(mockQRCode)
      
      // Simulate validation
      if (mockQRCode.includes('QR001')) {
        setScanMessage('Absensi berhasil! Anda telah tercatat hadir.')
        setScanStatus('success')
        
        // Add new attendance record
        const newAttendance: Attendance = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          status: 'hadir'
        }
        setAttendances([newAttendance, ...attendances])
      } else {
        setScanMessage('QR Code tidak valid. Silakan coba lagi.')
        setScanStatus('error')
      }
    }, 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem('studentToken')
    window.location.href = '/'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hadir':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Hadir</Badge>
      case 'terlambat':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Terlambat</Badge>
      case 'izin':
        return <Badge className="bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3 mr-1" />Izin</Badge>
      case 'sakit':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Sakit</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStats = () => {
    const total = attendances.length
    const hadir = attendances.filter(a => a.status === 'hadir').length
    const terlambat = attendances.filter(a => a.status === 'terlambat').length
    const izin = attendances.filter(a => a.status === 'izin').length
    const sakit = attendances.filter(a => a.status === 'sakit').length

    return { total, hadir, terlambat, izin, sakit }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Siswa</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{student?.name}</span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informasi Siswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama Lengkap</p>
                <p className="font-semibold">{student?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-semibold">{student?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kelas</p>
                <p className="font-semibold">{student?.class}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{student?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Absensi</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hadir</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.hadir}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.terlambat}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Izin</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.izin}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sakit</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.sakit}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="scan" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
            <TabsTrigger value="history">Riwayat Absensi</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="w-5 h-5 mr-2" />
                  Absensi dengan QR Code
                </CardTitle>
                <CardDescription>
                  Scan QR Code yang disediakan untuk melakukan absensi
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="mx-auto w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-400" />
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Klik tombol di bawah untuk memulai pemindaian QR Code
                  </p>
                  
                  <Button 
                    onClick={handleScanQRCode}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Scan QR Code
                  </Button>
                </div>

                {scanResult && (
                  <Alert className={scanStatus === 'success' ? 'border-green-200 bg-green-50' : scanStatus === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
                    <AlertDescription className={scanStatus === 'success' ? 'text-green-800' : scanStatus === 'error' ? 'text-red-800' : 'text-blue-800'}>
                      {scanMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Riwayat Absensi
                </CardTitle>
                <CardDescription>
                  Lihat riwayat kehadiran Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell className="font-medium">{attendance.date}</TableCell>
                        <TableCell>{attendance.time}</TableCell>
                        <TableCell>
                          {getStatusBadge(attendance.status)}
                        </TableCell>
                        <TableCell>
                          {attendance.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scanner QR Code</DialogTitle>
            <DialogDescription>
              Arahkan kamera ke QR Code untuk melakukan absensi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="mx-auto w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
            
            {scanResult && (
              <Alert className={scanStatus === 'success' ? 'border-green-200 bg-green-50' : scanStatus === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
                <AlertDescription className={scanStatus === 'success' ? 'text-green-800' : scanStatus === 'error' ? 'text-red-800' : 'text-blue-800'}>
                  {scanMessage}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowScanner(false)}>
                Tutup
              </Button>
              {scanStatus === 'error' && (
                <Button onClick={handleScanQRCode}>
                  Coba Lagi
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}