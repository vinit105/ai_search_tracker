import './globals.css'
import React from 'react'
import LogoutButton from '../components/LogoutButton'
import Link from 'next/link'

export const metadata = {
  title: 'AI Search Visibility Tracker',
  description: 'Track your brand visibility across AI search engines',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%233b82f6"/><text x="50" y="70" font-size="60" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-weight="bold">AI</text></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="bg-white shadow-sm">
            <div className="container py-4 flex items-center justify-between">
              <Link href="/projects" className="text-lg font-semibold hover:text-blue-600">
                AEO Dashboard
              </Link>
              <LogoutButton />
            </div>
          </header>
          <main className="container py-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
