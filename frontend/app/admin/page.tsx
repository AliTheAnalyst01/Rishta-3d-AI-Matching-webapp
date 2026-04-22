'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAdminPipelineStatus, triggerAdminSync } from '@/lib/api'

export default function AdminPage() {
  const [status, setStatus] = useState<any>(null)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    try {
      const data = await getAdminPipelineStatus()
      setStatus(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function triggerSync() {
    setSyncLoading(true)
    setSyncResult(null)
    try {
      const data = await triggerAdminSync()
      setSyncResult(data)
      setStatus((prev: any) => ({
        ...prev,
        current: { status: 'completed', stats: data.stats },
      }))
    } catch (err) {
      console.error(err)
    } finally {
      setSyncLoading(false)
    }
  }

  const currentStatus = status?.current?.status
  const statusConfig = {
    completed: { color: 'text-green-400', label: 'Completed' },
    failed: { color: 'text-red-400', label: 'Failed' },
    running: { color: 'text-yellow-400', label: 'Running' },
  }
  const statusInfo = statusConfig[currentStatus as keyof typeof statusConfig]

  return (
    <div className="min-h-screen">
      <div className="app-container py-8 md:py-10">
        {/* Header */}
        <div className="mb-10">
          <p className="text-gold-400 text-xs font-medium tracking-widest uppercase mb-1">System</p>
          <h1 className="text-4xl font-serif font-bold text-parchment mb-2">Admin Panel</h1>
          <p className="text-sand/40 text-sm">Manage the data pipeline and monitor sync status.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/insights" className="btn-service">View Insights</Link>
            <Link href="/match" className="btn-secondary">Open AI Match</Link>
            <Link href="/browse" className="btn-secondary">Browse Profiles</Link>
          </div>
        </div>

        {/* Pipeline control */}
        <div className="card p-5 md:p-7 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-semibold text-parchment">Data Pipeline</h2>
              <p className="text-xs text-sand/40">Google Sheets → PostgreSQL</p>
            </div>

            <button
              onClick={triggerSync}
              disabled={syncLoading}
              className="btn-primary"
            >
              {syncLoading ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatBox
              label="Last Run"
              value={
                status?.current?.finished_at
                  ? new Date(status.current.finished_at).toLocaleString('en-PK', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : 'Never'
              }
            />
            <StatBox
              label="Status"
              value={
                statusInfo ? (
                  <span className={`inline-flex items-center gap-1.5 ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                ) : (
                  <span className="text-sand/40">Idle</span>
                )
              }
            />
            <StatBox
              label="Profiles Synced"
              value={
                <span className="text-gold-400">
                  {status?.current?.stats?.success?.toLocaleString() ?? '0'}
                </span>
              }
            />
          </div>

          {/* Errors */}
          {(status?.current?.stats?.errors ?? 0) > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-900/10 border border-red-800/20 rounded-lg px-4 py-2.5">
              {status.current.stats.errors} errors during last sync
            </div>
          )}
        </div>

        {/* Sync result */}
        {syncResult && (
          <div className="bg-green-900/10 border border-green-800/20 rounded-xl p-5 mb-6 text-sm overflow-x-auto">
            <div className="text-green-400 font-medium mb-2">Sync completed</div>
            <pre className="text-sand/60 text-xs whitespace-pre-wrap font-mono">
              {JSON.stringify(syncResult.stats, null, 2)}
            </pre>
          </div>
        )}

        {/* Recent logs */}
        {status?.recent_logs && status.recent_logs.length > 0 && (
          <div className="card p-5 md:p-7">
            <h2 className="font-semibold text-parchment mb-5">Recent Runs</h2>
            <div className="space-y-2">
              {status.recent_logs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-void border border-gold/5"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      log.status === 'completed' ? 'bg-green-500' :
                      log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm text-sand/70">
                      {new Date(log.started_at).toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="text-xs text-sand/40">
                    <span className="text-green-400">{log.success} new</span>
                    {log.errors > 0 && <span className="text-red-400 ml-2">{log.errors} errors</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-void rounded-xl p-4 border border-gold/5">
      <div className="text-xs text-sand/40 mb-1.5 uppercase tracking-wide">{label}</div>
      <div className="text-sm font-medium text-parchment/80">{value}</div>
    </div>
  )
}
