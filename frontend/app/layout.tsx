import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'
import AuthProvider from '@/components/ui/AuthProvider'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RishtaConnect — Premium AI Matrimonial',
  description: "Pakistan's premium Muslim matrimonial platform with AI-powered compatibility matching.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark') document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="border-t border-base bg-surface mt-16 pb-20 md:pb-6">
            <div className="app-container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-serif text-sm font-bold text-white"
                  style={{ background: 'var(--rose)' }}>R</div>
                <span className="font-serif text-base font-semibold">RishtaConnect</span>
              </div>
              <p className="text-sm text-muted text-center">
                © 2026 RishtaConnect · Premium AI Matrimonial · All rights reserved
              </p>
              <p className="text-xs text-muted">Connecting families with dignity &amp; respect</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
