'use client'

import Link from 'next/link'
import ProfilePhoto from './ProfilePhoto'
import { ProfileSummary } from '@/lib/api'
import { formatIncome } from '@/lib/gdrive'

export default function ProfileCard({
  profile,
  rationale,
}: {
  profile: ProfileSummary
  rationale?: string
}) {
  const displayName = profile.name ? `${profile.name[0]}***` : 'Anonymous'
  const catColor: Record<string, string> = {
    Premium: 'chip-rose',
    Elite:   'chip-gold',
    Syed:    'chip-purple',
  }
  const catClass = catColor[profile.category ?? ''] ?? 'chip-stone'
  const sectClass = profile.sect?.toLowerCase() === 'shia' ? 'chip-purple' : 'chip-rose'
  const incomeStr = formatIncome(profile.income)

  return (
    <div className="card-hover overflow-hidden cursor-pointer group">
      <Link href={`/profile/${profile.id}`}>
        {/* Photo */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
          <ProfilePhoto
            photoUrl={profile.photo_url}
            name={profile.name}
            gender={profile.gender}
            className="transition-transform duration-500 group-hover:scale-105"
          />

          {/* Gradient */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, oklch(18% 0.01 60 / 0.72) 0%, transparent 50%)' }} />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {profile.sect && (
              <span className={`chip ${sectClass}`}>{profile.sect}</span>
            )}
            {profile.category && (
              <span className={`chip ${catClass}`}>{profile.category}</span>
            )}
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-serif text-lg font-semibold text-white group-hover:text-rose-light transition-colors">
              {displayName}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {profile.age && (
                <span className="font-semibold" style={{ color: 'oklch(88% 0.1 65)' }}>{profile.age} yrs</span>
              )}
              {profile.city && <span>· {profile.city}</span>}
            </div>
            <div className="text-xs mt-1 font-mono opacity-60 text-white">{profile.reg_no}</div>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="chip chip-green">✓ Verified</span>
          <span className="chip chip-stone">Private</span>
        </div>

        {rationale && (
          <p className="text-xs text-muted mb-3 leading-relaxed italic">AI: {rationale}</p>
        )}

        <div className="space-y-1.5 mb-4">
          {profile.education && (
            <InfoRow label="Education" value={profile.education} />
          )}
          {profile.profession && (
            <InfoRow label="Profession" value={profile.profession} />
          )}
          {incomeStr && (
            <InfoRow label="Income" value={incomeStr} />
          )}
        </div>

        <Link
          href={`/profile/${profile.id}`}
          className="btn-primary w-full justify-center text-sm py-2.5"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-muted shrink-0 w-20">{label}:</span>
      <span className="font-medium truncate" style={{ color: 'var(--charcoal)' }}>{value}</span>
    </div>
  )
}
