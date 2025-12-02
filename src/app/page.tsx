'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  QrCode, 
  Users, 
  Shield, 
  Clock, 
  BarChart3, 
  CheckCircle, 
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'

export default function HomePage() {
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
      <Navigation />

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
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-colors">
              Masuk Sekarang
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/register" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Daftar Sebagai Siswa
            </Link>
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
          <Link 
            href="/login"
            className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-blue-600 font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Login Sekarang
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
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


    </div>
  )
}