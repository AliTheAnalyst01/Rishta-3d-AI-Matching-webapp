'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getProfiles, getProfileCount, ProfileSummary, ProfileFilters, getMe, setAuthToken } from '@/lib/api'
import ProfileCard from '@/components/ui/ProfileCard'

const SECTS = ['Shia', 'Sunni']
const GENDERS = ['Male', 'Female']
const CATEGORIES = ['Syed', 'NonSyed', 'Doctor', 'Engineer', '2ndMarriage', 'Widow']
const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']
const AGE_RANGES = [
  { label: '18-25', min: 18, max: 25 },
  { label: '26-30', min: 26, max: 30 },
  { label: '31-35', min: 31, max: 35 },
  { label: '36-40', min: 36, max: 40 },
  { label: '41-45', min: 41, max: 45 },
  { label: '46-50', min: 46, max: 50 },
  { label: '50+', min: 50, max: 70 },
]

const ITEMS_PER_PAGE = 24
const PRESETS: { label: string; values: Record<string, string> }[] = [
  { label: 'Family Focused', values: { category: 'Syed' } },
  { label: 'Career Focused', values: { category: 'Doctor' } },
  { label: 'Same City', values: { city: 'Karachi' } },
  { label: 'Shia Community', values: { sect: 'Shia' } },
]

function BrowseContent() {
  const router = useRouter()
  const getInitialQuery = () => {
    if (typeof window === 'undefined') {
      return { gender: '', sect: '', city: '', category: '', age: '', search: '', page: 0 }
    }
    const params = new URLSearchParams(window.location.search)
    return {
      gender: params.get('gender') || '',
      sect: params.get('sect') || '',
      city: params.get('city') || '',
      category: params.get('category') || '',
      age: params.get('age') || '',
      search: params.get('search') || '',
      page: parseInt(params.get('page') || '0', 10),
    }
  }

  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [personalizedMode, setPersonalizedMode] = useState(false)
  const [query, setQuery] = useState(getInitialQuery)

  // Keep URL in sync without route transitions (prevents page blink).
  useEffect(() => {
    const params = new URLSearchParams()
    if (query.gender) params.set('gender', query.gender)
    if (query.sect) params.set('sect', query.sect)
    if (query.city) params.set('city', query.city)
    if (query.category) params.set('category', query.category)
    if (query.age) params.set('age', query.age)
    if (query.search) params.set('search', query.search)
    if (query.page > 0) params.set('page', String(query.page))
    const search = params.toString()
    const nextUrl = search ? `/browse?${search}` : '/browse'
    window.history.replaceState(null, '', nextUrl)
  }, [query])

  const { gender, sect, city, category, age: ageRange, search, page } = query

  const [searchDraft, setSearchDraft] = useState(search)

  const filters: ProfileFilters = useMemo(() => ({
    gender: gender || undefined,
    sect: sect || undefined,
    city: city || undefined,
    category: category || undefined,
    search: search || undefined,
  }), [gender, sect, city, category, search])

  // Parse age range
  const range = useMemo(() => AGE_RANGES.find(r => r.label === ageRange), [ageRange])
  const effectiveFilters = useMemo(() => {
    if (!range) return filters
    return { ...filters, min_age: range.min, max_age: range.max }
  }, [filters, range])

  const loadProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const [profilesData, countData] = await Promise.all([
        getProfiles(effectiveFilters, page, ITEMS_PER_PAGE),
        getProfileCount(effectiveFilters),
      ])
      setProfiles(profilesData)
      setTotal(countData)
    } catch (err) {
      console.error('Failed to load profiles:', err)
      setProfiles([])
      setTotal(0)
    } finally {
      setLoading(false)
      setInitialLoadDone(true)
    }
  }, [effectiveFilters, page])

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    async function applyLoginDefaults() {
      try {
        if (typeof window === 'undefined') return
        const token = localStorage.getItem('auth_token')
        if (!token) return
        setAuthToken(token)
        const me = await getMe()
        const targetGender = (me.gender || '').toLowerCase() === 'male' ? 'Female' : 'Male'
        setQuery((prev) => {
          // Respect explicit URL/user filters if already set.
          if (prev.gender || prev.sect || prev.city || prev.category || prev.search || prev.age) {
            return prev
          }
          setPersonalizedMode(true)
          return {
            ...prev,
            gender: targetGender,
            sect: me.sect || '',
            page: 0,
          }
        })
      } catch {
        // Ignore auth defaults if token is invalid.
      }
    }
    applyLoginDefaults()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchDraft !== search) {
        updateFilter('search', searchDraft)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [searchDraft, search])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const updateFilter = (key: string, value: string, resetPage = true) => {
    setQuery((prev) => ({
      ...prev,
      [key]: key === 'page' ? parseInt(value || '0', 10) : value,
      page: key === 'page' ? parseInt(value || '0', 10) : (resetPage ? 0 : prev.page),
    }))
  }

  const clearFilters = () => {
    setQuery({
      gender: '',
      sect: '',
      city: '',
      category: '',
      age: '',
      search: '',
      page: 0,
    })
  }
  const applyPreset = (values: Record<string, string>) => {
    setQuery((prev) => ({
      ...prev,
      ...values,
      page: 0,
    }))
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-base py-6 md:py-8">
        <div className="app-container">
          <h1 className="text-3xl font-serif font-semibold text-parchment mb-2">
            Browse Profiles
          </h1>
          <p className="text-sand/70">
            Find your perfect match from our verified profiles
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="trust-chip">Authentic DB-backed profiles</span>
            <span className="trust-chip">Recently updated first</span>
            <span className="trust-chip">Privacy protected</span>
            {personalizedMode && <span className="trust-chip">Personalized for your login</span>}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={clearFilters} className="btn-secondary">Reset Filters</button>
            <button onClick={() => setShowFilters(v => !v)} className="btn-service lg:hidden">{showFilters ? 'Close Filters' : 'Open Filters'}</button>
            <button onClick={() => router.push('/match')} className="btn-primary">Start AI Match</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button key={preset.label} onClick={() => applyPreset(preset.values)} className="trust-chip">
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="app-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-72 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'} lg:static fixed inset-x-4 top-20 z-40 lg:z-auto`}>
            <div className="card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-lg text-parchment">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gold-400 hover:text-gold-300"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm text-sand/60 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Name, profession..."
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  className="input"
                />
              </div>

              {/* Gender */}
              <div className="mb-6">
                <label className="block text-sm text-sand/60 mb-2">Looking For</label>
                <select
                  value={gender}
                  onChange={(e) => updateFilter('gender', e.target.value)}
                  className="select-field"
                >
                  <option value="">All</option>
                  {GENDERS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Sect */}
              <div className="mb-6">
                <label className="block text-sm text-sand/60 mb-2">Sect</label>
                <select
                  value={sect}
                  onChange={(e) => updateFilter('sect', e.target.value)}
                  className="select-field"
                >
                  <option value="">All</option>
                  {SECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Age Range */}
              <div className="mb-6">
                <label className="block text-sm text-sand/60 mb-2">Age Range</label>
                <select
                  value={ageRange}
                  onChange={(e) => updateFilter('age', e.target.value)}
                  className="select-field"
                >
                  <option value="">Any Age</option>
                  {AGE_RANGES.map(r => (
                    <option key={r.label} value={r.label}>{r.label} years</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="mb-6">
                <label className="block text-sm text-sand/60 mb-2">City</label>
                <select
                  value={city}
                  onChange={(e) => updateFilter('city', e.target.value)}
                  className="select-field"
                >
                  <option value="">All Cities</option>
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-sand/60 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="select-field"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>
          {showFilters && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setShowFilters(false)} />}

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle & Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sand/60">
                {loading && !initialLoadDone ? (
                  <span>Loading...</span>
                ) : loading ? (
                  <span>Refreshing...</span>
                ) : (
                    <span>{total.toLocaleString()} profile{total !== 1 ? 's' : ''} found</span>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden btn-secondary text-sm px-4 py-2"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Profile Grid */}
            {loading && !initialLoadDone ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="card aspect-[4/5] animate-pulse bg-surface" />
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-serif text-parchment mb-2">No profiles found</h3>
                <p className="text-sand/60 mb-6">Try adjusting your filters to see more results.</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  {loading && (
                    <div className="absolute inset-0 z-10 rounded-2xl bg-panel/55 backdrop-blur-[1px] flex items-start justify-end p-3 pointer-events-none">
                      <span className="trust-chip animate-pulse">Updating results...</span>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {profiles.map(profile => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      rationale={
                        sect || city || category || ageRange || gender
                          ? `${[gender, sect, city, category, ageRange].filter(Boolean).join(', ')}`
                          : 'Latest verified profile'
                      }
                    />
                  ))}
                </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => updateFilter('page', String(page - 1), false)}
                      disabled={page === 0}
                      className="btn-secondary px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sand/60 px-4">
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => updateFilter('page', String(page + 1), false)}
                      disabled={page >= totalPages - 1}
                      className="btn-secondary px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-void">
      <div className="bg-surface/50 border-b border-gold/10 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif font-semibold text-parchment mb-2">Browse Profiles</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card aspect-[4/5] animate-pulse bg-surface" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return <BrowseContent />
}