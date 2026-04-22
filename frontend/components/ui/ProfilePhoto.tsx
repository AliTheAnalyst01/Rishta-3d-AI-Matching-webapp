'use client'
import { gDriveThumb } from '@/lib/gdrive'

interface Props {
  photoUrl?: string | null
  name?: string | null
  gender?: string | null
  size?: number
  className?: string
}

export default function ProfilePhoto({ photoUrl, name, gender, className = '' }: Props) {
  const thumbUrl = gDriveThumb(photoUrl)
  const initial = name?.[0]?.toUpperCase() || (gender === 'Female' ? '♀' : '♂')

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{
        background: 'linear-gradient(160deg, #1e1208 0%, #0d0705 100%)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,167,87,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(212,167,87,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {thumbUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbUrl}
          alt={name || 'Profile'}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      )}

      {!thumbUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div
            className="flex items-center justify-center rounded-full text-4xl font-serif"
            style={{
              width: '96px',
              height: '96px',
              background: 'rgba(212,167,87,0.07)',
              border: '1px solid rgba(212,167,87,0.2)',
              color: '#d4a757',
              boxShadow: '0 0 24px rgba(212,167,87,0.08)',
            }}
          >
            {initial}
          </div>
          <span
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: 'rgba(200,170,128,0.3)' }}
          >
            Photo on request
          </span>
        </div>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(10,6,3,0.95) 0%, transparent 100%)' }}
      />
    </div>
  )
}