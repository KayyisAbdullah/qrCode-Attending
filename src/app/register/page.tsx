'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  UserPlus, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    class: '',
    password: '',
    confirmPassword: ''
  })

  const [validation, setValidation] = useState({
    passwordLength: false,
    passwordMatch: false,
    emailValid: false,
    nameValid: false
  })

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
    email: false,
    username: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Mark field as touched
    if (name === 'password' || name === 'confirmPassword' || name === 'email' || name === 'username') {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }))
    }

    // Real-time validation for username (now as nama lengkap)
    if (name === 'username') {
      setValidation(prev => ({
        ...prev,
        nameValid: value.trim().length >= 3
      }))
    }

    // Real-time validation
    if (name === 'password') {
      setValidation(prev => ({
        ...prev,
        passwordLength: value.length >= 6,
        passwordMatch: value === formData.confirmPassword
      }))
    }

    if (name === 'confirmPassword') {
      setValidation(prev => ({
        ...prev,
        passwordMatch: value === formData.password
      }))
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      setValidation(prev => ({
        ...prev,
        emailValid: emailRegex.test(value)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validate all fields
    if (!formData.username.trim()) {
      setError('Nama lengkap harus diisi')
      setIsLoading(false)
      return
    }

    if (formData.username.trim().length < 3) {
      setError('Nama lengkap minimal 3 karakter')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid')
      setIsLoading(false)
      return
    }

    if (!formData.class.trim()) {
      setError('Kelas harus diisi')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.username.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          class: formData.class.trim(),
          password: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Registrasi berhasil! Silakan login dengan akun Anda.')
        setFormData({
          username: '',
          email: '',
          class: '',
          password: '',
          confirmPassword: ''
        })
        setValidation({
          passwordLength: false,
          passwordMatch: false,
          emailValid: false,
          nameValid: false
        })
        setTouched({
          password: false,
          confirmPassword: false,
          email: false,
          username: false
        })
        
        // Show success message then redirect
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        setError(data.message || 'Registrasi gagal. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Close Button - Top Right */}
          <button
            onClick={() => window.location.href = '/'}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors group z-10"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>

          <div className="p-8 pt-12">
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Buat Akun Baru
              </h1>
              <p className="text-gray-600 text-lg">
                Daftar sebagai siswa baru
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-gray-700 font-medium text-sm">
                  Nama Lengkap
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                {touched.username && formData.username && (
                  <div className="flex items-center text-xs">
                    {validation.nameValid ? (
                      <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-600 mr-1" />
                    )}
                    <span className={validation.nameValid ? 'text-green-600' : 'text-red-600'}>
                      {validation.nameValid ? 'Nama valid' : 'Nama minimal 3 karakter'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                {touched.email && formData.email && (
                  <div className="flex items-center text-xs">
                    {validation.emailValid ? (
                      <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-600 mr-1" />
                    )}
                    <span className={validation.emailValid ? 'text-green-600' : 'text-red-600'}>
                      {validation.emailValid ? 'Format email valid' : 'Format email tidak valid'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="class" className="text-gray-700 font-medium text-sm">
                  Kelas
                </Label>
                <Input
                  id="class"
                  name="class"
                  type="text"
                  placeholder="Contoh: X-A, XI-B, XII-IPA"
                  value={formData.class}
                  onChange={handleInputChange}
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={handleInputChange}
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
                {touched.password && formData.password && (
                  <div className="flex items-center text-xs">
                    {validation.passwordLength ? (
                      <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-600 mr-1" />
                    )}
                    <span className={validation.passwordLength ? 'text-green-600' : 'text-red-600'}>
                      {validation.passwordLength ? 'Password valid' : 'Password minimal 6 karakter'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium text-sm">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Konfirmasi password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-12 text-base pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </Button>
                </div>
                {touched.confirmPassword && formData.confirmPassword && (
                  <div className="flex items-center text-xs">
                    {validation.passwordMatch ? (
                      <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-600 mr-1" />
                    )}
                    <span className={validation.passwordMatch ? 'text-green-600' : 'text-red-600'}>
                      {validation.passwordMatch ? 'Password cocok' : 'Password tidak cocok'}
                    </span>
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading || !validation.passwordLength || !validation.passwordMatch || !validation.emailValid}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Memuat...
                  </div>
                ) : (
                  'Register'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Sudah ada akun?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 hover:text-blue-700 font-semibold text-base"
                  onClick={() => window.location.href = '/login'}
                >
                  Login disini
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}