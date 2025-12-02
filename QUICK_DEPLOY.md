# 🚀 Quick Start - Deploy ke Vercel

## Step 1: Install Vercel CLI (Sudah selesai ✅)
```bash
npm install -g vercel
```

## Step 2: Login ke Vercel
```bash
vercel login
```

## Step 3: Setup Database PostgreSQL

### Pilih salah satu provider (GRATIS):

#### Option A: Neon (Rekomendasi - Mudah & Gratis)
1. Buka: https://neon.tech
2. Sign up dengan GitHub
3. Create new project → Pilih region terdekat
4. Copy connection string dari dashboard
5. Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

#### Option B: Supabase (Gratis)
1. Buka: https://supabase.com
2. Create new project
3. Settings → Database → Connection string → URI
4. Format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`

#### Option C: Railway (Gratis $5 credit)
1. Buka: https://railway.app
2. New Project → Provision PostgreSQL
3. Copy connection string dari Variables tab
4. Format: `postgresql://user:password@host.railway.app:port/database`

## Step 4: Update Schema Prisma
```bash
# Copy schema PostgreSQL
Copy-Item prisma\schema.vercel.prisma prisma\schema.prisma -Force

# Generate Prisma Client
npm run db:generate
```

## Step 5: Deploy ke Vercel
```bash
vercel
```

Jawab pertanyaan:
- **Set up and deploy?** → `Y`
- **Which scope?** → Pilih account Anda
- **Link to existing project?** → `N` (untuk project baru)
- **Project name?** → `qrcode-attending`
- **Directory?** → `./`
- **Override settings?** → `N`

## Step 6: Set Environment Variables

### A. Via Vercel Dashboard (Lebih Mudah)
1. Buka: https://vercel.com/dashboard
2. Pilih project Anda
3. Settings → Environment Variables
4. Tambahkan variabel berikut:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Connection string dari Step 3 | Production |
| `NEXTAUTH_SECRET` | Generate dengan command di bawah | Production |
| `NEXTAUTH_URL` | URL Vercel Anda (lihat di dashboard) | Production |

**Generate NEXTAUTH_SECRET:**
```bash
# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Linux/Mac
openssl rand -base64 32
```

### B. Via CLI (Alternatif)
```bash
# Set DATABASE_URL
vercel env add DATABASE_URL production
# Paste connection string Anda

# Set NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
# Paste secret yang di-generate

# Set NEXTAUTH_URL
vercel env add NEXTAUTH_URL production
# Paste URL Vercel Anda (contoh: https://qrcode-attending.vercel.app)
```

## Step 7: Deploy Production
```bash
vercel --prod
```

## Step 8: Run Database Migrations

**PENTING:** Jalankan migration sebelum menggunakan aplikasi!

```bash
# Set DATABASE_URL sebagai environment variable
$env:DATABASE_URL="postgresql://user:password@host/database"

# Run migration
npx prisma migrate deploy

# (Opsional) Seed database dengan data sample
npx tsx prisma/seed.ts
```

## Step 9: Test Aplikasi

1. Buka URL Vercel Anda (contoh: `https://qrcode-attending.vercel.app`)
2. Coba register sebagai student
3. Login dan test fitur-fitur

## Troubleshooting

### ❌ Error: Can't reach database
**Solusi:** Pastikan DATABASE_URL benar dan tambahkan `?sslmode=require` di akhir URL untuk Neon.

### ❌ Error: Prisma Client initialization failed
**Solusi:** 
```bash
vercel env pull .env.local
npm run db:generate
vercel --prod
```

### ❌ Build Error
**Solusi:** Cek logs di Vercel dashboard dan pastikan semua env variables sudah di-set.

## Update Deployment

Vercel otomatis deploy setiap push ke GitHub. Atau manual:
```bash
vercel --prod
```

## Commands Cheat Sheet

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# Lihat logs
vercel logs

# Lihat env variables
vercel env ls

# Pull env variables ke local
vercel env pull

# Open project di browser
vercel open
```

## Selesai! 🎉

Aplikasi Anda sekarang live di Vercel!

**Next Steps:**
- Setup custom domain di Vercel dashboard
- Enable Analytics di Vercel
- Setup monitoring & error tracking

---

**Need Help?** Baca dokumentasi lengkap di: `VERCEL_DEPLOY_GUIDE.md`
