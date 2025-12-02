# 🚀 Panduan Deploy ke Vercel

## Langkah 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Langkah 2: Login ke Vercel

```bash
vercel login
```

## Langkah 3: Setup Database PostgreSQL di Vercel

### Opsi A: Menggunakan Vercel Postgres (Rekomendasi)

1. Buka dashboard Vercel: https://vercel.com/dashboard
2. Pilih project Anda atau buat project baru
3. Klik tab **Storage**
4. Klik **Create Database**
5. Pilih **Postgres**
6. Ikuti wizard untuk membuat database
7. Setelah selesai, Vercel akan otomatis menambahkan environment variable `DATABASE_URL`

### Opsi B: Menggunakan Neon Database (Gratis)

1. Buka https://neon.tech dan daftar akun gratis
2. Buat database PostgreSQL baru
3. Copy connection string yang diberikan
4. Format: `postgresql://user:password@host/database?sslmode=require`

### Opsi C: Menggunakan Supabase (Gratis)

1. Buka https://supabase.com dan daftar akun
2. Buat project baru
3. Di Settings → Database, copy connection string
4. Pilih "URI" mode dan pastikan connection pooling enabled
5. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Opsi D: Menggunakan Railway (Gratis)

1. Buka https://railway.app dan daftar
2. Create New Project → Provision PostgreSQL
3. Klik database → Connect → Copy connection string
4. Format: `postgresql://user:password@host:port/database`

## Langkah 4: Update Schema Prisma

Ganti `schema.prisma` dengan versi PostgreSQL:

```bash
# Windows (PowerShell)
Copy-Item prisma\schema.vercel.prisma prisma\schema.prisma -Force

# Linux/Mac
cp prisma/schema.vercel.prisma prisma/schema.prisma
```

## Langkah 5: Generate Secret untuk NextAuth

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

Copy output ini untuk digunakan sebagai `NEXTAUTH_SECRET`.

## Langkah 6: Deploy ke Vercel

### Deploy Pertama Kali:

```bash
vercel
```

Jawab pertanyaan:
- Set up and deploy? **Y**
- Which scope? Pilih account Anda
- Link to existing project? **N** (untuk project baru)
- What's your project's name? `qrcode-attending` (atau nama lain)
- In which directory is your code located? `./`
- Want to override settings? **N**

### Set Environment Variables:

```bash
# Set DATABASE_URL (ganti dengan connection string Anda)
vercel env add DATABASE_URL production

# Set NEXTAUTH_SECRET (ganti dengan hasil generate tadi)
vercel env add NEXTAUTH_SECRET production

# Set NEXTAUTH_URL (ganti dengan URL Vercel Anda)
vercel env add NEXTAUTH_URL production
```

Contoh values:
- `DATABASE_URL`: `postgresql://user:password@host:5432/database?schema=public`
- `NEXTAUTH_SECRET`: hasil dari `openssl rand -base64 32`
- `NEXTAUTH_URL`: `https://your-project.vercel.app`

## Langkah 7: Run Database Migrations

Setelah environment variables di-set, jalankan migrasi:

```bash
# Install dependencies di local dengan DATABASE_URL
# Ganti dengan connection string database Vercel Anda
$env:DATABASE_URL="postgresql://user:password@host:5432/database"; npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# (Opsional) Seed database
$env:DATABASE_URL="postgresql://user:password@host:5432/database"; npx tsx prisma/seed.ts
```

## Langkah 8: Deploy Production

```bash
vercel --prod
```

## Langkah 9: Setup Database via Vercel Dashboard

Alternatif cara jalankan migration:

1. Install `@vercel/postgres` untuk menjalankan migration via Vercel:
```bash
npm install @vercel/postgres
```

2. Atau buat script migrate di `package.json`:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

3. Redeploy:
```bash
vercel --prod
```

## Langkah 10: Verifikasi Deployment

1. Buka URL yang diberikan Vercel (contoh: `https://your-project.vercel.app`)
2. Test halaman login
3. Test registrasi student baru
4. Test generate QR code
5. Test scan QR code

## Troubleshooting

### Error: P1001 - Can't reach database server

**Solusi:**
- Pastikan DATABASE_URL benar dan bisa diakses dari Vercel
- Untuk Neon/Supabase, tambahkan `?sslmode=require` atau `?ssl=true` di akhir URL
- Pastikan database tidak di-block firewall

### Error: Prisma Client did not initialize yet

**Solusi:**
```bash
vercel env add DATABASE_URL production
vercel --prod
```

### Error: Build failed

**Solusi:**
- Cek Vercel build logs
- Pastikan semua environment variables sudah di-set
- Coba build local: `npm run build`

### Database Migration Error

**Solusi:**
```bash
# Run migration manual
npx prisma migrate deploy

# Atau reset dan migrate ulang (HATI-HATI: akan hapus data)
npx prisma migrate reset
```

## Environment Variables Yang Diperlukan

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret untuk NextAuth | `hasil dari openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL aplikasi Anda | `https://your-app.vercel.app` |

## Perintah Berguna

```bash
# Lihat environment variables
vercel env ls

# Pull environment variables ke local
vercel env pull

# Hapus environment variable
vercel env rm DATABASE_URL production

# Lihat logs
vercel logs

# Lihat deployment list
vercel ls

# Deploy specific branch
vercel --prod --yes
```

## Update Deployment

Setiap kali push ke GitHub (jika sudah connect), Vercel akan otomatis deploy.

Atau manual:
```bash
# Deploy ke preview
vercel

# Deploy ke production
vercel --prod
```

## Database Management Tools

Gunakan tools ini untuk manage database:

1. **Prisma Studio** (Local):
```bash
$env:DATABASE_URL="your-production-db-url"; npx prisma studio
```

2. **Neon Console**: https://console.neon.tech
3. **Supabase Dashboard**: https://app.supabase.com
4. **Railway Dashboard**: https://railway.app
5. **pgAdmin**: Desktop client untuk PostgreSQL

## Backup Database

```bash
# Export database
pg_dump -h host -U user -d database > backup.sql

# Import database
psql -h host -U user -d database < backup.sql
```

## Selesai! 🎉

Project Anda sekarang sudah live di Vercel dengan database PostgreSQL yang scalable!
