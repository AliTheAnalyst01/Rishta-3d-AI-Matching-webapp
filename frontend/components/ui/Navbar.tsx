'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/browse', label: 'Browse Profiles' },
  { href: '/match', label: 'AI Match' },
  { href: '/proposals', label: 'My Proposals' },
  { href: '/insights', label: 'Insights' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState<boolean | null>(null)

  useEffect(() => {
    const shouldUseDark = document.documentElement.classList.contains('dark')
    setDarkMode(shouldUseDark)
  }, [])
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const toggleTheme = () => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-base bg-panel/95 backdrop-blur">
      <div className="app-container flex h-16 items-center gap-4">
        <Link href="/" className="mr-2 flex items-center gap-2 sm:mr-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400 text-void font-serif text-lg">R</div>
          <span className="font-serif text-lg">RishtaConnect</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = !!pathname && (pathname === href || pathname.startsWith(href + '/'))
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${active ? 'bg-gold-400/15 text-gold-500' : 'text-muted hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          <button onClick={toggleTheme} className="btn-secondary hidden md:inline-flex px-3 py-2">{darkMode ? 'Light' : 'Dark'}</button>
          <Link href="/login" className="hidden md:flex btn-secondary text-sm px-4 py-2 rounded-xl">Login</Link>
          <Link href="/signup" className="hidden md:flex btn-primary text-sm px-5 py-2 rounded-xl">Signup</Link>

          <button
            className="md:hidden relative w-9 h-9 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-px bg-gold-400 transition-all ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block w-4 h-px bg-gold-400 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-gold-400 transition-all ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-base bg-panel px-5 pb-5 pt-3 space-y-2">
          <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-primary w-full">
            Signup
          </Link>
          {NAV_LINKS.map(({ href, label }) => {
            const active = !!pathname && pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${active ? 'bg-gold-400/15 text-gold-500' : 'text-muted'}`}
              >
                {label}
                {active && <span>→</span>}
              </Link>
            )
          })}
          <div className="border-t border-base pt-3 mt-2 grid grid-cols-2 gap-2">
            <button onClick={toggleTheme} className="btn-secondary w-full py-2">{darkMode ? 'Light' : 'Dark'}</button>
            <Link href="/browse" onClick={() => setMenuOpen(false)} className="btn-service w-full">Browse</Link>
          </div>
        </div>
      </div>
    </header>
  )
}
