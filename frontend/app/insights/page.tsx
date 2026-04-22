'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAnalytics, AnalyticsStats } from '@/lib/api'

export default function InsightsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-base py-8">
        <div className="app-container max-w-6xl">
          <h1 className="text-3xl font-serif font-semibold text-parchment mb-2">
            Community Insights
          </h1>
          <p className="text-sand/70">
            Market intelligence to guide smarter profile search decisions
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/match" className="btn-primary">Start AI Match</Link>
            <Link href="/browse" className="btn-service">Browse Profiles</Link>
          </div>
        </div>
      </div>

      <div className="app-container max-w-6xl py-8">
        {loading ? (
          <InsightsSkeleton />
        ) : !stats ? (
          <div className="text-center py-16">
            <p className="text-xl text-sand/50">Unable to load analytics</p>
            <p className="text-sm text-mist mt-2">Make sure the backend API is running</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                label="Total Profiles"
                value={stats.total_profiles.toLocaleString()}
                sub="active listings"
                accent
              />
              <KpiCard
                label="Female"
                value={stats.female_count.toLocaleString()}
                sub={stats.total_profiles ? `${Math.round((stats.female_count / stats.total_profiles) * 100)}%` : ''}
              />
              <KpiCard
                label="Male"
                value={stats.male_count.toLocaleString()}
                sub={stats.total_profiles ? `${Math.round((stats.male_count / stats.total_profiles) * 100)}%` : ''}
              />
              <KpiCard
                label="Average Age"
                value={stats.avg_age ? Math.round(stats.avg_age).toString() : '—'}
                sub="years"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sect Breakdown */}
              {stats.sect_breakdown && Object.keys(stats.sect_breakdown).length > 0 && (
                <div className="card p-6">
                  <h3 className="text-xs uppercase tracking-widest text-gold-400 mb-6">Sect Breakdown</h3>
                  <div className="space-y-4">
                    {Object.entries(stats.sect_breakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([sect, count]) => {
                        const pct = stats.total_profiles ? (count / stats.total_profiles) * 100 : 0
                        const isShia = sect.toLowerCase().includes('shia')
                        return (
                          <div key={sect}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-parchment">{sect}</span>
                              <span className="text-sm text-mist">{count.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-surface rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isShia ? 'bg-violet-500' : 'bg-blue-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Top Cities */}
              {stats.top_cities && stats.top_cities.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-xs uppercase tracking-widest text-gold-400 mb-6">Top Cities</h3>
                  <div className="space-y-4">
                    {stats.top_cities.slice(0, 8).map((city, i) => {
                      const max = stats.top_cities[0].count
                      const pct = max ? (city.count / max) * 100 : 0
                      return (
                        <div key={city.city}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-parchment flex items-center gap-2">
                              <span className="text-mist text-xs w-4">{i + 1}</span>
                              {city.city}
                            </span>
                            <span className="text-sm text-mist">{city.count.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-surface rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Age Distribution */}
            {stats.age_distribution && stats.age_distribution.length > 0 && (
              <div className="card p-6 overflow-x-auto">
                <h3 className="text-xs uppercase tracking-widest text-gold-400 mb-6">Age Distribution</h3>
                <div className="flex items-end gap-2 h-40 min-w-[560px]">
                  {stats.age_distribution.map((bucket) => {
                    const max = Math.max(...stats.age_distribution.map(b => b.count))
                    const pct = max ? (bucket.count / max) * 100 : 0
                    return (
                      <div key={bucket.bucket} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gold-400/20 rounded-t-md relative flex-1">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gold-400 rounded-t-md transition-all"
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-mist">{bucket.bucket}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Marital Status */}
            {stats.marital_status_breakdown && Object.keys(stats.marital_status_breakdown).length > 0 && (
              <div className="card p-6">
                <h3 className="text-xs uppercase tracking-widest text-gold-400 mb-6">Marital Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Object.entries(stats.marital_status_breakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([status, count]) => {
                      const pct = stats.total_profiles ? Math.round((count / stats.total_profiles) * 100) : 0
                      return (
                        <div key={status} className="bg-surface rounded-xl p-4 text-center">
                          <p className="text-xs text-mist mb-1">{status}</p>
                          <p className="text-2xl font-serif text-parchment">{count.toLocaleString()}</p>
                          <p className="text-xs text-gold-400">{pct}%</p>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            {stats.category_breakdown && Object.keys(stats.category_breakdown).length > 0 && (
              <div className="card p-6">
                <h3 className="text-xs uppercase tracking-widest text-gold-400 mb-6">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.category_breakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => (
                      <span key={cat} className="badge">{cat}: {count.toLocaleString()}</span>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`card p-5 ${accent ? 'border-gold/20 bg-gold/5' : ''}`}>
      <p className="text-xs uppercase tracking-wider text-mist mb-1">{label}</p>
      <p className={`text-3xl font-serif font-semibold ${accent ? 'text-gold-400' : 'text-parchment'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-mist mt-1">{sub}</p>}
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card h-28" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card h-64" />
        <div className="card h-64" />
      </div>
      <div className="card h-48" />
    </div>
  )
}