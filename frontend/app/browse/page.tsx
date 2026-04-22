'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProfileCard from '@/components/ui/ProfileCard'
import { getProfiles, getProfileCount, ProfileSummary, ProfileFilters } from '@/lib/api'

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [profiles, setProfiles]     = useState<ProfileSummary[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(0)
  const LIMIT = 24

  // Filters from URL
  const [gender,   setGender]   = useState(searchParams.get('gender')   ?? '')
  const [sect,     setSect]     = useState(searchParams.get('sect')     ?? '')
  const [city,     setCity]     = useState(searchParams.get('city')     ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [minAge,   setMinAge]   = useState(searchParams.get('min_age')  ?? '')
  const [maxAge,   setMaxAge]   = useState(searchParams.get('max_age')  ?? '')
  const [search,   setSearch]   = useState(searchParams.get('search')   ?? '')

  const buildFilters = useCallback((): ProfileFilters => ({
    gender:   gender   || undefined,
    sect:     sect     || undefined,
    city:     city     || undefined,
    category: category || undefined,
    min_age:  minAge   ? Number(minAge)   : undefined,
    max_age:  maxAge   ? Number(maxAge)   : undefined,
    search:   search   || undefined,
  }), [gender, sect, city, category, minAge, maxAge, search])

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const filters = buildFilters()
      const [data, count] = await Promise.all([
        getProfiles(filters, p, LIMIT),
        p === 0 ? getProfileCount(filters) : Promise.resolve(total),
      ])
      if (p === 0) {
        setProfiles(data)
        setTotal(count as number)
      } else {
        setProfiles(prev => [...prev, ...data])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildFilters])

  useEffect(() => {
    setPage(0)
    load(0)
  }, [gender, sect, city, category, minAge, maxAge, search, load])

  const inputCls = 'input text-sm py-2 min-w-0'
  const selectCls = 'select-field text-sm py-2 min-w-0'

  return (
    <div className="pt-16">
      {/* ── Filter bar ── */}
      <div className="sticky top-16 z-40 border-b border-base"
        style={{ background: 'oklch(93% 0.018 65 / 0.96)', backdropFilter: 'blur(12px)' }}>
        <div className="app-container py-4">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="15" height="15"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                className={inputCls + ' pl-9'}
                placeholder="Profession, city…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select className={selectCls + ' w-auto'} value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">All Genders</option>
              <option value="Female">Brides</option>
              <option value="Male">Grooms</option>
            </select>

            <select className={selectCls + ' w-auto'} value={sect} onChange={e => setSect(e.target.value)}>
              <option value="">All Sects</option>
              <option value="Sunni">Sunni</option>
              <option value="Shia">Shia</option>
            </select>

            <select className={selectCls + ' w-auto'} value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All Cities</option>
              {['Lahore','Karachi','Islamabad','Rawalpindi','Peshawar','Multan','Faisalabad','Dubai','London','Toronto'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select className={selectCls + ' w-auto'} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Premium">Premium</option>
              <option value="Elite">Elite</option>
              <option value="Syed">Syed</option>
              <option value="Doctor">Doctor</option>
            </select>

            <div className="flex gap-1 items-center">
              <input className={inputCls + ' w-20 text-center'} placeholder="Min age"
                type="number" min={18} max={70} value={minAge} onChange={e => setMinAge(e.target.value)} />
              <span className="text-muted text-sm">–</span>
              <input className={inputCls + ' w-20 text-center'} placeholder="Max age"
                type="number" min={18} max={70} value={maxAge} onChange={e => setMaxAge(e.target.value)} />
            </div>

            {(gender || sect || city || category || minAge || maxAge || search) && (
              <button className="btn-muted text-xs px-3 py-2" onClick={() => {
                setGender(''); setSect(''); setCity(''); setCategory('')
                setMinAge(''); setMaxAge(''); setSearch('')
              }}>
                Clear
              </button>
            )}
          </div>

          <p className="text-xs text-muted mt-2">
            {loading ? 'Searching…' : `${total.toLocaleString()} profiles found`}
          </p>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="app-container py-8">
        {loading && profiles.length === 0 ? (
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
        ) : profiles.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-serif text-xl mb-2">No profiles found</h3>
            <p className="text-muted text-sm">Try broadening your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {profiles.map(p => (
                <ProfileCard key={p.id} profile={p} />
              ))}
            </div>

            {/* Load more */}
            {profiles.length < total && (
              <div className="text-center mt-10">
                <button
                  className="btn-ghost px-8 py-3"
                  disabled={loading}
                  onClick={() => {
                    const next = page + 1
                    setPage(next)
                    load(next)
                  }}
                >
                  {loading ? 'Loading…' : `Load more (${total - profiles.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="h-16 md:h-0" />
    </div>
  )
}
