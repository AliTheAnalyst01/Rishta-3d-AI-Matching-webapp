import type { Metadata } from 'next'
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RishtaConnect — Find Your Life Partner',
  description: "Pakistan's premium Muslim matrimonial platform with AI-powered matching.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${jakarta.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var shouldDark = saved ? saved === 'dark' : true;
                  document.documentElement.classList.toggle('dark', shouldDark);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen">
        <Navbar />
        <main className="pb-6">{children}</main>
        <footer className="border-t border-base py-8 mt-10">
          <div className="app-container text-center text-sm text-muted">
            <p>© 2024 RishtaConnect. All rights reserved.</p>
            <p className="mt-2">Connecting families with dignity and respect.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}