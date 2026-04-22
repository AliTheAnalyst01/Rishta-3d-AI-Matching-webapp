'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/ui/AuthProvider'
import { getPersonalizedProposals, ProfileSummary } from '@/lib/api'
import { gDriveThumb } from '@/lib/gdrive'

export default function ProposalsPage() {
  const { user, token, loading: authLoading } = useAuth()
  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getPersonalizedProposals(0, 20)
      .then(d => { setProfiles(d.results); setTotal(d.total) })
      .catch(e => setError(e?.message ?? 'Failed to load proposals'))
      .finally(() => setLoading(false))
  }, [token])

  /* ── Not logged in ── */
  if (!authLoading && !user) return (
    <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'var(--cream)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--mist)' }}>
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="font-serif text-2xl">Sign in to view proposals</h2>
      <p className="text-muted text-sm max-w-xs">
        Create an account to receive personalised match suggestions and manage proposals.
      </p>
      <div className="flex gap-3 mt-2">
        <Link href="/login"  className="btn-muted px-6 py-2.5">Login</Link>
        <Link href="/signup" className="btn-primary px-6 py-2.5">Create Account</Link>
      </div>
    </div>
  )

  return (
    <div className="pt-20">
      <div className="app-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold mb-1">
            Personalised Suggestions
          </h1>
          <p className="text-muted text-sm">
            Profiles matched to your sect, city, and preferences —{' '}
            {loading ? 'loading…' : `${total} suggested`}
          </p>
        </div>

        {/* User preference summary */}
        {user && (
          <div className="card p-5 mb-8 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-1">
                Your Match Criteria
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="chip chip-stone">{user.gender === 'Male' ? 'Looking for Brides' : 'Looking for Grooms'}</span>
                {user.sect       && <span className="chip chip-rose">{user.sect}</span>}
                {user.city_country && <span className="chip chip-stone">{user.city_country.split(',')[0]}</span>}
                {user.demand_requirements && (
                  <span className="chip chip-stone truncate max-w-xs" title={user.demand_requirements}>
                    Has requirements
                  </span>
                )}
              </div>
            </div>
            <Link href="/match" className="btn-ghost text-sm px-5 py-2 shrink-0">
              Use AI Match Instead →
            </Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card p-5 mb-6 flex items-center gap-3"
            style={{ background: 'oklch(95% 0.04 15)', borderColor: 'oklch(87% 0.08 15)', color: 'oklch(38% 0.18 10)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="bg-stone" style={{ aspectRatio: '4/5' }} />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-stone rounded w-3/4" />
                  <div className="h-3 bg-stone rounded w-1/2" />
                  <div className="h-8 bg-stone rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile grid */}
        {!loading && profiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {profiles.map(p => (
              <ProposalCard key={p.id} profile={p} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && profiles.length === 0 && (
          <div className="py-24 text-center">
            <div className="text-5xl mb-4">💌</div>
            <h3 className="font-serif text-xl mb-2">No suggestions yet</h3>
            <p className="text-muted text-sm mb-6">
              Complete your profile to receive personalised match suggestions.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/match"  className="btn-primary px-6 py-2.5">Try AI Match</Link>
              <Link href="/browse" className="btn-ghost  px-6 py-2.5">Browse Profiles</Link>
            </div>
          </div>
        )}
      </div>
      <div className="h-16 md:h-0" />
    </div>
  )
}

/* ── Individual proposal card ── */
function ProposalCard({ profile }: { profile: ProfileSummary }) {
  const [status, setStatus] = useState<'idle'|'interested'|'passed'>('idle')
  const photoSrc = gDriveThumb(profile.photo_url, 400) ?? profile.photo_url
  const displayName = profile.name ? `${profile.name[0]}***` : 'Anonymous'

  return (
    <div className="card overflow-hidden">
      {/* Photo */}
      <Link href={`/profile/${profile.id}`}>
        <div className="relative overflow-hidden group" style={{ aspectRatio: '4/5', background: 'var(--cream)' }}>
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoSrc} alt="" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-serif text-6xl opacity-20" style={{ color: 'var(--mist)' }}>
              {profile.gender === 'Female' ? '♀' : '♂'}
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, oklch(18% 0.01 60 / 0.7), transparent 50%)' }} />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="font-serif text-base font-semibold text-white">{displayName}</p>
            <p className="text-xs text-white/75 mt-0.5">
              {[profile.age && `${profile.age} yrs`, profile.city].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      </Link>

      {/* Details */}
      <div className="p-4">
        {profile.education && (
          <p className="text-xs text-muted mb-1 truncate">{profile.education}</p>
        )}
        {profile.profession && (
          <p className="text-xs font-medium mb-3 truncate">{profile.profession}</p>
        )}

        {status === 'idle' && (
          <div className="flex gap-2">
            <button onClick={() => setStatus('interested')}
              className="flex-1 btn-primary text-xs py-2 justify-center">
              Interested
            </button>
            <button onClick={() => setStatus('passed')}
              className="flex-1 btn-muted text-xs py-2 justify-center">
              Pass
            </button>
          </div>
        )}
        {status === 'interested' && (
          <div className="text-xs font-semibold text-center py-2 rounded-xl"
            style={{ background: 'var(--green-pale)', color: 'oklch(36% 0.16 145)' }}>
            ✓ Proposal sent
          </div>
        )}
        {status === 'passed' && (
          <div className="text-xs text-center py-2 text-muted">Passed</div>
        )}
      </div>
    </div>
  )
}
