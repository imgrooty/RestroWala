import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "RestroWala - Modern Restaurant OS",
  description: "Complete restaurant management with AR/VR menu capabilities",
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
