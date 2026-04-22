'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'

const NAV_LINKS = [
  { href: '/browse',    label: 'Browse Profiles' },
  { href: '/match',     label: 'AI Match' },
  { href: '/proposals', label: 'My Proposals' },
  { href: '/insights',  label: 'Insights' },
]

const MOBILE_NAV = [
  { href: '/',          label: 'Home',      icon: HomeIcon },
  { href: '/browse',    label: 'Browse',    icon: SearchIcon },
  { href: '/match',     label: 'AI Match',  icon: SparkleIcon },
  { href: '/proposals', label: 'Proposals', icon: HeartIcon },
  { href: '/profile',   label: 'Profile',   icon: UserIcon },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      {/* ── Desktop / Top bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'oklch(97% 0.012 65 / 0.94)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--stone)' : '1px solid transparent',
        }}
      >
        <div className="app-container flex h-16 items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mr-4 shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-serif text-lg font-bold text-white"
              style={{ background: 'var(--rose)', boxShadow: '0 4px 12px oklch(55% 0.18 10 / 0.3)' }}
            >R</div>
            <span className="font-serif text-lg font-semibold tracking-tight hidden sm:block">
              RishtaConnect
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: active ? 'var(--rose-pale)' : 'transparent',
                    color: active ? 'var(--rose-dark)' : 'var(--slate)',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: 'var(--slate)' }}>
                    {user.full_name.split(' ')[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="btn-muted text-xs px-3 py-1.5 hidden md:inline-flex"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-muted text-sm px-4 py-2 hidden md:inline-flex">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary text-sm px-5 py-2 hidden md:inline-flex">
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-px transition-all ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`}
                style={{ background: 'var(--rose)' }} />
              <span className={`block w-4 h-px transition-all ${menuOpen ? 'opacity-0' : ''}`}
                style={{ background: 'var(--rose)' }} />
              <span className={`block w-5 h-px transition-all ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`}
                style={{ background: 'var(--rose)' }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{ borderTop: menuOpen ? '1px solid var(--stone)' : 'none', background: 'var(--ivory)' }}
        >
          <div className="px-5 py-4 space-y-1">
            {!user ? (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Link href="/login"  className="btn-muted text-sm w-full justify-center">Login</Link>
                <Link href="/signup" className="btn-primary text-sm w-full justify-center">Sign Up</Link>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-sm font-semibold">{user.full_name}</span>
                <button onClick={logout} className="text-xs btn-muted px-3 py-1.5">Sign out</button>
              </div>
            )}
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: pathname === href ? 'var(--rose-pale)' : 'transparent',
                  color: pathname === href ? 'var(--rose-dark)' : 'var(--slate)',
                }}
              >
                {label}
                {pathname === href && <span>→</span>}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          background: 'oklch(97% 0.012 65 / 0.96)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--stone)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
              style={{ color: active ? 'var(--rose)' : 'var(--mist)' }}
            >
              <Icon size={20} active={active} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

/* ── Inline SVG icons ── */
function HomeIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H14v-5h-4v5H4a1 1 0 01-1-1z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function SearchIcon({ size }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function SparkleIcon({ size }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.25-6.25-2.12 2.12M8.87 15.13l-2.12 2.12m0-14.25 2.12 2.12m5.26 5.26 2.12 2.12"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function HeartIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}
function UserIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
