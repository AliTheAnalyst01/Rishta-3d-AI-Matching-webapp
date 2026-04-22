'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMe, getPersonalizedProposals, setAuthToken, ProfileSummary } from '@/lib/api'
import ProfileCard from '@/components/ui/ProfileCard'

export default function ProposalsPage() {
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [proposals, setProposals] = useState<ProfileSummary[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setError('Please login first.')
      setLoading(false)
      return
    }
    setAuthToken(token)
    Promise.all([getMe(), getPersonalizedProposals(0, 24)])
      .then(([me, list]) => {
        setName(me.full_name)
        setProposals(list.results || [])
      })
      .catch((err: any) => setError(err?.response?.data?.detail || 'Failed to load proposals'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen py-8">
      <div className="app-container">
        <h1 className="text-3xl font-serif mb-2">Personalized Proposals</h1>
        <p className="text-muted mb-6">{name ? `Welcome ${name}. Showing matches based on your profile preferences.` : 'Showing proposals matched to your needs.'}</p>
        {!error && (
          <div className="mb-6 flex flex-wrap gap-3">
            <Link href="/browse" className="btn-service">Browse More Profiles</Link>
            <Link href="/match" className="btn-secondary">Run AI Match</Link>
          </div>
        )}
        {loading ? <p className="text-muted">Loading proposals...</p> : null}
        {error ? (
          <div className="card p-4">
            <p className="text-red-400">{error}</p>
            <Link href="/login" className="btn-primary mt-3 inline-flex">Go to Login</Link>
          </div>
        ) : null}
        {!loading && !error && (
          proposals.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {proposals.map((p) => <ProfileCard key={p.id} profile={p} rationale="Matched to your profile preferences" />)}
            </div>
          ) : (
            <div className="card p-6">
              <p className="text-muted">No exact proposals found. You can browse wider profiles or run AI match for nearest candidates.</p>
              <Link href="/browse" className="btn-service mt-3 inline-flex">Browse More Profiles</Link>
            </div>
          )
        )}
      </div>
    </div>
  )
}
