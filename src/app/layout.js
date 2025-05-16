// app/layout.js
import { Inter } from 'next/font/google'
import Providers from '@/components/providers/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Science Exhibition Platform',
  description: 'Discover and book science exhibitions and events',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}