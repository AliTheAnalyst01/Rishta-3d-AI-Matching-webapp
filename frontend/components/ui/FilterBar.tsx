'use client'

import { useState, useRef } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'

interface FilterBarProps {
  onFilterChange?: (filters: any) => void
}

const GENDERS   = [{ v: '',       l: 'Any Gender' }, { v: 'Male',   l: 'Brothers' }, { v: 'Female', l: 'Sisters' }]
const SECTS     = [{ v: '',       l: 'Any Sect'   }, { v: 'Shia',  l: 'Shia'     }, { v: 'Sunni',  l: 'Sunni'   }]
const CATEGORIES = [{ v: '', l: 'All Categories' }, { v: 'Syed', l: 'Syed' }, { v: 'Doctor', l: 'Doctor' }, { v: '2ndMarriage', l: '2nd Marriage' }]

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState({
    gender: '', sect: '', caste: '', city: '', category: '', minAge: '', maxAge: '', search: '',
  })
  const [expanded, setExpanded] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const set = (key: string, val: string) => {
    const next = { ...filters, [key]: val }
    setFilters(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onFilterChange?.(next), 300)
  }

  const reset = () => {
    const cleared = { gender: '', sect: '', caste: '', city: '', category: '', minAge: '', maxAge: '', search: '' }
    setFilters(cleared)
    onFilterChange?.(cleared)
  }

  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(14,7,3,0.75)',
        border: '1px solid rgba(212,167,87,0.1)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Row 1: Search + quick pills ── */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: 'rgba(212,167,87,0.35)' }}
          />
          <input
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            placeholder="Search name, profession…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'rgba(5,2,2,0.7)',
              border: '1px solid rgba(212,167,87,0.12)',
              color: '#ede0c4',
            }}
          />
        </div>

        {/* Gender pill group */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(5,2,2,0.5)', border: '1px solid rgba(212,167,87,0.08)' }}>
          {GENDERS.map(({ v, l }) => (
            <button
              key={v}
              onClick={() => set('gender', filters.gender === v ? '' : v)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filters.gender === v ? 'rgba(212,167,87,0.9)' : 'transparent',
                color: filters.gender === v ? '#060302' : 'rgba(196,168,122,0.55)',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Sect pill group */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(5,2,2,0.5)', border: '1px solid rgba(212,167,87,0.08)' }}>
          {SECTS.map(({ v, l }) => (
            <button
              key={v}
              onClick={() => set('sect', filters.sect === v ? '' : v)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filters.sect === v ? 'rgba(212,167,87,0.9)' : 'transparent',
                color: filters.sect === v ? '#060302' : 'rgba(196,168,122,0.55)',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* More filters toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background: expanded ? 'rgba(212,167,87,0.1)' : 'rgba(5,2,2,0.5)',
            border: `1px solid ${expanded ? 'rgba(212,167,87,0.25)' : 'rgba(212,167,87,0.08)'}`,
            color: expanded ? '#d4a757' : 'rgba(196,168,122,0.55)',
          }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          More
          {activeCount > 0 && (
            <span
              className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
              style={{ background: '#d4a757', color: '#060302' }}
            >
              {activeCount}
            </span>
          )}
          <ChevronDown
            className="w-3 h-3 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : '' }}
          />
        </button>

        {/* Clear — only shown when filters active */}
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs transition-all"
            style={{
              color: 'rgba(196,168,122,0.45)',
              border: '1px solid rgba(212,167,87,0.08)',
            }}
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* ── Row 2: Expanded filters ── */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded ? '200px' : '0', opacity: expanded ? 1 : 0 }}
      >
        <div
          className="px-5 pb-5 pt-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          style={{ borderTop: '1px solid rgba(212,167,87,0.06)' }}
        >
          {/* City */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(200,170,128,0.4)' }}>City</label>
            <input
              value={filters.city}
              onChange={e => set('city', e.target.value)}
              placeholder="e.g. Lahore"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none transition-all"
              style={{ background: 'rgba(5,2,2,0.65)', border: '1px solid rgba(212,167,87,0.12)', color: '#ede0c4' }}
            />
          </div>

          {/* Caste */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(200,170,128,0.4)' }}>Caste</label>
            <input
              value={filters.caste}
              onChange={e => set('caste', e.target.value)}
              placeholder="e.g. Syed"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none transition-all"
              style={{ background: 'rgba(5,2,2,0.65)', border: '1px solid rgba(212,167,87,0.12)', color: '#ede0c4' }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(200,170,128,0.4)' }}>Category</label>
            <div className="relative">
              <select
                value={filters.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs appearance-none outline-none cursor-pointer transition-all"
                style={{ background: 'rgba(5,2,2,0.65)', border: '1px solid rgba(212,167,87,0.12)', color: '#ede0c4' }}
              >
                {CATEGORIES.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'rgba(212,167,87,0.35)' }} />
            </div>
          </div>

          {/* Age range */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(200,170,128,0.4)' }}>Min Age</label>
            <input
              type="number"
              value={filters.minAge}
              onChange={e => set('minAge', e.target.value)}
              min="18" max="80" placeholder="18"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none transition-all"
              style={{ background: 'rgba(5,2,2,0.65)', border: '1px solid rgba(212,167,87,0.12)', color: '#ede0c4' }}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(200,170,128,0.4)' }}>Max Age</label>
            <input
              type="number"
              value={filters.maxAge}
              onChange={e => set('maxAge', e.target.value)}
              min="18" max="80" placeholder="60"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none transition-all"
              style={{ background: 'rgba(5,2,2,0.65)', border: '1px solid rgba(212,167,87,0.12)', color: '#ede0c4' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
