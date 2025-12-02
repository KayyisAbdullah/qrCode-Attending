# 🚀 Panduan Deploy ke Vercel + Neon

## ✅ Yang Sudah Dikerjakan

1. ✅ Schema Prisma sudah diupdate ke PostgreSQL
2. ✅ NEXTAUTH_SECRET sudah di-generate: `060B6NK/EzJZa0OrCDib5YQJG/VpkPT0VT8ffsTvlPY=`
3. ✅ Vercel CLI sudah login

---

## 📋 Langkah Deploy

### **1. Buat Database di Neon**

1. Buka: https://neon.tech
2. Login dengan GitHub/Google
3. Klik **"Create a project"**
4. Pilih region: **Singapore** atau **AWS Asia Pacific**
5. Copy **Pooled connection string**:
   ```
   postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require
   ```
6. **SIMPAN URL INI!** Kita akan pakai di langkah berikutnya

---

### **2. Deploy ke Vercel (Pilih salah satu cara)**

#### **Cara A: Via Vercel Dashboard (REKOMENDASI - Lebih Mudah)**

1. **Buka Vercel:**
   - https://vercel.com/dashboard
   - Klik **"Add New..."** → **"Project"**

2. **Import dari GitHub:**
   - Klik **"Import Git Repository"**
   - Pilih: `KayyisAbdullah/qrCode-Attending`
   - Klik **"Import"**

3. **Configure Project:**
   ```
   Project Name: qrcode-attending
   Framework: Next.js (auto-detected)
   Root Directory: ./
   Build Command: npm run vercel-build
   ```

4. **Set Environment Variables (PENTING!):**
   
   Klik **"Environment Variables"** dan tambahkan:
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `[Paste connection string dari Neon]` |
   | `NEXTAUTH_SECRET` | `060B6NK/EzJZa0OrCDib5YQJG/VpkPT0VT8ffsTvlPY=` |
   | `NEXTAUTH_URL` | `https://[your-project].vercel.app` |
   
   **Note:** Untuk `NEXTAUTH_URL`, ganti `[your-project]` dengan nama project Anda.
   Atau tunggu sampai deploy selesai, lalu update environment variable ini.

5. **Deploy:**
   - Klik **"Deploy"**
   - Tunggu 2-3 menit

6. **Setelah deploy selesai:**
   - Copy URL project Anda (misalnya: `https://qrcode-attending.vercel.app`)
   - Kembali ke **Settings** → **Environment Variables**
   - Update `NEXTAUTH_URL` dengan URL yang benar
   - Klik **"Redeploy"** untuk apply perubahan

---

#### **Cara B: Via Vercel CLI**

1. **Deploy project:**
   ```powershell
   vercel
   ```
   
   Jawab pertanyaan:
   ```
   ? Set up and deploy? [Y/n] y
   ? Which scope? [Pilih account Anda]
   ? Link to existing project? [N/y] n
   ? What's your project's name? qrcode-attending
   ? In which directory is your code located? ./
   ? Want to override settings? [y/N] n
   ```

2. **Set Environment Variables:**
   ```powershell
   # DATABASE_URL
   vercel env add DATABASE_URL production
   # Paste connection string dari Neon

   # NEXTAUTH_SECRET
   vercel env add NEXTAUTH_SECRET production
   # Paste: 060B6NK/EzJZa0OrCDib5YQJG/VpkPT0VT8ffsTvlPY=

   # NEXTAUTH_URL
   vercel env add NEXTAUTH_URL production
   # Paste: https://[your-project].vercel.app
   ```

3. **Deploy ke Production:**
   ```powershell
   vercel --prod
   ```

---

### **3. Run Database Migration**

Setelah deploy selesai dan environment variables sudah di-set, jalankan migration:

```powershell
# Set DATABASE_URL dari Neon
$env:DATABASE_URL="postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database dengan data awal
npx tsx prisma/seed.ts
```

**Note:** Ganti `DATABASE_URL` dengan connection string yang Anda copy dari Neon!

---

### **4. Verifikasi Deployment**

1. Buka URL Vercel Anda: `https://[your-project].vercel.app`
2. Test halaman:
   - ✅ Login page
   - ✅ Register student
   - ✅ Generate QR code
   - ✅ Scan QR code

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"

**Solusi:**
- Pastikan connection string dari Neon benar
- Pastikan ada `?sslmode=require` di akhir URL
- Test connection: `npx prisma db push`

### Error: "Prisma Client did not initialize yet"

**Solusi:**
```powershell
vercel env add DATABASE_URL production
vercel --prod
```

### Build Error di Vercel

**Solusi:**
1. Check Vercel build logs
2. Pastikan semua environment variables sudah di-set
3. Test build local: `npm run build`

---

## 📝 Environment Variables yang Diperlukan

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `DATABASE_URL` | PostgreSQL connection dari Neon | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Secret untuk NextAuth | `060B6NK/EzJZa0OrCDib5YQJG/VpkPT0VT8ffsTvlPY=` |
| `NEXTAUTH_URL` | URL aplikasi Vercel | `https://qrcode-attending.vercel.app` |

---

## 🎉 Selesai!

Aplikasi Anda sekarang sudah online di:
- **Frontend:** Vercel
- **Database:** Neon PostgreSQL

Setiap kali Anda push ke GitHub, Vercel akan otomatis deploy ulang!

---

## 📚 Resources

- Vercel Dashboard: https://vercel.com/dashboard
- Neon Console: https://console.neon.tech
- Prisma Docs: https://www.prisma.io/docs

---

## 🆘 Butuh Bantuan?

Jika ada masalah:
1. Check Vercel logs: `vercel logs`
2. Check build logs di Vercel dashboard
3. Test database connection: `npx prisma db push`
