import Image from 'next/image'
import { gDriveThumb } from '@/lib/gdrive'

interface ProfilePhotoProps {
  photoUrl: string | null | undefined
  name: string | null | undefined
  gender: string | null | undefined
  className?: string
  size?: number
}

export default function ProfilePhoto({
  photoUrl,
  name,
  gender,
  className = '',
  size = 400,
}: ProfilePhotoProps) {
  const src = gDriveThumb(photoUrl, size) ?? photoUrl

  if (src) {
    return (
      <Image
        src={src}
        alt={name ? `${name[0]}*** profile photo` : 'Profile photo'}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className={`object-cover object-top ${className}`}
        unoptimized={src.includes('drive.google.com')}
      />
    )
  }

  /* Placeholder */
  const initials = name ? name[0].toUpperCase() : (gender === 'Female' ? '♀' : '♂')
  const bg = gender === 'Female'
    ? 'linear-gradient(135deg, oklch(88% 0.06 10), oklch(93% 0.04 10))'
    : 'linear-gradient(135deg, oklch(88% 0.05 240), oklch(93% 0.03 240))'

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${className}`}
      style={{ background: bg }}
    >
      <span
        className="font-serif select-none"
        style={{ fontSize: 'clamp(40px, 30%, 80px)', color: 'var(--mist)', opacity: 0.5 }}
      >
        {initials}
      </span>
    </div>
  )
}
