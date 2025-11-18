'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  QrCode, 
  Calendar, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  LogOut,
  UserPlus,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  name: string
  username: string
  email: string
  class: string
  qrCode: string
}

interface Attendance {
  id: string
  studentId: string
  studentName: string
  date: string
  time: string
  status: 'hadir' | 'izin' | 'sakit'
}

interface Admin {
  id: string
  name: string
  username: string
  email: string
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [error, setError] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)

  // Form states for adding student
  const [newStudent, setNewStudent] = useState({
    name: '',
    username: '',
    email: '',
    class: '',
    password: ''
  })

  useEffect(() => {
    // Mark component as hydrated on client
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Only run on client after hydration
    if (!isHydrated) return

    // Get admin data from localStorage
    const storedAdminData = localStorage.getItem('adminData')
    
    if (!storedAdminData) {
      console.warn('No admin data found, redirecting to login...')
      window.location.href = '/login/admin'
      return
    }

    try {
      const adminData = JSON.parse(storedAdminData) as Admin
      setAdmin(adminData)
      console.log('Loaded admin data from localStorage:', adminData.username)
    } catch (err) {
      console.error('Failed to parse admin data:', err)
      setError('Data admin tidak valid. Silakan login kembali.')
      setTimeout(() => {
        window.location.href = '/login/admin'
      }, 2000)
      return
    }

    // Simulate fetching student and attendance data
    const mockStudents: Student[] = [
      { id: '1', name: 'Ahmad Rizki', username: 'ahmad123', email: 'ahmad@email.com', class: 'X-A', qrCode: 'QR001' },
      { id: '2', name: 'Siti Nurhaliza', username: 'siti123', email: 'siti@email.com', class: 'X-B', qrCode: 'QR002' },
      { id: '3', name: 'Budi Santoso', username: 'budi123', email: 'budi@email.com', class: 'XI-A', qrCode: 'QR003' },
    ]

    const mockAttendances: Attendance[] = [
      { id: '1', studentId: '1', studentName: 'Ahmad Rizki', date: '2024-01-15', time: '07:30', status: 'hadir' },
      { id: '2', studentId: '2', studentName: 'Siti Nurhaliza', date: '2024-01-15', time: '07:45', status: 'hadir' },
      { id: '3', studentId: '3', studentName: 'Budi Santoso', date: '2024-01-15', time: '08:00', status: 'terlambat' },
    ]

    setTimeout(() => {
      setStudents(mockStudents)
      setAttendances(mockAttendances)
      setIsLoading(false)
    }, 500)
  }, [])

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate API call
    const student: Student = {
      id: Date.now().toString(),
      name: newStudent.name,
      username: newStudent.username,
      email: newStudent.email,
      class: newStudent.class,
      qrCode: `QR${Date.now()}`
    }
    setStudents([...students, student])
    setNewStudent({ name: '', username: '', email: '', class: '', password: '' })
    setShowAddStudentDialog(false)
  }

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(student => student.id !== id))
  }

  const handleGenerateQR = (student: Student) => {
    setSelectedStudent(student)
    setShowQRDialog(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    window.location.href = '/'
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = filterClass === 'all' || student.class === filterClass
    return matchesSearch && matchesClass
  })

  const filteredAttendances = attendances.filter(attendance => {
    const matchesDate = !filterDate || attendance.date === filterDate
    return matchesDate
  })

  const stats = {
    totalStudents: students.length,
    todayAttendance: attendances.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
    presentToday: attendances.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'hadir').length,
    classes: [...new Set(students.map(s => s.class))].length
  }

  // Prevent hydration mismatch by showing nothing during SSR
  if (!isHydrated) {
    return <div className="min-h-screen bg-gray-50" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.presentToday}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Absensi Hari Ini</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAttendance}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.classes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="students">Data Siswa</TabsTrigger>
            <TabsTrigger value="attendance">Data Absensi</TabsTrigger>
            <TabsTrigger value="qr">Generate QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Data Siswa</CardTitle>
                    <CardDescription>Kelola data siswa yang terdaftar</CardDescription>
                  </div>
                  <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Siswa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Siswa Baru</DialogTitle>
                        <DialogDescription>
                          Masukkan data siswa baru untuk ditambahkan ke sistem
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddStudent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                              id="name"
                              value={newStudent.name}
                              onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={newStudent.username}
                              onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newStudent.email}
                              onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="class">Kelas</Label>
                            <Input
                              id="class"
                              value={newStudent.class}
                              onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Tambah Siswa
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari siswa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kelas</SelectItem>
                      <SelectItem value="X-A">X-A</SelectItem>
                      <SelectItem value="X-B">X-B</SelectItem>
                      <SelectItem value="XI-A">XI-A</SelectItem>
                      <SelectItem value="XI-B">XI-B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.qrCode}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateQR(student)}
                            >
                              <QrCode className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Data Absensi</CardTitle>
                    <CardDescription>Lihat dan kelola data absensi siswa</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Unduh Laporan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-[200px]"
                  />
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendances.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell className="font-medium">{attendance.studentName}</TableCell>
                        <TableCell>{attendance.date}</TableCell>
                        <TableCell>{attendance.time}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={attendance.status === 'hadir' ? 'default' : 'destructive'}
                          >
                            {attendance.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate QR Code</CardTitle>
                <CardDescription>Generate QR Code untuk absensi siswa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((student) => (
                    <Card key={student.id} className="p-4">
                      <div className="text-center space-y-2">
                        <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                          <QrCode className="w-16 h-16 text-gray-400" />
                        </div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.class}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateQR(student)}
                        >
                          Generate QR
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code untuk {selectedStudent?.name}</DialogTitle>
            <DialogDescription>
              QR Code ini dapat digunakan untuk absensi siswa
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
              <QrCode className="w-24 h-24 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold">{selectedStudent?.name}</p>
              <p className="text-sm text-gray-600">{selectedStudent?.class}</p>
              <Badge variant="secondary">{selectedStudent?.qrCode}</Badge>
            </div>
            <Button className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Unduh QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}