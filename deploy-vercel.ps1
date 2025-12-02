# Script Deploy ke Vercel - Windows PowerShell
Write-Host "🚀 Deploy QR Code Attendance ke Vercel" -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI belum terinstall!" -ForegroundColor Red
    Write-Host "Install dengan: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Langkah 1: Login ke Vercel" -ForegroundColor Green
vercel login

Write-Host ""
Write-Host "📋 Langkah 2: Setup Database PostgreSQL" -ForegroundColor Green
Write-Host ""
Write-Host "Pilih provider database:" -ForegroundColor Yellow
Write-Host "1. Vercel Postgres (Rekomendasi - berbayar setelah trial)"
Write-Host "2. Neon (Gratis - 0.5GB)"
Write-Host "3. Supabase (Gratis - 500MB)"
Write-Host "4. Railway (Gratis dengan limit)"
Write-Host ""

$dbChoice = Read-Host "Pilihan Anda (1-4)"

switch ($dbChoice) {
    "1" {
        Write-Host "Buka: https://vercel.com/dashboard → Storage → Create Database → Postgres" -ForegroundColor Cyan
        Start-Process "https://vercel.com/dashboard"
    }
    "2" {
        Write-Host "Buka: https://neon.tech → Sign up → Create Project" -ForegroundColor Cyan
        Start-Process "https://neon.tech"
    }
    "3" {
        Write-Host "Buka: https://supabase.com → New Project → Copy connection string" -ForegroundColor Cyan
        Start-Process "https://supabase.com"
    }
    "4" {
        Write-Host "Buka: https://railway.app → New Project → Add PostgreSQL" -ForegroundColor Cyan
        Start-Process "https://railway.app"
    }
}

Write-Host ""
Write-Host "⏳ Tunggu hingga database selesai dibuat..." -ForegroundColor Yellow
Read-Host "Tekan Enter setelah database siap"

Write-Host ""
Write-Host "📋 Langkah 3: Update Prisma Schema" -ForegroundColor Green
Copy-Item "prisma\schema.vercel.prisma" "prisma\schema.prisma" -Force
Write-Host "✅ Schema updated ke PostgreSQL" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Langkah 4: Generate Prisma Client" -ForegroundColor Green
npm run db:generate

Write-Host ""
Write-Host "📋 Langkah 5: Deploy ke Vercel" -ForegroundColor Green
vercel

Write-Host ""
Write-Host "📋 Langkah 6: Set Environment Variables" -ForegroundColor Green
Write-Host ""

# DATABASE_URL
Write-Host "Masukkan DATABASE_URL (PostgreSQL connection string):" -ForegroundColor Yellow
Write-Host "Format: postgresql://user:password@host:5432/database?schema=public" -ForegroundColor Gray
$databaseUrl = Read-Host "DATABASE_URL"
if ($databaseUrl) {
    Write-Host "Setting DATABASE_URL..." -ForegroundColor Cyan
    vercel env add DATABASE_URL production
}

# NEXTAUTH_SECRET
Write-Host ""
Write-Host "Generate NEXTAUTH_SECRET..." -ForegroundColor Yellow
$nextauthSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "Generated: $nextauthSecret" -ForegroundColor Gray
$useGenerated = Read-Host "Gunakan secret ini? (Y/n)"
if ($useGenerated -ne "n") {
    Write-Host "Setting NEXTAUTH_SECRET..." -ForegroundColor Cyan
    $nextauthSecret | vercel env add NEXTAUTH_SECRET production
}

# NEXTAUTH_URL
Write-Host ""
Write-Host "Masukkan NEXTAUTH_URL (URL aplikasi Vercel):" -ForegroundColor Yellow
Write-Host "Contoh: https://your-project.vercel.app" -ForegroundColor Gray
$nextauthUrl = Read-Host "NEXTAUTH_URL"
if ($nextauthUrl) {
    Write-Host "Setting NEXTAUTH_URL..." -ForegroundColor Cyan
    $nextauthUrl | vercel env add NEXTAUTH_URL production
}

Write-Host ""
Write-Host "📋 Langkah 7: Deploy Production" -ForegroundColor Green
$deployProd = Read-Host "Deploy ke production sekarang? (Y/n)"
if ($deployProd -ne "n") {
    vercel --prod
}

Write-Host ""
Write-Host "📋 Langkah 8: Run Database Migrations" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️ PENTING: Jalankan migrasi database!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Gunakan connection string DATABASE_URL Anda:" -ForegroundColor Cyan
Write-Host "  `$env:DATABASE_URL='$databaseUrl'; npx prisma migrate deploy" -ForegroundColor Gray
Write-Host ""
$runMigration = Read-Host "Jalankan migrasi sekarang? (Y/n)"
if ($runMigration -ne "n" -and $databaseUrl) {
    Write-Host "Running migrations..." -ForegroundColor Cyan
    $env:DATABASE_URL = $databaseUrl
    npx prisma migrate deploy
    
    Write-Host ""
    $runSeed = Read-Host "Seed database dengan data sample? (Y/n)"
    if ($runSeed -ne "n") {
        npx tsx prisma/seed.ts
    }
}

Write-Host ""
Write-Host "✅ Deployment selesai!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Buka dashboard Vercel untuk melihat URL aplikasi:" -ForegroundColor Cyan
Write-Host "   https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Untuk informasi lengkap, baca: VERCEL_DEPLOY_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
