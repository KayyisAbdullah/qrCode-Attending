'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  QrCode, 
  Users, 
  Shield, 
  Clock, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  Menu,
  X,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  // Form states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Try admin login first
      let response = await fetch('/api/auth/login/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('adminToken', data.token)
        window.location.href = '/dashboard/admin'
        return
      }

      // If admin login fails, try student login
      response = await fetch('/api/auth/login/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('studentToken', data.token)
        window.location.href = '/dashboard/student'
        return
      }

      // If both fail, show error
      const errorData = await response.json()
      setError(errorData.message || 'Username atau password salah')
      
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: <QrCode className="w-8 h-8 text-blue-600" />,
      title: "Absensi QR Code",
      description: "Sistem absensi modern dengan QR Code yang cepat dan akurat"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Manajemen Siswa",
      description: "Kelola data siswa dengan mudah dan efisien"
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-600" />,
      title: "Real-time Tracking",
      description: "Pantau kehadiran siswa secara real-time"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Laporan Komprehensif",
      description: "Generate laporan kehadiran yang detail dan terperinci"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Keamanan Terjamin",
      description: "Sistem aman dengan enkripsi data dan autentikasi"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-teal-600" />,
      title: "Mudah Digunakan",
      description: "Interface yang intuitif dan user-friendly"
    }
  ]

  const testimonials = [
    {
      name: "Bapak Ahmad, Kepala Sekolah",
      role: "SMK Negeri 1 Jakarta",
      content: "Sistem absensi QR Code ini sangat membantu meningkatkan efisiensi manajemen kehadiran siswa. Sangat direkomendasikan!"
    },
    {
      name: "Ibu Siti, Wali Kelas",
      role: "SMA Negeri 5 Bandung",
      content: "Dengan sistem ini, saya bisa memantau kehadiran siswa secara real-time. Laporan yang dihasilkan juga sangat detail."
    },
    {
      name: "Rizki, Siswa",
      role: "Kelas XII IPA",
      content: "Absensi jadi lebih mudah dan cepat dengan QR Code. Tidak perlu antri lagi untuk absen manual."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <QrCode className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">AbsensiQR</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Fitur</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimoni</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Harga</a>
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Login
              </Button>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Fitur</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Testimoni</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Harga</a>
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Sistem Absensi
            <span className="text-blue-600"> Modern</span>
            <br />
            dengan QR Code
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Solusi absensi digital yang cepat, akurat, dan efisien untuk institusi pendidikan modern. 
            Kelola kehadiran siswa dengan teknologi terkini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowLoginModal(true)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Mulai Sekarang
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Teknologi terkini untuk memenuhi kebutuhan manajemen kehadiran sekolah Anda
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Mereka?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Testimoni dari pengguna yang telah merasakan manfaat sistem kami
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Meningkatkan Efisiensi Absensi Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabunglah dengan ratusan sekolah yang telah menggunakan sistem kami
          </p>
          <Button 
            onClick={() => setShowLoginModal(true)}
            size="lg"
            variant="secondary"
            className="px-8 py-3"
          >
            Login Sekarang
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <QrCode className="w-8 h-8 text-blue-400 mr-3" />
                <span className="text-xl font-bold">AbsensiQR</span>
              </div>
              <p className="text-gray-400">
                Sistem absensi modern dengan QR Code untuk institusi pendidikan.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Fitur</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Absensi QR Code</li>
                <li>Manajemen Siswa</li>
                <li>Laporan Kehadiran</li>
                <li>Dashboard Real-time</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQ</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>info@absensiqr.com</li>
                <li>+62 812-3456-7890</li>
                <li>Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 AbsensiQR. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            {/* Close Button - Top Right */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors group"
              aria-label="Tutup"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <div className="p-8 pt-12">
              <CardHeader className="text-center px-0 pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Selamat Datang
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Masuk ke sistem absensi digital
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-0">
                {error && (
                  <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="username" className="text-gray-700 font-medium text-sm">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Masukkan username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 text-base pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Memuat...
                      </div>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Belum ada akun?{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 hover:text-blue-700 font-semibold text-base"
                      onClick={() => {
                        setShowLoginModal(false)
                        window.location.href = '/register'
                      }}
                    >
                      Register disini
                    </Button>
                  </p>
                </div>
              </CardContent>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}