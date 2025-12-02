# 🔧 Troubleshooting QR Scanner dari Layar HP

## ✅ Perbaikan yang Telah Diterapkan (v9.1)

### 1. **Peningkatan Resolusi Kamera**
- Resolusi maksimal hingga 3840x2160 (4K) untuk detail lebih baik
- Frame rate optimal 30-60 FPS
- Auto-focus continuous untuk fokus yang lebih baik

### 2. **Image Preprocessing**
- Peningkatan brightness (+20) untuk kompensasi layar HP
- Peningkatan contrast (1.5x) untuk membedakan pola QR lebih jelas
- Preprocessing otomatis setiap frame untuk deteksi optimal

### 3. **Deteksi QR yang Lebih Baik**
- Inversion attempts untuk mendeteksi QR normal dan inverted
- Scanning interval optimal 100ms untuk stabilitas
- jsQR library dengan konfigurasi maksimal

### 4. **Kontrol Tambahan**
- **Flip/Mirror**: Tap video untuk flip horizontal
- **Switch Camera**: Tombol untuk ganti kamera depan/belakang
- **Flash/Torch**: Nyalakan flash untuk kondisi cahaya rendah (jika tersedia)
- **Upload**: Alternatif upload gambar jika scanning gagal

---

## 📱 Tips Sukses Scan QR dari Layar HP

### Persiapan Layar HP (Yang Menampilkan QR):
1. **Maksimalkan Brightness**: Naikkan brightness ke 100%
2. **Nonaktifkan Auto-brightness**: Agar brightness tetap stabil
3. **Zoom QR Code**: Perbesar tampilan QR di layar HP (jika browser/app mendukung)
4. **Mode Landscape**: Putar HP landscape untuk QR lebih besar
5. **Bersihkan Layar**: Pastikan tidak ada sidik jari yang menghalangi

### Posisi & Pencahayaan:
1. **Hindari Refleksi Langsung**: 
   - Miringkan layar HP 10-15 derajat
   - Posisikan agar tidak ada pantulan cahaya langsung
   
2. **Pencahayaan Ruangan**:
   - Cahaya cukup terang, tapi tidak terlalu terang
   - Hindari backlight (cahaya dari belakang)
   - Gunakan flash/torch jika terlalu gelap

3. **Jarak Optimal**:
   - 15-25 cm dari kamera ke layar HP
   - Tidak terlalu dekat (blur) atau terlalu jauh (detail hilang)

4. **Sudut Kamera**:
   - Tegak lurus dengan layar HP (90 derajat)
   - Hindari sudut miring yang ekstrem

### Teknik Scanning:
1. **Stabilkan Tangan**: Gunakan dua tangan atau sandarkan tangan
2. **Fokus**: Tunggu 1-2 detik untuk auto-focus
3. **Coba Flip**: Jika gagal, tap video untuk flip/mirror
4. **Ganti Kamera**: Coba switch antara kamera depan dan belakang
5. **Gunakan Flash**: Nyalakan flash jika kondisi kurang cahaya

---

## ⚠️ Masalah Umum & Solusi

### 1. QR Tidak Terdeteksi
**Penyebab:**
- Refleksi cahaya terlalu kuat
- Kontras QR dengan background kurang
- Resolusi kamera rendah
- QR terlalu kecil di layar

**Solusi:**
- Miringkan layar HP untuk mengurangi refleksi
- Perbesar tampilan QR di layar HP
- Gunakan flash/torch untuk menambah pencahayaan
- Coba upload screenshot QR sebagai alternatif

### 2. Kamera Blur/Tidak Fokus
**Penyebab:**
- Terlalu dekat dengan layar
- Kamera tidak support auto-focus
- Layar kotor atau buram

**Solusi:**
- Mundur sedikit (20-30cm)
- Bersihkan lensa kamera laptop
- Bersihkan layar HP yang menampilkan QR
- Tunggu beberapa detik untuk fokus otomatis

### 3. QR Terbalik/Mirror
**Penyebab:**
- Video di-mirror secara default (kamera depan)

**Solusi:**
- Tap/klik pada video untuk toggle flip
- Indikator "Mirrored" atau "Normal" di pojok kanan atas
- Coba kedua mode untuk hasil terbaik

### 4. Permission Ditolak
**Penyebab:**
- Browser belum diberi akses kamera
- Browser tidak support getUserMedia

**Solusi:**
- Klik "Allow" saat browser meminta akses
- Check settings browser untuk camera permission
- Gunakan browser modern (Chrome, Edge, Firefox)
- Pastikan tidak ada aplikasi lain yang menggunakan kamera

### 5. Kamera Tidak Tersedia
**Penyebab:**
- Laptop tidak punya webcam
- Kamera sedang digunakan aplikasi lain
- Driver kamera bermasalah

**Solusi:**
- Tutup aplikasi lain yang menggunakan kamera (Zoom, Teams, dll)
- Restart browser
- Check Device Manager untuk status webcam
- Gunakan fitur "Upload Gambar" sebagai alternatif

---

## 🌐 Browser yang Disarankan

### ✅ Fully Supported:
- **Chrome/Edge** (Chromium-based) - Recommended
- **Firefox** 
- **Safari** (macOS/iOS)

### ⚠️ Limited Support:
- Browser lama atau browser mobile tertentu
- Tor Browser (privacy mode mungkin block camera)

---

## 🎯 Fitur Alternatif

Jika scanning real-time tetap gagal, gunakan:

### **Upload Gambar QR**:
1. Screenshot QR code dari layar HP
2. Klik tombol "Upload Gambar QR"
3. Pilih screenshot yang sudah diambil
4. Scanner akan membaca QR dari gambar

---

## 🔬 Technical Details

### Konfigurasi Kamera:
```javascript
{
  video: {
    facingMode: 'user' | 'environment',
    width: { ideal: 1920, max: 3840 },
    height: { ideal: 1080, max: 2160 },
    aspectRatio: { ideal: 16/9 },
    frameRate: { ideal: 30, max: 60 },
    focusMode: { ideal: 'continuous' }
  }
}
```

### Image Preprocessing:
```javascript
brightness: +20
contrast: 1.5x
inversion: attemptBoth
scanInterval: 100ms
```

---

## 📞 Support

Jika masalah masih berlanjut setelah mengikuti semua tips di atas:
1. Coba restart browser
2. Clear browser cache
3. Update browser ke versi terbaru
4. Coba di browser berbeda
5. Gunakan alternatif "Upload Gambar"

**Version:** 9.1 Enhanced Screen Scanning  
**Last Updated:** December 2, 2025
