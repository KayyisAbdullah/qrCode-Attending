'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DailyQRCodeCard } from '@/components/DailyQRCodeCard'
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
  Filter,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
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
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'TERLAMBAT' | 'hadir' | 'izin' | 'sakit' | 'terlambat'
  description?: string
  proofFile?: string
  student?: {
    name: string
    class: string
  }
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
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [showAttendanceDetail, setShowAttendanceDetail] = useState(false)
  const [error, setError] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  const [showEditStudentDialog, setShowEditStudentDialog] = useState(false)
  const [editStudentData, setEditStudentData] = useState({
    id: '',
    name: '',
    username: '',
    email: '',
    class: ''
  })

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
    // Only run on client after hydration and if not already loaded
    if (!isHydrated || dataLoaded) return

    // Get admin data from localStorage
    const storedUserData = localStorage.getItem('userData')
    const userRole = localStorage.getItem('userRole')
    
    if (!storedUserData || userRole !== 'admin') {
      console.warn('No admin data found or wrong role, redirecting to login...')
      window.location.href = '/login'
      return
    }

    try {
      const adminData = JSON.parse(storedUserData) as Admin
      setAdmin(adminData)
      console.log('Loaded admin data from localStorage:', adminData.username)
    } catch (err) {
      console.error('Failed to parse admin data:', err)
      setError('Data admin tidak valid. Silakan login kembali.')
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      return
    }

    // Fetch students from API with cache
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students', {
          cache: 'no-store',
          next: { revalidate: 30 }
        })
        if (response.ok) {
          const data = await response.json()
          setStudents(data)
        }
      } catch (err) {
        console.error('Error fetching students:', err)
        setError('Gagal memuat data siswa')
      }
    }

    // Fetch attendance from API with cache
    const fetchAttendances = async () => {
      try {
        const response = await fetch('/api/attendance', {
          cache: 'no-store',
          next: { revalidate: 30 }
        })
        if (response.ok) {
          const data = await response.json()
          // Map API response to match Attendance interface if needed
          const mappedData = data.map((item: any) => ({
            ...item,
            studentName: item.student?.name || 'Unknown'
          }))
          setAttendances(mappedData)
        }
      } catch (err) {
        console.error('Error fetching attendances:', err)
        setError('Gagal memuat data absensi')
      }
    }

    Promise.all([fetchStudents(), fetchAttendances()]).then(() => {
      setIsLoading(false)
      setDataLoaded(true)
    })
  }, [isHydrated, dataLoaded])

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newStudent.name || !newStudent.username || !newStudent.email || !newStudent.class || !newStudent.password) {
      setError('Semua field harus diisi')
      return
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent)
      })

      const data = await response.json()

      if (response.ok) {
        setStudents([...students, data.student])
        setNewStudent({ name: '', username: '', email: '', class: '', password: '' })
        setShowAddStudentDialog(false)
        setError('')
      } else {
        setError(data.message || 'Gagal menambah siswa')
      }
    } catch (err) {
      console.error('Error adding student:', err)
      setError('Terjadi kesalahan saat menambah siswa')
    }
  }

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editStudentData.name || !editStudentData.username || !editStudentData.email || !editStudentData.class) {
      setError('Semua field harus diisi')
      return
    }

    try {
      const response = await fetch(`/api/students/${editStudentData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editStudentData)
      })

      const data = await response.json()

      if (response.ok) {
        setStudents(students.map(s => s.id === editStudentData.id ? { ...s, ...data.student } : s))
        setShowEditStudentDialog(false)
        setError('')
      } else {
        setError(data.message || 'Gagal mengupdate siswa')
      }
    } catch (err) {
      console.error('Error updating student:', err)
      setError('Terjadi kesalahan saat mengupdate siswa')
    }
  }

  const openEditDialog = (student: Student) => {
    setEditStudentData({
      id: student.id,
      name: student.name,
      username: student.username,
      email: student.email,
      class: student.class
    })
    setShowEditStudentDialog(true)
  }

  const handleDownloadReport = () => {
    const csvContent = [
      ['Laporan Absensi Siswa'],
      [`Tanggal Download: ${new Date().toLocaleDateString()}`],
      [''],
      ['Nama Siswa', 'Kelas', 'Tanggal', 'Waktu', 'Status', 'Keterangan'],
      ...filteredAttendances.map(a => [
        a.studentName,
        a.student?.class || '-',
        a.date,
        a.time,
        a.status,
        a.description || '-'
      ])
    ].map(e => e.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `laporan_absensi_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadQR = () => {
    if (!selectedStudent) return
    
    // Create a canvas to draw the QR code (simplified approach using an external library would be better, 
    // but for now we can just download the text or use a placeholder image if we had a real QR generator library)
    // Since we don't have a QR library installed in this context, we'll simulate downloading the QR data as text
    // or if there was an image element, we could download that.
    
    // For this demo, we'll create a simple text file with the QR content
    const element = document.createElement("a");
    const file = new Blob([selectedStudent.qrCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `QR-${selectedStudent.name}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  }

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStudents(students.filter(student => student.id !== id))
        setError('')
      } else {
        const data = await response.json()
        setError(data.message || 'Gagal menghapus siswa')
      }
    } catch (err) {
      console.error('Error deleting student:', err)
      setError('Terjadi kesalahan saat menghapus siswa')
    }
  }

  const handleGenerateQR = (student: Student) => {
    setSelectedStudent(student)
    setShowQRDialog(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('userRole')
    window.location.href = '/'
  }

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.username.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClass = filterClass === 'all' || student.class === filterClass
      return matchesSearch && matchesClass
    })
  }, [students, searchTerm, filterClass])

  const filteredAttendances = useMemo(() => {
    return attendances.filter(attendance => {
      const matchesDate = !filterDate || attendance.date === filterDate
      return matchesDate
    })
  }, [attendances, filterDate])

  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], [])
  
  const stats = useMemo(() => {
    const today = attendances.filter(a => a.date === todayDate)
    return {
      totalStudents: students.length,
      presentToday: today.filter(a => a.status?.toUpperCase() === 'HADIR').length,
      lateToday: today.filter(a => a.status?.toUpperCase() === 'TERLAMBAT').length,
      izinToday: today.filter(a => a.status?.toUpperCase() === 'IZIN').length,
      sakitToday: today.filter(a => a.status?.toUpperCase() === 'SAKIT').length
    }
  }, [students.length, attendances, todayDate])

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
          {/* Total Siswa - 2 columns wide - DI ATAS */}
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm hover:shadow-md transition-all lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Siswa</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
              <p className="text-xs text-blue-600 mt-1">Siswa terdaftar</p>
            </CardContent>
          </Card>

          {/* Spacer untuk alignment - hanya di lg */}
          <div className="hidden lg:block lg:col-span-2"></div>
          
          {/* Hadir */}
          <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Hadir Hari Ini</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.presentToday}</div>
              <p className="text-xs text-green-600 mt-1">
                {stats.totalStudents > 0 ? Math.round((stats.presentToday / stats.totalStudents) * 100) : 0}% kehadiran
              </p>
            </CardContent>
          </Card>
          
          {/* Terlambat */}
          <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-100 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Terlambat</CardTitle>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.lateToday}</div>
              <p className="text-xs text-yellow-600 mt-1">Siswa terlambat hari ini</p>
            </CardContent>
          </Card>
          
          {/* Sakit */}
          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Sakit</CardTitle>
              <div className="p-2 bg-purple-100 rounded-full">
                <AlertCircle className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.sakitToday}</div>
              <p className="text-xs text-purple-600 mt-1">Ketidakhadiran hari ini</p>
            </CardContent>
          </Card>
          
          {/* Izin */}
          <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Izin</CardTitle>
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.izinToday}</div>
              <p className="text-xs text-orange-600 mt-1">Tidak hadir dengan izin</p>
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

                  <Dialog open={showEditStudentDialog} onOpenChange={setShowEditStudentDialog}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Data Siswa</DialogTitle>
                        <DialogDescription>
                          Perbarui informasi siswa
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleEditStudent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Lengkap</Label>
                            <Input
                              id="edit-name"
                              value={editStudentData.name}
                              onChange={(e) => setEditStudentData({...editStudentData, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-username">Username</Label>
                            <Input
                              id="edit-username"
                              value={editStudentData.username}
                              onChange={(e) => setEditStudentData({...editStudentData, username: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                              id="edit-email"
                              type="email"
                              value={editStudentData.email}
                              onChange={(e) => setEditStudentData({...editStudentData, email: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-class">Kelas</Label>
                            <Input
                              id="edit-class"
                              value={editStudentData.class}
                              onChange={(e) => setEditStudentData({...editStudentData, class: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">
                          Simpan Perubahan
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
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(student)}
                            >
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
                  <Button variant="outline" onClick={handleDownloadReport}>
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
                      <TableHead>Aksi</TableHead>
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
                            variant={attendance.status === 'hadir' ? 'default' : attendance.status === 'terlambat' ? 'secondary' : 'destructive'}
                            className={
                              attendance.status === 'hadir' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              attendance.status === 'terlambat' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                              attendance.status === 'izin' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                              'bg-red-100 text-red-800 hover:bg-red-200'
                            }
                          >
                            {attendance.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedAttendance(attendance)
                              setShowAttendanceDetail(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <DailyQRCodeCard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Attendance Detail Dialog */}
      <Dialog open={showAttendanceDetail} onOpenChange={setShowAttendanceDetail}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detail Absensi</DialogTitle>
            <DialogDescription>
              Informasi lengkap absensi siswa
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttendance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Nama Siswa</Label>
                  <p className="font-medium">{selectedAttendance.studentName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Kelas</Label>
                  <p className="font-medium">{selectedAttendance.student?.class || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Tanggal & Waktu</Label>
                  <p className="font-medium">{selectedAttendance.date} - {selectedAttendance.time}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Badge 
                    className={
                      selectedAttendance.status === 'hadir' ? 'bg-green-100 text-green-800' :
                      selectedAttendance.status === 'terlambat' ? 'bg-yellow-100 text-yellow-800' :
                      selectedAttendance.status === 'izin' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {selectedAttendance.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Keterangan</Label>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {selectedAttendance.description || 'Tidak ada keterangan'}
                </div>
              </div>

              {selectedAttendance.proofFile && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Bukti Pendukung</Label>
                  <div className="border rounded-md p-2">
                    {selectedAttendance.proofFile.endsWith('.pdf') ? (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <FileText className="w-8 h-8 text-red-500 mr-2" />
                          <span className="text-sm font-medium">Dokumen PDF</span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedAttendance.proofFile} target="_blank" rel="noopener noreferrer">
                            Buka PDF
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={selectedAttendance.proofFile} 
                          alt="Bukti Absensi" 
                          className="object-contain w-full h-full"
                        />
                        <div className="absolute bottom-2 right-2">
                          <Button variant="secondary" size="sm" asChild>
                            <a href={selectedAttendance.proofFile} target="_blank" rel="noopener noreferrer">
                              Lihat Full
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <Button className="w-full" onClick={handleDownloadQR}>
              <Download className="w-4 h-4 mr-2" />
              Unduh QR Code (Text)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}