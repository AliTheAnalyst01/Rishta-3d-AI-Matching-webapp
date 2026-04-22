'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'
import { useAuth } from '@/components/ui/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const { login: setAuth } = useAuth()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
      const { token, user } = await login({ email, password })
      setAuth(token, user)
      router.push('/proposals')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 font-serif text-2xl font-bold text-white"
            style={{ background: 'var(--rose)', boxShadow: '0 8px 24px oklch(55% 0.18 10 / 0.3)' }}>
            R
          </div>
          <h1 className="font-serif text-3xl font-semibold mb-1">Welcome Back</h1>
          <p className="text-muted text-sm">Sign in to your RishtaConnect account</p>
        </div>

        {/* Card */}
        <div className="card p-8 rounded-3xl" style={{ boxShadow: '0 20px 60px oklch(18% 0.01 60 / 0.1)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold">Password</label>
                <button type="button" className="text-xs" style={{ color: 'var(--rose)' }}>
                  Forgot password?
                </button>
              </div>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'oklch(95% 0.04 15)', color: 'var(--rose-dark)', border: '1.5px solid oklch(88% 0.06 10)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3.5 text-base rounded-xl mt-2"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-muted text-sm">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-sm font-semibold" style={{ color: 'var(--rose)' }}>
              Create one
            </Link>
          </div>
        </div>

        {/* Privacy note */}
        <div className="mt-5 rounded-xl px-4 py-3 flex gap-3 items-start"
          style={{ background: 'var(--rose-pale)', border: '1.5px solid oklch(88% 0.06 10)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 mt-0.5" style={{ color: 'var(--rose)' }}>
            <rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 018 0v3" strokeLinecap="round" />
          </svg>
          <p className="text-xs leading-relaxed text-muted">
            Your profile and data are kept strictly private. We never share personal details without consent.
          </p>
        </div>
      </div>
    </div>
  )
}
