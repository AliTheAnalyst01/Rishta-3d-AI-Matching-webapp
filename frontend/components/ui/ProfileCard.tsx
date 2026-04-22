'use client'

import Link from 'next/link'
import { formatIncome } from '@/lib/gdrive'
import ProfilePhoto from './ProfilePhoto'

interface ProfileSummary {
  id: number
  reg_no: string
  name: string | null
  gender: string | null
  sect: string | null
  age: number | null
  city: string | null
  education: string | null
  profession: string | null
  income: number | null
  category: string | null
  photo_url: string | null
}

export default function ProfileCard({
  profile,
  rationale,
}: {
  profile: ProfileSummary
  rationale?: string
}) {
  const incomeStr = formatIncome(profile.income)
  const displayName = profile.name ? `${profile.name[0]}***` : 'Anonymous'
  const shortCity = profile.city ? profile.city.replace(/\s+/g, ' ').trim() : ''

  return (
    <div className="card overflow-hidden group transition-all duration-300 hover:shadow-md">
      <Link href={`/profile/${profile.id}`}>
        {/* Photo */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <ProfilePhoto
            photoUrl={profile.photo_url}
            name={profile.name}
            gender={profile.gender}
            className="transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent dark:from-black/80" />

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {profile.sect && (
              <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${
                profile.sect === 'Shia' 
                  ? 'bg-violet-600/90 text-white' 
                  : 'bg-blue-600/90 text-white'
              }`}>
                {profile.sect}
              </span>
            )}
            {profile.category && (
              <span className="text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider bg-gold/90 text-void">
                {profile.category}
              </span>
            )}
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-serif text-lg font-semibold text-white group-hover:text-gold-300 transition-colors">
              {displayName}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-white/80">
              {profile.age && <span className="text-gold-200 font-medium">{profile.age}y</span>}
              {shortCity && <span className="truncate">· {shortCity}</span>}
            </div>
            <div className="text-xs text-white/70 mt-1 font-mono">{profile.reg_no}</div>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 border-t border-base">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="trust-chip">Verified</span>
          <span className="trust-chip">Private profile</span>
        </div>
        {rationale && <p className="text-xs text-muted mb-3">Why shown: {rationale}</p>}
        <div className="space-y-1.5 text-sm">
          {profile.education && <p className="text-muted truncate"><span className="text-parchment/80">Education:</span> {profile.education}</p>}
          {profile.profession && <p className="text-muted truncate"><span className="text-parchment/80">Profession:</span> {profile.profession}</p>}
          {incomeStr && <p className="text-muted"><span className="text-parchment/80">Income:</span> {incomeStr}</p>}
        </div>
      </div>

      <div className="p-4 pt-0">
        <Link href={`/profile/${profile.id}`} className="btn-primary w-full">
          View Profile
        </Link>
        <Link href={`/profile/${profile.id}?intent=intro`} className="btn-link w-full mt-2">
          Request Introduction
        </Link>
      </div>
    </div>
  )
}