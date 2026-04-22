import Link from 'next/link'
import { getAnalytics, AnalyticsStats } from '@/lib/api'

async function fetchStats(): Promise<AnalyticsStats | null> {
  try { return await getAnalytics() } catch { return null }
}

export default async function HomePage() {
  const stats = await fetchStats()

  const features = [
    { icon: '🛡', title: 'Verified Profiles', desc: 'Every profile is manually reviewed by our team within 24 hours to ensure authenticity and genuine matrimonial intent.' },
    { icon: '✦', title: 'AI Compatibility',  desc: 'Our AI analyzes deep compatibility across values, lifestyle, education, sect, and family background to surface your best matches.' },
    { icon: '🔒', title: 'Privacy First',     desc: 'Names shown partially. Photos shared on request only. Full details exchanged through secure, family-guided proposal channels.' },
  ]

  const steps = [
    { n: '01', title: 'Register',       desc: 'Submit your family details. Our team reviews your profile within 24 hours.' },
    { n: '02', title: 'Get Verified',   desc: 'We build your private, verified profile with full privacy protections.' },
    { n: '03', title: 'Browse & Match', desc: 'Explore profiles yourself or let AI surface the most compatible candidates.' },
    { n: '04', title: 'Connect',        desc: 'Express interest — we facilitate respectful family introductions.' },
  ]

  const culture = [
    { title: 'Family Introductions', desc: 'Respectful first meetings guided by family values and mutual trust.',    img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80&fit=crop' },
    { title: 'Nikkah Traditions',    desc: 'Cultural and religious traditions honored with dignity and reverence.',  img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80&fit=crop' },
    { title: 'Celebration Moments',  desc: 'Meaningful celebrations that bring two families together in joy.',      img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80&fit=crop&crop=right' },
  ]

  /* ── inline styles (resilient to Tailwind build issues) ── */
  const S = {
    heroSection: {
      position: 'relative' as const,
      minHeight: '92vh',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      width: '100%',
    },
    heroBg: {
      position: 'absolute' as const,
      inset: 0,
      width: '100%',
      height: '100%',
    },
    heroImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      objectPosition: 'center top',
      display: 'block',
    },
    heroOverlay1: {
      position: 'absolute' as const,
      inset: 0,
      background: 'linear-gradient(105deg, rgba(30,20,15,0.75) 0%, rgba(30,20,15,0.38) 55%, transparent 100%)',
    },
    heroOverlay2: {
      position: 'absolute' as const,
      inset: 0,
      background: 'linear-gradient(to top, var(--ivory) 0%, transparent 28%)',
    },
    heroContent: {
      position: 'relative' as const,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
      padding: '100px 32px 140px',
    },
    heroInner: {
      maxWidth: 640,
    },
    eyebrow: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 18px',
      borderRadius: 99,
      marginBottom: 28,
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.25)',
    },
    eyebrowDot: {
      width: 6, height: 6, borderRadius: '50%',
      background: 'var(--rose-light)',
      flexShrink: 0,
    },
    eyebrowText: {
      fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.92)',
    },
    h1: {
      fontFamily: 'var(--font-serif), Playfair Display, Georgia, serif',
      fontSize: 'clamp(36px, 5.5vw, 68px)',
      fontWeight: 600,
      color: '#ffffff',
      lineHeight: 1.08,
      marginBottom: 20,
      textShadow: '0 2px 20px rgba(0,0,0,0.25)',
      letterSpacing: '-0.025em',
    },
    h1Italic: { fontStyle: 'italic', color: 'oklch(88% 0.1 65)' } as React.CSSProperties,
    heroP: {
      fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.82)',
      marginBottom: 28, maxWidth: 500,
    },
    trustRow: { display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 36 },
    trustChip: {
      padding: '5px 14px', borderRadius: 99, fontSize: 12.5,
      fontWeight: 500, color: 'rgba(255,255,255,0.9)',
      background: 'rgba(255,255,255,0.13)',
      border: '1px solid rgba(255,255,255,0.22)',
      backdropFilter: 'blur(6px)',
    },
    ctaRow: { display: 'flex', gap: 14, flexWrap: 'wrap' as const },
    btnPrimaryLg: {
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '14px 36px', borderRadius: 14,
      background: 'var(--rose)', color: '#fff',
      fontWeight: 600, fontSize: 16, border: 'none',
      cursor: 'pointer', textDecoration: 'none',
      transition: 'all 0.2s', letterSpacing: '0.01em',
    },
    btnGhostLg: {
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '14px 30px', borderRadius: 14,
      background: 'rgba(255,255,255,0.12)',
      border: '1.5px solid rgba(255,255,255,0.38)',
      color: '#fff', fontWeight: 500, fontSize: 16,
      cursor: 'pointer', textDecoration: 'none',
      backdropFilter: 'blur(8px)', transition: 'all 0.2s',
    },
    statsStrip: {
      position: 'absolute' as const, bottom: 0, left: 0, right: 0,
      background: 'rgba(253,248,242,0.97)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border)',
      padding: '18px 32px',
    },
    statsGrid: {
      maxWidth: 1280, margin: '0 auto',
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
    },
    statItem: { textAlign: 'center' as const },
    statNum: {
      fontFamily: 'var(--font-serif), Playfair Display, Georgia, serif',
      fontSize: 30, fontWeight: 700, color: 'var(--rose)', lineHeight: 1,
    },
    statLabel: { fontSize: 12, color: 'var(--mist)', marginTop: 4, fontWeight: 500 },

    section: { width: '100%', padding: '80px 32px' },
    sectionInner: { maxWidth: 1280, margin: '0 auto' },
    sectionHeader: { textAlign: 'center' as const, marginBottom: 56 },
    sectionTitle: {
      fontFamily: 'var(--font-serif), Playfair Display, Georgia, serif',
      fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 600,
      color: 'var(--text)', letterSpacing: '-0.025em', marginBottom: 14,
    },
    sectionP: { color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' },
    eyebrowSm: {
      fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase' as const, color: 'var(--rose)', marginBottom: 12, display: 'block',
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 24,
    },
    grid4: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 40,
    },
    featureCard: {
      background: '#fff', borderRadius: 16,
      padding: 32, border: '1.5px solid var(--border)',
      boxShadow: '0 4px 20px rgba(42,37,32,0.07)',
      transition: 'all 0.3s',
    },
    featureIcon: {
      width: 52, height: 52, borderRadius: 14,
      background: 'var(--rose-pale)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 22, marginBottom: 20,
    },
    featureTitle: {
      fontFamily: 'var(--font-serif), Playfair Display, Georgia, serif',
      fontSize: 20, fontWeight: 600, marginBottom: 10, color: 'var(--text)',
    },
    featureP: { fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.75 },
    cultureCard: {
      borderRadius: 16, overflow: 'hidden',
      border: '1.5px solid var(--border)', background: '#fff',
      boxShadow: '0 4px 20px rgba(42,37,32,0.07)',
    },
    cultureImg: { width: '100%', height: 220, objectFit: 'cover' as const, display: 'block' },
    cultureBody: { padding: '20px 24px 24px' },
    cultureTitle: {
      fontFamily: 'var(--font-serif), Playfair Display, Georgia, serif',
      fontSize: 18, marginBottom: 8, color: 'var(--text)',
    },
    cultureP: { fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.75 },
    stepsSection: {
      background: 'var(--bg-muted)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: '80px 32px',
    },
    stepItem: { textAlign: 'center' as const },
    stepCircle: {
      width: 64, height: 64, borderRadius: '50%',
      background: '#fff', border: '2px solid var(--rose)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 20px',
      fontFamily: 'var(--font-serif), Playfair Display, Georgia, serif',
      fontSize: 20, fontWeight: 700, color: 'var(--rose)',
      boxShadow: '0 4px 16px rgba(196,43,43,0.15)',
    },
    stepTitle: {
      fontFamily: 'var(--font-serif), Playfair Display, Georgia, serif',
      fontSize: 17, fontWeight: 600, marginBottom: 10, color: 'var(--text)',
    },
    stepP: { fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.7 },
    ctaSection: { padding: '80px 32px', textAlign: 'center' as const },
    ctaH2: {
      fontFamily: 'var(--font-serif), Playfair Display, Georgia, serif',
      fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600,
      color: 'var(--text)', letterSpacing: '-0.025em', marginBottom: 16,
    },
    ctaItalic: { fontStyle: 'italic', color: 'var(--rose)' },
    ctaP: { color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7, marginBottom: 36 },
    ctaBtns: { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' as const },
    btnRose: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '14px 36px', borderRadius: 14,
      background: 'var(--rose)', color: '#fff',
      fontWeight: 600, fontSize: 16, textDecoration: 'none',
      border: 'none', cursor: 'pointer', transition: 'all 0.2s',
      fontFamily: 'inherit',
    },
    btnOutline: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '14px 30px', borderRadius: 14,
      background: 'transparent', color: 'var(--rose)',
      fontWeight: 500, fontSize: 16, textDecoration: 'none',
      border: '1.5px solid var(--rose)', cursor: 'pointer', transition: 'all 0.2s',
      fontFamily: 'inherit',
    },
  }

  return (
    <div style={{ paddingTop: 64 }}>

      {/* ── Hero ── */}
      <section style={S.heroSection}>
        <div style={S.heroBg}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&q=90&fit=crop&crop=center"
            alt="" style={S.heroImg}
          />
          <div style={S.heroOverlay1} />
          <div style={S.heroOverlay2} />
        </div>

        <div style={S.heroContent}>
          <div style={S.heroInner}>
            <div style={S.eyebrow}>
              <span style={S.eyebrowDot} />
              <span style={S.eyebrowText}>AI-Powered Muslim Matrimonial</span>
            </div>

            <h1 style={S.h1}>
              Find Your<br />
              <span style={{ fontStyle: 'italic', color: '#e8d090' }}>Perfect</span>{' '}
              Life Partner
            </h1>

            <p style={S.heroP}>
              A premium matrimonial experience built on trust, privacy, and AI intelligence —
              designed for Muslim families who value tradition and authenticity.
            </p>

            <div style={S.trustRow}>
              {['3,800+ Verified Families', 'AI Compatibility Scoring', 'Privacy Protected', 'Family-Guided'].map(t => (
                <span key={t} style={S.trustChip}>{t}</span>
              ))}
            </div>

            <div style={S.ctaRow}>
              <Link href="/match" style={S.btnPrimaryLg}>Start AI Match</Link>
              <Link href="/browse" style={S.btnGhostLg}>Browse Profiles</Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={S.statsStrip}>
          <div style={S.statsGrid}>
            {[
              [stats?.total_profiles ? `${stats.total_profiles.toLocaleString()}+` : '3,800+', 'Verified Profiles'],
              [stats?.male_count   ? `${stats.male_count.toLocaleString()}+`   : '1,500+', 'Grooms Listed'],
              [stats?.female_count ? `${stats.female_count.toLocaleString()}+` : '2,300+', 'Brides Listed'],
              [stats?.top_cities?.length ? `${stats.top_cities.length}+` : '100+', 'Cities Covered'],
            ].map(([n, l]) => (
              <div key={l} style={S.statItem}>
                <div style={S.statNum}>{n}</div>
                <div style={S.statLabel}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={S.section}>
        <div style={S.sectionInner}>
          <div style={S.sectionHeader}>
            <span style={S.eyebrowSm}>Why RishtaConnect</span>
            <h2 style={S.sectionTitle}>Built for Families Who Care</h2>
            <p style={S.sectionP}>
              We combine the reverence of tradition with the power of modern AI —
              so every introduction feels right.
            </p>
          </div>
          <div style={S.grid3}>
            {features.map(f => (
              <div key={f.title} style={S.featureCard}>
                <div style={S.featureIcon}>{f.icon}</div>
                <h3 style={S.featureTitle}>{f.title}</h3>
                <p style={S.featureP}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Culture ── */}
      <section style={{ ...S.section, paddingTop: 0 }}>
        <div style={S.sectionInner}>
          <div style={S.sectionHeader}>
            <span style={S.eyebrowSm}>Our Values</span>
            <h2 style={S.sectionTitle}>Shadi Culture &amp; Tradition</h2>
          </div>
          <div style={S.grid3}>
            {culture.map(c => (
              <div key={c.title} style={S.cultureCard}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.title} style={S.cultureImg} />
                <div style={S.cultureBody}>
                  <h3 style={S.cultureTitle}>{c.title}</h3>
                  <p style={S.cultureP}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section style={S.stepsSection}>
        <div style={S.sectionInner}>
          <div style={S.sectionHeader}>
            <span style={S.eyebrowSm}>The Process</span>
            <h2 style={S.sectionTitle}>Four Steps to Your Match</h2>
          </div>
          <div style={S.grid4}>
            {steps.map(s => (
              <div key={s.n} style={S.stepItem}>
                <div style={S.stepCircle}>{s.n}</div>
                <h3 style={S.stepTitle}>{s.title}</h3>
                <p style={S.stepP}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={S.ctaSection}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={S.ctaH2}>
            Ready to Begin<br />
            <span style={S.ctaItalic}>Your Journey?</span>
          </h2>
          <p style={S.ctaP}>
            Join thousands of families who found their perfect match through RishtaConnect.
            Private, dignified, and AI-powered.
          </p>
          <div style={S.ctaBtns}>
            <Link href="/signup" style={S.btnRose}>Create Your Profile</Link>
            <Link href="/browse" style={S.btnOutline}>Browse Profiles</Link>
          </div>
        </div>
      </section>

    </div>
  )
}

// React import needed for CSSProperties type
import type React from 'react'
