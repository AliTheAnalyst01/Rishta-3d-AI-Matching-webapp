'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getAnalytics, AnalyticsStats } from '@/lib/api'

export default function HomePage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const shadiCultureImages = [
    {
      title: 'Family Introductions',
      desc: 'Respectful first meetings guided by family values and trust.',
      src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Nikkah Traditions',
      desc: 'Cultural and religious traditions honored with dignity.',
      src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Celebration Moments',
      desc: 'Meaningful celebrations that bring two families together.',
      src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
    },
  ]

  useEffect(() => {
    getAnalytics()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative section-pad">
        <div className="app-container max-w-4xl text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold-500 text-sm mb-8">
            Modern Intelligence for Matchmaking
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-parchment mb-6 leading-tight">
            Intelligent Guidance to Find Your <span className="text-gold-400">Right</span> Match
          </h1>
          
          <p className="text-lg md:text-xl text-sand/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            A premium Muslim matrimonial experience designed for clarity, privacy, and family confidence.
            Start with browsing or let AI shortlist compatible profiles in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <span className="trust-chip">3,800+ verified families</span>
            <span className="trust-chip">Profile moderation in 24h</span>
            <span className="trust-chip">Private details protected</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/match" className="btn-primary text-base sm:text-lg px-8 py-4">
              Start AI Match
            </Link>
            <Link href="/browse" className="btn-service text-base sm:text-lg px-8 py-4">
              Browse Profiles
            </Link>
          </div>
          <p className="text-sm text-muted mt-3">Choose AI Match if you want guided recommendations. Choose Browse if you already know your preferences.</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-gold/10">
            {loading ? (
              <>
                {[1,2,3,4].map(i => (
                  <div key={i} className="animate-pulse bg-gold/5 h-20 rounded-xl"></div>
                ))}
              </>
            ) : stats ? (
              <>
                <div className="text-center">
                  <div className="text-3xl font-serif font-semibold text-gold-400">{stats.total_profiles.toLocaleString()}+</div>
                  <div className="text-sm text-mist mt-1">Verified Profiles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif font-semibold text-gold-400">{stats.male_count}</div>
                  <div className="text-sm text-mist mt-1">Grooms</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif font-semibold text-gold-400">{stats.female_count}</div>
                  <div className="text-sm text-mist mt-1">Brides</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif font-semibold text-gold-400">{stats.top_cities.length}+</div>
                  <div className="text-sm text-mist mt-1">Cities</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-3xl font-serif font-semibold text-gold-400">3,800+</div>
                  <div className="text-sm text-mist mt-1">Verified Profiles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif font-semibold text-gold-400">1,500+</div>
                  <div className="text-sm text-mist mt-1">Grooms</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif font-semibold text-gold-400">2,300+</div>
                  <div className="text-sm text-mist mt-1">Brides</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif font-semibold text-gold-400">100+</div>
                  <div className="text-sm text-mist mt-1">Cities</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Shadi Culture Visual Section */}
      <section className="section-pad">
        <div className="app-container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="section-title">Shadi Culture & Values</h2>
            <p className="text-sand/70 max-w-2xl mx-auto">
              Built for families who value tradition, respect, and authentic introductions.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {shadiCultureImages.map((item) => (
              <article key={item.title} className="card overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.title}
                  width={1200}
                  height={520}
                  className="w-full h-52 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-lg font-serif font-semibold text-parchment mb-2">{item.title}</h3>
                  <p className="text-sm text-sand/70 leading-relaxed">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-pad bg-panel/50">
        <div className="app-container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="section-title">
              Why Choose RishtaConnect
            </h2>
            <p className="text-sand/70 max-w-2xl mx-auto">
              We understand the importance of finding the right life partner. Our platform combines 
              traditional values with modern technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-8">
              <h3 className="text-xl font-serif font-semibold text-parchment mb-3">Verified Profiles</h3>
              <p className="text-sand/70 leading-relaxed">
                Every profile is manually verified by our team. We ensure authenticity and genuine 
                matrimonial intent.
              </p>
            </div>

            <div className="card p-8">
              <h3 className="text-xl font-serif font-semibold text-parchment mb-3">AI-Powered Matching</h3>
              <p className="text-sand/70 leading-relaxed">
                Our local AI analyzes compatibility based on education, values, sect, family background, 
                and life goals — all processed on your device.
              </p>
            </div>

            <div className="card p-8">
              <h3 className="text-xl font-serif font-semibold text-parchment mb-3">Privacy Protected</h3>
              <p className="text-sand/70 leading-relaxed">
                Your privacy matters. Names are shown partially, photos shared on request only. 
                Full details shared through secure proposal channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-pad">
        <div className="app-container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="section-title">
              How It Works
            </h2>
            <p className="text-sand/70">Simple steps to find your perfect match</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Submit your profile details and our team reviews them within 24 hours.' },
              { step: '02', title: 'Get Verified', desc: 'We create your verified profile with all details while protecting your privacy.' },
              { step: '03', title: 'Browse & Match', desc: 'Browse profiles or let our AI find the most compatible candidates for you.' },
              { step: '04', title: 'Connect', desc: 'Express interest from profile pages. We facilitate introductions with families.' },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] right-[-40%] h-px bg-gradient-to-r from-gold/30 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-full bg-surface border border-gold/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-serif text-gold-400">{item.step}</span>
                </div>
                <h3 className="text-lg font-serif font-semibold text-parchment mb-2">{item.title}</h3>
                <p className="text-sm text-sand/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-pad">
        <div className="app-container max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-parchment mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-sand/70 mb-8 text-lg">
            Join thousands of families who found their perfect match through RishtaConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/match" className="btn-primary text-base sm:text-lg px-8 py-4">
              Start AI Match
            </Link>
            <Link href="/browse" className="btn-service text-base sm:text-lg px-8 py-4">
              Browse Profiles
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}