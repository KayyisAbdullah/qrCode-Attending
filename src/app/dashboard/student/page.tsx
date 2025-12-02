'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  QrCode, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  LogOut,
  User,
  History,
  RefreshCw,
  TrendingUp,
  FileText,
  Stethoscope,
  Download,
  Upload,
  Send
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { toast } from 'sonner'

interface Attendance {
  id: string
  date: string
  time: string
  status: 'hadir' | 'izin' | 'sakit' | 'terlambat'
  description?: string
  createdAt?: string
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
  // QR scanner akan dilakukan di halaman terpisah
  const [error, setError] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [requestType, setRequestType] = useState<'IZIN' | 'SAKIT'>('IZIN')
  const [requestNotes, setRequestNotes] = useState('')
  const [requestFile, setRequestFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  useEffect(() => {
    // Mark component as hydrated on client
    setIsHydrated(true)
    console.log('Student Dashboard v8.0 - New UI Loaded')
    
    // Force clear any old cached data
    if (typeof window !== 'undefined') {
      // Clear any old scan results or dialogs
      localStorage.removeItem('scanResult')
      localStorage.removeItem('showSuccessDialog')
      
      // Clear service worker cache
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('absensi-qr-v1')) {
              caches.delete(name)
              console.log('🗑️ Cleared old cache:', name)
            }
          })
        })
      }
    }
  }, [])

  useEffect(() => {
    // Only run on client after hydration and if not already loaded
    if (!isHydrated || dataLoaded) return
    
    // Get student data from localStorage (set during login)
    const storedUserData = localStorage.getItem('userData')
    const userRole = localStorage.getItem('userRole')
    
    if (!storedUserData || userRole !== 'student') {
      // No student data found or wrong role, redirect to login
      console.warn('No student data found or wrong role, redirecting to login...')
      window.location.href = '/login'
      return
    }

    try {
      const studentData = JSON.parse(storedUserData) as Student
      setStudent(studentData)
      console.log('Loaded student data from localStorage:', studentData.username)
      
      // Fetch attendance data immediately
      fetchAttendance(studentData.id)
    } catch (err) {
      console.error('Failed to parse student data:', err)
      setError('Data siswa tidak valid. Silakan login kembali.')
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      return
    }
  }, [isHydrated, dataLoaded])

  const fetchAttendance = async (studentId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/attendance?studentId=${studentId}`)
      if (response.ok) {
        const data = await response.json()
        // Normalize status to lowercase untuk consistency dengan visualisasi
        const normalizedData = data.map((att: any) => ({
          ...att,
          status: att.status.toLowerCase()
        }))
        setAttendances(normalizedData)
        console.log('[STUDENT] Loaded attendances:', normalizedData.length)
      } else {
        console.error('Failed to fetch attendance')
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setIsLoading(false)
      setDataLoaded(true)
    }
  }

  // Auto-refresh when window gets focus
  useEffect(() => {
    const onFocus = () => {
      if (student) {
        fetchAttendance(student.id)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [student])

  const handleScanQRCode = () => {
    // Store student data in localStorage for scanner page
    if (student) {
      localStorage.setItem('studentData', JSON.stringify(student))
    }
    // Redirect to actual QR scanner page
    window.location.href = '/scan-qr'
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('userRole')
    window.location.href = '/'
  }

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
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
    const hadir = attendances.filter(a => a.status.toLowerCase() === 'hadir').length
    const terlambat = attendances.filter(a => a.status.toLowerCase() === 'terlambat').length
    const izin = attendances.filter(a => a.status.toLowerCase() === 'izin').length
    const sakit = attendances.filter(a => a.status.toLowerCase() === 'sakit').length

    return { total, hadir, terlambat, izin, sakit }
  }

  const stats = getStats()

  const handleRequestSubmit = async () => {
    if (!student) return
    if (!requestNotes.trim()) {
      toast.error('Mohon isi keterangan')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('studentId', student.id)
      formData.append('status', requestType)
      formData.append('notes', requestNotes)
      if (requestFile) {
        formData.append('file', requestFile)
      }

      const response = await fetch('/api/attendance/request', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setIsRequestOpen(false)
        setRequestNotes('')
        setRequestFile(null)
        setRequestType('IZIN')
        // Refresh attendance data
        await fetchAttendance(student.id)
        toast.success('✅ Pengajuan ' + requestType + ' berhasil dikirim!')
      } else {
        toast.error(data.message || 'Gagal mengirim pengajuan')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error('Terjadi kesalahan saat mengirim pengajuan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFilteredAttendance = () => {
    return attendances.filter(a => {
      const date = new Date(a.date)
      return date.getMonth().toString() === selectedMonth && 
             date.getFullYear().toString() === selectedYear
    })
  }

  const handleDownloadRecap = () => {
    if (!student) return

    const filtered = getFilteredAttendance()
    const stats = {
      hadir: filtered.filter(a => a.status.toLowerCase() === 'hadir').length,
      terlambat: filtered.filter(a => a.status.toLowerCase() === 'terlambat').length,
      sakit: filtered.filter(a => a.status.toLowerCase() === 'sakit').length,
      izin: filtered.filter(a => a.status.toLowerCase() === 'izin').length,
    }

    const csvContent = [
      ['Rekap Absensi Bulanan'],
      [`Bulan: ${parseInt(selectedMonth) + 1}/${selectedYear}`],
      [''],
      ['Nama', 'Kelas', 'Hadir Tepat Waktu', 'Terlambat', 'Sakit', 'Izin'],
      [student.name, student.class, stats.hadir, stats.terlambat, stats.sakit, stats.izin]
    ].map(e => e.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rekap_absensi_${student.username}_${parseInt(selectedMonth) + 1}_${selectedYear}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Prevent hydration mismatch by showing nothing during SSR
  if (!isHydrated) {
    return <div className="min-h-screen bg-gray-50" />
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
                <span className="text-sm text-gray-600">{student?.name || 'Loading...'}</span>
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
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">Memuat data siswa...</p>
            </CardContent>
          </Card>
        )}

        {/* Student Info Card */}
        {!isLoading && student && (
          <>
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

            {/* Stats Overview */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Ringkasan Kehadiran
              </h2>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => {
                  setRequestType('IZIN')
                  setIsRequestOpen(true)
                }}>
                  <FileText className="w-4 h-4 mr-2 text-yellow-600" />
                  Izin
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setRequestType('SAKIT')
                  setIsRequestOpen(true)
                }}>
                  <Stethoscope className="w-4 h-4 mr-2 text-red-600" />
                  Sakit
                </Button>
                <Button variant="outline" size="sm" onClick={() => student && fetchAttendance(student.id)} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Hadir Tepat Waktu</CardTitle>
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.hadir}</div>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0}% dari total
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-700">Terlambat</CardTitle>
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.terlambat}</div>
                  <p className="text-xs text-yellow-600 mt-1">Perlu ditingkatkan</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Izin</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.izin}</div>
                  <p className="text-xs text-blue-600 mt-1">Izin resmi</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-700">Sakit</CardTitle>
                  <div className="p-2 bg-red-100 rounded-full">
                    <Stethoscope className="h-4 w-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.sakit}</div>
                  <p className="text-xs text-red-600 mt-1">Sakit terkonfirmasi</p>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-2 lg:col-span-2 lg:col-start-2 bg-gradient-to-br from-slate-50 to-white border-slate-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-col items-center justify-center pb-2">
                  <div className="p-2 bg-slate-100 rounded-full mb-2">
                    <Calendar className="h-5 w-5 text-slate-600" />
                  </div>
                  <CardTitle className="text-base font-medium text-slate-700">Total Kehadiran</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{stats.total}</div>
                  <p className="text-sm text-slate-500 mt-1">Hari tercatat</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts & Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle>Grafik Kehadiran Bulanan</CardTitle>
                      <CardDescription>Visualisasi status kehadiran per bulan</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                            <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                          {[2024, 2025, 2026].map(y => (
                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={handleDownloadRecap} title="Download Rekap Excel">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  {getFilteredAttendance().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Hadir', value: getFilteredAttendance().filter(a => a.status.toLowerCase() === 'hadir').length, color: '#16a34a' },
                            { name: 'Terlambat', value: getFilteredAttendance().filter(a => a.status.toLowerCase() === 'terlambat').length, color: '#ca8a04' },
                            { name: 'Izin', value: getFilteredAttendance().filter(a => a.status.toLowerCase() === 'izin').length, color: '#2563eb' },
                            { name: 'Sakit', value: getFilteredAttendance().filter(a => a.status.toLowerCase() === 'sakit').length, color: '#dc2626' },
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: 'Hadir', value: getFilteredAttendance().filter(a => a.status.toLowerCase() === 'hadir').length, color: '#16a34a' },
                            { name: 'Terlambat', value: getFilteredAttendance().filter(a => a.status.toLowerCase() === 'terlambat').length, color: '#ca8a04' },
                            { name: 'Izin', value: getFilteredAttendance().filter(a => a.status.toLowerCase() === 'izin').length, color: '#2563eb' },
                            { name: 'Sakit', value: getFilteredAttendance().filter(a => a.status.toLowerCase() === 'sakit').length, color: '#dc2626' },
                          ].filter(item => item.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-400 flex flex-col items-center">
                      <History className="w-12 h-12 mb-2 opacity-20" />
                      <p>Tidak ada data untuk periode ini</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Aksi Cepat</CardTitle>
                  <CardDescription>Menu pintasan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleScanQRCode} 
                    className="w-full h-24 text-lg flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    <QrCode className="w-8 h-8" />
                    Scan QR Code
                  </Button>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                    <p className="font-semibold mb-1">Tips:</p>
                    <p>Pastikan Anda berada di area sekolah saat melakukan scan QR Code untuk absensi.</p>
                  </div>
                </CardContent>
              </Card>
            </div>            {/* History Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Riwayat Absensi Terbaru
                </CardTitle>
                <CardDescription>
                  Daftar kehadiran Anda dalam 30 hari terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attendances.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada data absensi yang tercatat.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Request Attendance Dialog */}
        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Ajukan Ketidakhadiran</DialogTitle>
              <DialogDescription>
                Silakan lengkapi formulir di bawah ini untuk mengajukan izin atau sakit.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Status Selection */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Jenis Pengajuan</Label>
                <Tabs value={requestType} onValueChange={(v) => setRequestType(v as 'IZIN' | 'SAKIT')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="IZIN">Izin</TabsTrigger>
                    <TabsTrigger value="SAKIT">Sakit</TabsTrigger>
                  </TabsList>
                </Tabs>
                <p className="text-xs text-muted-foreground">
                  {requestType === 'IZIN' 
                    ? 'Gunakan untuk keperluan pribadi, keluarga, atau acara lain.' 
                    : 'Gunakan jika Anda berhalangan hadir karena alasan kesehatan.'}
                </p>
              </div>

              {/* Notes Input */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-medium">
                  Keterangan <span className="text-red-500">*</span>
                </Label>
                <Textarea 
                  id="notes"
                  placeholder={requestType === 'IZIN' ? "Contoh: Ada acara pernikahan kakak kandung..." : "Contoh: Demam tinggi dan flu..."}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file" className="text-base font-medium">
                  Bukti Pendukung <span className="text-xs font-normal text-muted-foreground">(Opsional)</span>
                </Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {requestFile ? (
                        <>
                          <FileText className="w-8 h-8 mb-2 text-blue-500" />
                          <p className="mb-1 text-sm text-gray-700 font-medium truncate max-w-[200px]">{requestFile.name}</p>
                          <p className="text-xs text-gray-500">{(requestFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Klik untuk upload</span> atau drag & drop</p>
                          <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                        </>
                      )}
                    </div>
                    <input 
                      id="file-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*,.pdf"
                      onChange={(e) => setRequestFile(e.target.files ? e.target.files[0] : null)}
                    />
                  </label>
                </div>
                {requestFile && (
                   <Button variant="ghost" size="sm" onClick={() => setRequestFile(null)} className="text-red-500 h-auto p-0 text-xs hover:text-red-700 hover:bg-transparent">
                     Hapus file
                   </Button>
                )}
              </div>
            </div>

            <DialogFooter className="sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRequestOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleRequestSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Kirim Pengajuan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}