'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProfileCard from '@/components/ui/ProfileCard'
import { getMatchScores, MatchResult, ProfileSummary } from '@/lib/api'

type Step = {
  key: keyof MatchRequest
  label: string
  options: string[]
}

interface MatchRequest {
  lookingFor: string
  minAge: string
  maxAge: string
  sect: string
  city: string
  education: string
  values: string
}

const STEPS: Step[] = [
  { key: 'lookingFor', label: 'I am looking for a…',         options: ['Bride (Female)', 'Groom (Male)'] },
  { key: 'minAge',     label: 'Minimum age preference',      options: ['20','22','24','26','28','30','32'] },
  { key: 'maxAge',     label: 'Maximum age preference',      options: ['25','28','30','32','35','38','40'] },
  { key: 'sect',       label: 'Preferred sect',              options: ['Any Sect', 'Sunni', 'Shia'] },
  { key: 'city',       label: 'Preferred city',              options: ['Any City','Lahore','Karachi','Islamabad','Rawalpindi','Peshawar','Dubai','London'] },
  { key: 'education',  label: 'Minimum education level',     options: ['Any','Bachelor\'s Degree','Master\'s Degree','Medical Degree (MBBS/BDS)','PhD / Doctorate'] },
  { key: 'values',     label: 'Most important value in a partner', options: ['Strong Faith & Deen','Family Orientation','Career & Ambition','Education Level','Personality Compatibility'] },
]

function toMatchPayload(a: Partial<MatchRequest>) {
  const educMap: Record<string, string> = {
    "Bachelor's Degree": 'bachelor',
    "Master's Degree":   'master',
    "Medical Degree (MBBS/BDS)": 'MBBS',
    "PhD / Doctorate":   'PhD',
  }
  return {
    seeking_gender: a.lookingFor?.includes('Bride') ? 'Female' : 'Male',
    min_age:  a.minAge  ? Number(a.minAge)  : undefined,
    max_age:  a.maxAge  ? Number(a.maxAge)  : undefined,
    sect:     a.sect && a.sect !== 'Any Sect' ? a.sect : undefined,
    city:     a.city && a.city !== 'Any City' ? a.city : undefined,
    education_level: a.education && a.education !== 'Any' ? educMap[a.education] ?? a.education : undefined,
  }
}

// Convert MatchResult → ProfileSummary shape for ProfileCard
function toSummary(m: MatchResult): ProfileSummary {
  return {
    id:         m.profile_id,
    reg_no:     m.reg_no ?? '',
    name:       m.name,
    gender:     m.gender,
    sect:       m.sect,
    age:        m.age,
    city:       m.city,
    education:  m.education,
    profession: m.profession,
    income:     m.income,
    category:   m.category,
    photo_url:  m.photo_url,
  }
}

export default function MatchPage() {
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState<Partial<MatchRequest>>({})
  const [status, setStatus]   = useState<'idle'|'loading'|'results'|'error'>('idle')
  const [results, setResults] = useState<MatchResult[]>([])
  const [considered, setConsidered] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAnswer = async (key: keyof MatchRequest, val: string) => {
    const next = { ...answers, [key]: val }
    setAnswers(next)

    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 300)
    } else {
      // Last step — run match
      setStatus('loading')
      try {
        const payload = toMatchPayload(next)
        const data = await getMatchScores(payload)
        setResults(data.matches)
        setConsidered(data.candidates_considered)
        setStatus('results')
      } catch (e: any) {
        setErrorMsg(e?.message ?? 'AI matching failed. Please try again.')
        setStatus('error')
      }
    }
  }

  const reset = () => {
    setStep(0); setAnswers({}); setStatus('idle'); setResults([]); setErrorMsg('')
  }

  /* ── Loading ── */
  if (status === 'loading') return (
    <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <div className="w-16 h-16 rounded-full border-[3px] animate-spin-slow"
        style={{ borderColor: 'var(--stone)', borderTopColor: 'var(--rose)' }} />
      <div className="text-center">
        <h2 className="font-serif text-2xl mb-2">Analyzing Compatibility…</h2>
        <p className="text-muted text-sm">Our AI is finding your best matches based on your preferences</p>
      </div>
    </div>
  )

  /* ── Error ── */
  if (status === 'error') return (
    <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-5xl">⚠️</div>
      <h2 className="font-serif text-2xl">Match Unavailable</h2>
      <p className="text-muted text-sm max-w-sm">{errorMsg}</p>
      <button className="btn-primary px-8 py-3" onClick={reset}>Try Again</button>
    </div>
  )

  /* ── Results ── */
  if (status === 'results') return (
    <div className="pt-20">
      <div className="app-container py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 chip chip-rose text-sm">
            ✦ AI Match Complete
          </div>
          <h1 className="font-serif text-3xl md:text-4xl mb-2">Your Top Matches</h1>
          <p className="text-muted text-sm">
            Found {results.length} compatible profiles from {considered} candidates considered
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
          {results.map((m, i) => (
            <div key={m.profile_id} className="relative">
              {i === 0 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 btn-primary text-xs px-3 py-1 rounded-full whitespace-nowrap">
                  Best Match
                </div>
              )}
              <ProfileCard
                profile={toSummary(m)}
                rationale={m.reasoning ?? undefined}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="btn-ghost px-8 py-3" onClick={reset}>Start New Search</button>
        </div>
      </div>
      <div className="h-16 md:h-0" />
    </div>
  )

  /* ── Question ── */
  const q = STEPS[step]
  const progress = (step / STEPS.length) * 100

  return (
    <div className="pt-16 min-h-screen flex flex-col items-center justify-center px-4 py-24">
      {/* Progress */}
      <div className="w-full max-w-lg mb-10">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-muted font-medium">Step {step + 1} of {STEPS.length}</span>
          <span className="text-xs text-muted">AI Match Setup</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--stone)' }}>
          <div className="h-full rounded-full transition-all duration-400"
            style={{ width: `${progress}%`, background: 'var(--rose)' }} />
        </div>
      </div>

      {/* Question card */}
      <div className="w-full max-w-lg text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--rose-pale)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ color: 'var(--rose)' }}>
            <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.25-6.25-2.12 2.12M8.87 15.13l-2.12 2.12m0-14.25 2.12 2.12m5.26 5.26 2.12 2.12" />
          </svg>
        </div>

        <h2 className="font-serif text-2xl md:text-3xl mb-8">{q.label}</h2>

        <div className="flex flex-col gap-3">
          {q.options.map(opt => {
            const selected = answers[q.key] === opt
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(q.key, opt)}
                className="flex items-center justify-between px-5 py-4 rounded-xl text-left text-sm font-medium transition-all"
                style={{
                  background: selected ? 'var(--rose-pale)' : '#fff',
                  border: selected ? '2px solid var(--rose)' : '1.5px solid var(--stone)',
                  color: selected ? 'var(--rose-dark)' : 'var(--charcoal)',
                  fontWeight: selected ? 600 : 400,
                  boxShadow: selected ? '0 2px 12px oklch(55% 0.18 10 / 0.12)' : 'none',
                }}
              >
                {opt}
                {selected && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="mt-6 text-sm text-muted hover:text-charcoal transition-colors">
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
