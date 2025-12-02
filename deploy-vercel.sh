#!/bin/bash

# Script Deploy ke Vercel - Linux/Mac
echo "🚀 Deploy QR Code Attendance ke Vercel"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI belum terinstall!"
    echo "Install dengan: npm install -g vercel"
    exit 1
fi

echo "📋 Langkah 1: Login ke Vercel"
vercel login

echo ""
echo "📋 Langkah 2: Setup Database PostgreSQL"
echo ""
echo "Pilih provider database:"
echo "1. Vercel Postgres (Rekomendasi - berbayar setelah trial)"
echo "2. Neon (Gratis - 0.5GB)"
echo "3. Supabase (Gratis - 500MB)"
echo "4. Railway (Gratis dengan limit)"
echo ""

read -p "Pilihan Anda (1-4): " dbChoice

case $dbChoice in
    1)
        echo "Buka: https://vercel.com/dashboard → Storage → Create Database → Postgres"
        ;;
    2)
        echo "Buka: https://neon.tech → Sign up → Create Project"
        ;;
    3)
        echo "Buka: https://supabase.com → New Project → Copy connection string"
        ;;
    4)
        echo "Buka: https://railway.app → New Project → Add PostgreSQL"
        ;;
esac

echo ""
echo "⏳ Tunggu hingga database selesai dibuat..."
read -p "Tekan Enter setelah database siap"

echo ""
echo "📋 Langkah 3: Update Prisma Schema"
cp prisma/schema.vercel.prisma prisma/schema.prisma
echo "✅ Schema updated ke PostgreSQL"

echo ""
echo "📋 Langkah 4: Generate Prisma Client"
npm run db:generate

echo ""
echo "📋 Langkah 5: Deploy ke Vercel"
vercel

echo ""
echo "📋 Langkah 6: Set Environment Variables"
echo ""

# DATABASE_URL
echo "Masukkan DATABASE_URL (PostgreSQL connection string):"
echo "Format: postgresql://user:password@host:5432/database?schema=public"
read -p "DATABASE_URL: " databaseUrl
if [ ! -z "$databaseUrl" ]; then
    echo "Setting DATABASE_URL..."
    echo "$databaseUrl" | vercel env add DATABASE_URL production
fi

# NEXTAUTH_SECRET
echo ""
echo "Generate NEXTAUTH_SECRET..."
nextauthSecret=$(openssl rand -base64 32)
echo "Generated: $nextauthSecret"
read -p "Gunakan secret ini? (Y/n): " useGenerated
if [ "$useGenerated" != "n" ]; then
    echo "Setting NEXTAUTH_SECRET..."
    echo "$nextauthSecret" | vercel env add NEXTAUTH_SECRET production
fi

# NEXTAUTH_URL
echo ""
echo "Masukkan NEXTAUTH_URL (URL aplikasi Vercel):"
echo "Contoh: https://your-project.vercel.app"
read -p "NEXTAUTH_URL: " nextauthUrl
if [ ! -z "$nextauthUrl" ]; then
    echo "Setting NEXTAUTH_URL..."
    echo "$nextauthUrl" | vercel env add NEXTAUTH_URL production
fi

echo ""
echo "📋 Langkah 7: Deploy Production"
read -p "Deploy ke production sekarang? (Y/n): " deployProd
if [ "$deployProd" != "n" ]; then
    vercel --prod
fi

echo ""
echo "📋 Langkah 8: Run Database Migrations"
echo ""
echo "⚠️ PENTING: Jalankan migrasi database!"
echo ""
echo "Gunakan connection string DATABASE_URL Anda:"
echo "  DATABASE_URL='$databaseUrl' npx prisma migrate deploy"
echo ""
read -p "Jalankan migrasi sekarang? (Y/n): " runMigration
if [ "$runMigration" != "n" ] && [ ! -z "$databaseUrl" ]; then
    echo "Running migrations..."
    DATABASE_URL="$databaseUrl" npx prisma migrate deploy
    
    echo ""
    read -p "Seed database dengan data sample? (Y/n): " runSeed
    if [ "$runSeed" != "n" ]; then
        DATABASE_URL="$databaseUrl" npx tsx prisma/seed.ts
    fi
fi

echo ""
echo "✅ Deployment selesai!"
echo ""
echo "🔗 Buka dashboard Vercel untuk melihat URL aplikasi:"
echo "   https://vercel.com/dashboard"
echo ""
echo "📚 Untuk informasi lengkap, baca: VERCEL_DEPLOY_GUIDE.md"
echo ""
