import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "RestroWala - Modern Restaurant OS",
    template: "%s | RestroWala"
  },
  description: "Complete restaurant management with AR/VR menu capabilities, real-time orders, and multi-role dashboards.",
  keywords: ["restaurant management", "AR menu", "VR menu", "restaurant OS", "digital menu", "QR ordering"],
  authors: [{ name: "Antigravity Team" }],
  creator: "Antigravity Team",
  publisher: "RestroWala",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "RestroWala",
    title: "RestroWala - Modern Restaurant OS",
    description: "Complete restaurant management with AR/VR menu capabilities, real-time orders, and multi-role dashboards.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "RestroWala - Modern Restaurant OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RestroWala - Modern Restaurant OS",
    description: "Complete restaurant management with AR/VR menu capabilities, real-time orders, and multi-role dashboards.",
    images: ["/api/og"],
    creator: "@restrowala",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Load Inter font from Google Fonts with fallback to system fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
          strategy="lazyOnload"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
