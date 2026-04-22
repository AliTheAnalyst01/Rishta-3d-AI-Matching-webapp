'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProfilePhoto from '@/components/ui/ProfilePhoto'
import { getMatchHealth, getMatchScores } from '@/lib/api'

interface MatchRequest {
  seeking_gender?: string
  min_age?: number
  max_age?: number
  sect?: string
  caste?: string
  city?: string
  education_level?: string
  profession?: string
  category?: string
}

const inputStyles = 'input'
const selectStyles = 'select-field'

export default function MatchPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [request, setRequest] = useState<MatchRequest>({})
  const [submitted, setSubmitted] = useState(false)
  const [candidatesConsidered, setCandidatesConsidered] = useState(0)
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    checkAiHealth()
  }, [])

  async function checkAiHealth() {
    try {
      const data = await getMatchHealth()
      setAiAvailable(data.status === 'healthy')
    } catch {
      setAiAvailable(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSubmitted(true)

    try {
      const data = await getMatchScores(request)
      setResults(data.matches || [])
      setCandidatesConsidered(data.candidates_considered || 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function set(field: keyof MatchRequest, val: any) {
    setRequest(r => ({ ...r, [field]: val || undefined }))
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="app-container py-8 md:py-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-gold/10 border border-gold/20 text-gold-500 text-sm">
            AI-Powered Matching
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-3 text-parchment">
            Find Your Perfect Match
          </h1>
          <p className="max-w-xl mx-auto text-base leading-relaxed text-sand/80">
            Tell us your preferences and our local AI will rank the most compatible profiles.
          </p>
          <p className="text-xs text-muted mt-3">Score is based on profile compatibility signals, not human chemistry.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setRequest({})
                setResults([])
                setSubmitted(false)
                setError(null)
              }}
              className="btn-secondary"
            >
              Reset Preferences
            </button>
            <Link href="/browse" className="btn-service">Browse Profiles</Link>
          </div>
          {aiAvailable === false && (
            <p className="mt-3 text-sm text-red-400">AI service is currently unavailable. Please check Ollama and try again.</p>
          )}
        </div>


        <div className="grid xl:grid-cols-[420px_1fr] gap-6 lg:gap-8 items-start">

          <div className="card rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-base">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gold/10 border border-gold/30">
                  <span className="text-xs font-semibold text-gold-500">AI</span>
                </div>
                <div>
                  <h2 className="font-serif font-semibold text-parchment">Your Preferences</h2>
                  <p className="text-xs text-muted">Set filters and generate ranked matches</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Primary Selection */}
              <div>
                <label className="block text-xs uppercase tracking-wider mb-3 text-muted">
                  I&apos;m Looking For
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => set('seeking_gender', request.seeking_gender === 'Male' ? undefined : 'Male')}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border ${request.seeking_gender === 'Male' ? 'bg-gold-400 text-void border-gold-400' : 'bg-panel border-base text-muted'}`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => set('seeking_gender', request.seeking_gender === 'Female' ? undefined : 'Female')}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border ${request.seeking_gender === 'Female' ? 'bg-gold-400 text-void border-gold-400' : 'bg-panel border-base text-muted'}`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Sect & Age Range */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2 text-muted">
                    Sect
                  </label>
                  <select value={request.sect || ''} onChange={e => set('sect', e.target.value)} className={selectStyles}>
                    <option value="">Any</option>
                    <option value="Shia">Shia</option>
                    <option value="Sunni">Sunni</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2 text-muted">
                    Category
                  </label>
                  <select value={request.category || ''} onChange={e => set('category', e.target.value)} className={selectStyles}>
                    <option value="">Any</option>
                    <option value="Syed">Syed</option>
                    <option value="Doctor">Doctor</option>
                    <option value="2ndMarriage">2nd Marriage</option>
                  </select>
                </div>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 text-muted">
                  Preferred Age Range
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={request.min_age || ''}
                    onChange={e => set('min_age', e.target.value ? Number(e.target.value) : undefined)}
                    min="18" max="80"
                    placeholder="Min Age"
                    className={inputStyles}
                  />
                  <input
                    type="number"
                    value={request.max_age || ''}
                    onChange={e => set('max_age', e.target.value ? Number(e.target.value) : undefined)}
                    min="18" max="80"
                    placeholder="Max Age"
                    className={inputStyles}
                  />
                </div>
              </div>

              {/* Location & Education */}
              {[
                { label: 'City Preference', field: 'city' as const, placeholder: 'e.g., Karachi, Lahore' },
                { label: 'Education Level', field: 'education_level' as const, placeholder: 'e.g., Doctor, Graduate, MBA' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs uppercase tracking-wider mb-2 text-muted">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={request[field] || ''}
                    onChange={e => set(field, e.target.value)}
                    placeholder={placeholder}
                    className={inputStyles}
                  />
                </div>
              ))}

              {/* Optional Caste */}
              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 text-muted">
                  Caste (Optional)
                </label>
                <input 
                  type="text" 
                  value={request.caste || ''} 
                  onChange={e => set('caste', e.target.value)} 
                  placeholder="e.g., Syed, Rajput"
                  className={inputStyles}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base mt-4"
              >
                {loading ? 'Finding matches...' : 'Find Best Matches'}
              </button>

              <p className="text-center text-xs text-muted">
                We&apos;ll analyze {candidatesConsidered || 'thousands of'} profiles to find your best matches
              </p>
            </form>
          </div>

          <div className="min-h-[400px]">
            {!submitted && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6 bg-gold/10 border border-gold/20">
                  <span className="text-sm uppercase tracking-wider text-gold-500">Ready</span>
                </div>
                <p className="font-serif text-2xl mb-2 text-muted">
                  Your matches await
                </p>
                <p className="text-sm max-w-sm text-muted">
                  Fill in your preferences and let our intelligent system find the most compatible profiles for you.
                </p>
              </div>
            )}

            {loading && submitted && results.length === 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gold/10">
                      <span className="animate-pulse text-xs text-gold-500">AI</span>
                    </div>
                    <p className="font-serif text-lg text-parchment">
                      Finding your matches...
                    </p>
                    <p className="text-sm mt-1 text-muted">
                      Analyzing compatibility scores
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="card p-6 rounded-2xl">
                <div className="flex items-start gap-3 mb-4">
                  <div>
                    <p className="font-serif font-semibold text-parchment">
                      {error.includes('No profiles') || error.includes('candidates')
                        ? 'Too few profiles match these filters'
                        : 'Something went wrong'}
                    </p>
                    <p className="text-sm mt-1 text-muted">
                      {error.includes('No profiles') || error.includes('candidates')
                        ? 'Try removing the age range or sect filter to expand the candidate pool.'
                        : error}
                    </p>
                  </div>
                </div>
                {(error.includes('No profiles') || error.includes('candidates')) && (
                  <div className="flex flex-wrap gap-2">
                    {['Remove age range', 'Try any sect', 'Try any gender'].map(tip => (
                      <span key={tip} className="trust-chip">
                        {tip}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!loading && results.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="font-serif text-lg text-parchment">
                      {results.length} Matches Found
                    </span>
                    <p className="text-xs mt-0.5 text-muted">
                      From {candidatesConsidered} profiles analyzed
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-600/10 border border-green-500/20">
                    <span className="text-xs font-medium text-green-400">AI Analysis Complete</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {results.map((match, i) => (
                    <MatchCard key={match.profile_id} match={match} rank={i + 1} />
                  ))}
                </div>
              </div>
            )}
            {loading && submitted && results.length > 0 && (
              <div className="mt-4">
                <span className="trust-chip animate-pulse">Refreshing match results...</span>
              </div>
            )}

            {!loading && submitted && results.length === 0 && !error && (
              <div className="text-center py-16 text-muted">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-gold/10 border border-gold/20">
                  <span className="text-xs uppercase tracking-wider text-gold-500">Empty</span>
                </div>
                <p className="font-serif text-xl mb-2 text-parchment">No matches found</p>
                <p className="text-sm mb-4">Try broadening your search criteria and run the match again.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match, rank }: { match: any; rank: number }) {
  const score = match.score ?? 0
  const scoreStyle =
    score >= 80
      ? { color: '#4ade80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', label: 'Excellent' }
      : score >= 60
      ? { color: '#d4a757', bg: 'rgba(212,167,87,0.1)', border: 'rgba(212,167,87,0.25)', label: 'Good' }
      : { color: 'rgba(200,150,100,0.8)', bg: 'rgba(180,100,40,0.08)', border: 'rgba(180,100,40,0.2)', label: 'Fair' }

  const profileDetails = [
    match.age && `${match.age}y`,
    match.city,
    match.education,
  ].filter(Boolean).join(' • ')

  return (
    <div className="group card block rounded-2xl p-5 transition-all hover:scale-[1.01]">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-20 h-24 rounded-xl overflow-hidden">
          <ProfilePhoto
            photoUrl={match.photo_url}
            name={match.name}
            gender={match.gender}
            className="w-full h-full"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-semibold text-base text-parchment">
                  {match.name || 'Profile #' + match.reg_no?.slice(-6) || 'Anonymous'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold-500">
                  #{rank}
                </span>
              </div>
              <p className="text-xs mt-1 text-muted">
                Reg: {match.reg_no || 'N/A'}
              </p>
              {profileDetails && (
                <p className="text-xs mt-1 text-muted">
                  {profileDetails}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div 
                className="shrink-0 w-12 h-14 rounded-lg flex flex-col items-center justify-center"
                style={{ background: scoreStyle.bg, border: `1px solid ${scoreStyle.border}` }}
              >
                <span className="text-lg font-bold font-serif" style={{ color: scoreStyle.color }}>
                  {score}
                </span>
                <span className="text-[7px] uppercase tracking-wider" style={{ color: scoreStyle.color }}>
                  {scoreStyle.label}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm mt-2 leading-relaxed text-muted">
            {match.reasoning || 'A compatible profile matching your preferences.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/profile/${match.profile_id}`} className="btn-primary">View Profile</Link>
            <Link href={`/profile/${match.profile_id}?intent=save`} className="btn-secondary">Save Match</Link>
            <Link href={`/profile/${match.profile_id}?intent=intro`} className="btn-service">Request Intro</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
