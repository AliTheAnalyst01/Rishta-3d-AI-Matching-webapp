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

export default function Navbar() {
  const pathname  = usePathname()
  const { user, logout } = useAuth()
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [isMobile,  setIsMobile]  = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href + '/'))

  /* ── Styles ── */
  const isHome = pathname === '/'

  const headerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    background: scrolled
      ? 'rgba(253,248,242,0.95)'
      : isHome
        ? 'transparent'
        : 'rgba(253,248,242,0.92)',
    backdropFilter: scrolled ? 'blur(12px)' : (isHome ? 'none' : 'blur(8px)'),
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    transition: 'all 0.3s ease',
  }

  const innerStyle: React.CSSProperties = {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginRight: 24,
    flexShrink: 0,
    textDecoration: 'none',
    color: 'inherit',
  }

  const logoBoxStyle: React.CSSProperties = {
    width: 36, height: 36,
    borderRadius: 10,
    background: 'var(--rose)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-serif), Playfair Display, Georgia, serif',
    fontSize: 18, fontWeight: 700, color: '#fff',
    boxShadow: '0 4px 12px rgba(196,43,43,0.3)',
    flexShrink: 0,
  }

  const logoTextStyle: React.CSSProperties = {
    fontFamily: 'var(--font-serif), Playfair Display, Georgia, serif',
    fontSize: 18, fontWeight: 600,
    color: (!scrolled && isHome) ? '#fff' : 'var(--text)',
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap',
  }

  const desktopNavStyle: React.CSSProperties = {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  }

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px',
    borderRadius: 10,
    fontSize: 13.5,
    fontWeight: active ? 600 : 500,
    color: active
      ? 'var(--rose-dark)'
      : (!scrolled && isHome)
        ? 'rgba(255,255,255,0.85)'
        : 'var(--text)',
    background: active ? 'var(--rose-pale)' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
    display: 'inline-block',
  })

  const rightActionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
    flexShrink: 0,
  }

  const loginBtnStyle: React.CSSProperties = {
    display: isMobile ? 'none' : 'inline-flex',
    alignItems: 'center',
    padding: '7px 18px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    color: (!scrolled && isHome) ? '#fff' : 'var(--text)',
    background: 'transparent',
    border: `1.5px solid ${(!scrolled && isHome) ? 'rgba(255,255,255,0.4)' : 'var(--border)'}`,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }

  const signupBtnStyle: React.CSSProperties = {
    display: isMobile ? 'none' : 'inline-flex',
    alignItems: 'center',
    padding: '7px 20px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    background: 'var(--rose)',
    border: 'none',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }

  const hamburgerStyle: React.CSSProperties = {
    display: isMobile ? 'flex' : 'none',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    width: 36, height: 36,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
  }

  const barStyle = (rotate: string, opacity: number, translateY: string): React.CSSProperties => ({
    display: 'block',
    width: 20, height: 2,
    background: scrolled ? 'var(--rose)' : (pathname === '/' ? '#fff' : 'var(--rose)'),
    borderRadius: 99,
    transition: 'all 0.25s',
    transform: `${translateY} ${rotate}`,
    opacity,
  })

  const mobileDropStyle: React.CSSProperties = {
    display: isMobile ? 'block' : 'none',
    overflow: 'hidden',
    maxHeight: menuOpen ? 400 : 0,
    opacity: menuOpen ? 1 : 0,
    transition: 'max-height 0.3s ease, opacity 0.25s ease',
    borderTop: menuOpen ? '1px solid var(--border)' : 'none',
    background: 'var(--ivory)',
  }

  /* ── Mobile bottom tab bar ── */
  const bottomTabStyle: React.CSSProperties = {
    display: isMobile ? 'flex' : 'none',
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    zIndex: 100,
    background: 'rgba(253,248,242,0.97)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--border)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  }

  const tabLinks = [
    { href: '/',          label: 'Home' },
    { href: '/browse',    label: 'Browse' },
    { href: '/match',     label: 'AI Match' },
    { href: '/proposals', label: 'Proposals' },
    { href: '/profile',   label: 'Profile' },
  ]

  return (
    <>
      <header style={headerStyle}>
        {/* ── Top bar ── */}
        <div style={innerStyle}>
          {/* Logo */}
          <Link href="/" style={logoStyle}>
            <div style={logoBoxStyle}>R</div>
            <span style={logoTextStyle}>RishtaConnect</span>
          </Link>

          {/* Desktop nav */}
          <nav style={desktopNavStyle}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={navLinkStyle(isActive(href))}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div style={rightActionsStyle}>
            {user ? (
              <>
                <span style={{ fontSize: 13, color: 'var(--slate)', display: isMobile ? 'none' : 'block' }}>
                  {user.full_name.split(' ')[0]}
                </span>
                <button onClick={logout} style={{ ...loginBtnStyle, display: isMobile ? 'none' : 'inline-flex' }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login"  style={loginBtnStyle}>Login</Link>
                <Link href="/signup" style={signupBtnStyle}>Get Started</Link>
              </>
            )}

            {/* Hamburger */}
            <button style={hamburgerStyle} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
              <span style={barStyle(menuOpen ? 'rotate(45deg)' : 'rotate(0)', 1, menuOpen ? 'translateY(7px)' : 'translateY(0)')} />
              <span style={barStyle('rotate(0)', menuOpen ? 0 : 1, 'translateY(0)')} />
              <span style={barStyle(menuOpen ? 'rotate(-45deg)' : 'rotate(0)', 1, menuOpen ? 'translateY(-7px)' : 'translateY(0)')} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div style={mobileDropStyle}>
          <div style={{ padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {!user ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <Link href="/login"  onClick={() => setMenuOpen(false)}
                  style={{ ...loginBtnStyle, display: 'flex', justifyContent: 'center' }}>Login</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)}
                  style={{ ...signupBtnStyle, display: 'flex', justifyContent: 'center' }}>Sign Up</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 4px' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user.full_name}</span>
                <button onClick={logout} style={{ ...loginBtnStyle, display: 'inline-flex', fontSize: 12 }}>Sign out</button>
              </div>
            )}
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                style={{
                  padding: '11px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                  color: isActive(href) ? 'var(--rose-dark)' : 'var(--slate)',
                  background: isActive(href) ? 'var(--rose-pale)' : 'transparent',
                  textDecoration: 'none', display: 'block',
                }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav style={bottomTabStyle}>
        {tabLinks.map(({ href, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3, padding: '6px 0',
                color: active ? 'var(--rose)' : 'var(--mist)',
                textDecoration: 'none',
              }}>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, marginTop: 2 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
