import Link from 'next/link'
import { getAnalytics, AnalyticsStats } from '@/lib/api'

async function fetchStats(): Promise<AnalyticsStats | null> {
  try {
    return await getAnalytics()
  } catch {
    return null
  }
}

export default async function HomePage() {
  const stats = await fetchStats()

  const features = [
    {
      icon: '🛡',
      title: 'Verified Profiles',
      desc: 'Every profile is manually reviewed by our team within 24 hours to ensure authenticity and genuine matrimonial intent.',
    },
    {
      icon: '✦',
      title: 'AI Compatibility',
      desc: 'Our AI analyzes deep compatibility across values, lifestyle, education, sect, and family background to surface your best matches.',
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      desc: 'Names shown partially. Photos shared on request only. Full details exchanged through secure, family-guided proposal channels.',
    },
  ]

  const steps = [
    { n: '01', title: 'Register',      desc: 'Submit your family details. Our team reviews your profile within 24 hours.' },
    { n: '02', title: 'Get Verified',  desc: 'We build your private, verified profile with full privacy protections.' },
    { n: '03', title: 'Browse & Match', desc: 'Explore profiles yourself or let AI surface the most compatible candidates.' },
    { n: '04', title: 'Connect',       desc: 'Express interest — we facilitate respectful family introductions.' },
  ]

  return (
    <div className="pt-16">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&q=90&fit=crop&crop=center"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(105deg, oklch(18% 0.01 60 / 0.72) 0%, oklch(18% 0.01 60 / 0.35) 55%, transparent 100%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, var(--ivory) 0%, transparent 28%)' }} />
        </div>

        <div className="relative app-container py-24 pb-32">
          <div className="max-w-2xl animate-fade-up">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--rose-light)' }} />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/90">AI-Powered Muslim Matrimonial</span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.08] mb-5"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
              Find Your<br />
              <span className="italic" style={{ color: 'oklch(88% 0.1 65)' }}>Perfect</span>{' '}
              Life Partner
            </h1>

            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
              A premium matrimonial experience built on trust, privacy, and AI intelligence —
              designed for Muslim families who value tradition and authenticity.
            </p>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-2 mb-10">
              {['3,800+ Verified Families', 'AI Compatibility Scoring', 'Privacy Protected', 'Family-Guided'].map(t => (
                <span key={t} className="px-3 py-1.5 rounded-full text-xs font-medium text-white/88"
                  style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)' }}>
                  {t}
                </span>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link href="/match" className="btn-primary text-base px-7 py-3.5 rounded-xl">
                Start AI Match
              </Link>
              <Link href="/browse"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)' }}>
                Browse Profiles
              </Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-base"
          style={{ background: 'oklch(97% 0.012 65 / 0.96)', backdropFilter: 'blur(12px)' }}>
          <div className="app-container py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              [stats?.total_profiles ? `${stats.total_profiles.toLocaleString()}+` : '3,800+', 'Verified Profiles'],
              [stats?.male_count   ? `${stats.male_count.toLocaleString()}+`   : '1,500+', 'Grooms Listed'],
              [stats?.female_count ? `${stats.female_count.toLocaleString()}+` : '2,300+', 'Brides Listed'],
              [stats?.top_cities?.length ? `${stats.top_cities.length}+` : '100+',        'Cities Covered'],
            ].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="font-serif text-3xl font-bold" style={{ color: 'var(--rose)', lineHeight: 1 }}>{n}</div>
                <div className="text-xs text-muted mt-1 font-medium">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section-pad app-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="section-eyebrow">Why RishtaConnect</p>
          <h2 className="section-title">Built for Families Who Care</h2>
          <p className="text-muted text-base max-w-lg mx-auto leading-relaxed">
            We combine the reverence of tradition with the power of modern AI —
            so every introduction feels right.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="card-hover p-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-5"
                style={{ background: 'var(--rose-pale)' }}>
                {f.icon}
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Culture ── */}
      <section className="pb-24 app-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="section-eyebrow">Our Values</p>
          <h2 className="section-title">Shadi Culture &amp; Tradition</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Family Introductions', desc: 'Respectful first meetings guided by family values and mutual trust.', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80&fit=crop' },
            { title: 'Nikkah Traditions',    desc: 'Cultural and religious traditions honored with dignity and reverence.',  img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80&fit=crop' },
            { title: 'Celebration Moments',  desc: 'Meaningful celebrations that bring two families together in joy.',       img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80&fit=crop&crop=right' },
          ].map(c => (
            <div key={c.title} className="card overflow-hidden">
              <div className="h-52 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg font-semibold mb-2">{c.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="section-pad border-t border-b border-base" style={{ background: 'var(--cream)' }}>
        <div className="app-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="section-eyebrow">The Process</p>
            <h2 className="section-title">Four Steps to Your Match</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
            {steps.map((s, i) => (
              <div key={s.n} className="text-center relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[58%] right-[-42%] h-px"
                    style={{ background: 'linear-gradient(to right, var(--rose) / 0.3, transparent)' }} />
                )}
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 font-serif text-xl font-bold"
                  style={{ background: '#fff', border: '2px solid var(--rose)', color: 'var(--rose)', boxShadow: '0 4px 16px var(--rose-pale)' }}>
                  {s.n}
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-pad text-center">
        <div className="app-container max-w-2xl mx-auto px-4">
          <h2 className="section-title text-4xl md:text-5xl">
            Ready to Begin<br />
            <span className="italic" style={{ color: 'var(--rose)' }}>Your Journey?</span>
          </h2>
          <p className="text-muted text-base leading-relaxed mt-4 mb-10">
            Join thousands of families who found their perfect match through RishtaConnect.
            Private, dignified, and AI-powered.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup" className="btn-primary text-base px-8 py-3.5 rounded-xl">
              Create Your Profile
            </Link>
            <Link href="/browse" className="btn-ghost text-base px-7 py-3.5 rounded-xl">
              Browse Profiles
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
