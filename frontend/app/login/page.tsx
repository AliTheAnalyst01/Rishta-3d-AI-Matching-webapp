'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, setAuthToken } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await login({ email, password })
      localStorage.setItem('auth_token', res.token)
      setAuthToken(res.token)
      router.push('/proposals')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-10">
      <div className="app-container max-w-md">
        <div className="card p-6">
          <h1 className="text-3xl font-serif mb-2">Login / لاگ اِن</h1>
          <p className="text-muted mb-4">Get personalized proposals after login.</p>
          <form onSubmit={onSubmit} className="space-y-3">
            <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
          </form>
          <p className="text-sm text-muted mt-4">New user? <Link className="text-gold-400" href="/signup">Create account</Link></p>
        </div>
      </div>
    </div>
  )
}
