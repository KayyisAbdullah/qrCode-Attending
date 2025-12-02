import type { Metadata, Viewport } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

// Optimize font loading
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
//   display: "swap",
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
//   display: "swap",
// });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3500"),
  title: "Sistem Absensi QR Code - AbsensiQR",
  description: "Sistem absensi modern dengan QR Code untuk institusi pendidikan. Manajemen kehadiran siswa yang cepat, akurat, dan efisien.",
  keywords: ["absensi", "QR Code", "sekolah", "siswa", "manajemen", "kehadiran", "Next.js", "React"],
  authors: [{ name: "AbsensiQR Team" }],
  applicationName: "Sistem Absensi QR Code",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AbsensiQR",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Sistem Absensi QR Code",
    description: "Solusi absensi digital untuk institusi pendidikan modern",
    url: "https://absensi-qr.com",
    siteName: "AbsensiQR",
    images: [
      {
        url: "/icons/icon-512x512.svg",
        width: 512,
        height: 512,
        alt: "AbsensiQR Logo"
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistem Absensi QR Code",
    description: "Solusi absensi digital untuk institusi pendidikan modern",
    images: ["/icons/icon-512x512.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AbsensiQR" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#2563eb" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1e3a8a" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body
        className={`antialiased bg-background text-foreground`}
      >
        <ServiceWorkerRegister />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
