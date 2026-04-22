import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProfile, Profile } from '@/lib/api'
import { formatIncome, formatHeight, gDriveThumb } from '@/lib/gdrive'
import ProposalButton from './ProposalButton'

interface Props { params: { id: string } }

export default async function ProfileDetailPage({ params }: Props) {
  let profile: Profile
  try {
    profile = await getProfile(Number(params.id))
  } catch {
    notFound()
  }

  const displayName = profile.name ? `${profile.name[0]}***` : 'Anonymous'
  const photoSrc = gDriveThumb(profile.photo_url, 800) ?? profile.photo_url

  const catColor: Record<string, string> = {
    Premium: 'chip-rose', Elite: 'chip-gold', Syed: 'chip-purple',
  }
  const catClass   = catColor[profile.category ?? ''] ?? 'chip-stone'
  const sectClass  = profile.sect?.toLowerCase() === 'shia' ? 'chip-purple' : 'chip-rose'

  const infoRows = [
    { label: 'Education',      value: profile.education },
    { label: 'Profession',     value: profile.profession },
    { label: 'Income',         value: formatIncome(profile.income) },
    { label: 'City',           value: profile.city },
    { label: 'Country',        value: profile.country },
    { label: 'Marital Status', value: profile.marital_status },
    { label: 'Height',         value: formatHeight(profile.height_cm) },
    { label: 'Caste',          value: profile.caste },
    { label: 'Family Status',  value: profile.family_status },
    { label: 'Nationality',    value: profile.nationality },
  ].filter(r => r.value)

  return (
    <div className="pt-20">
      <div className="app-container max-w-5xl py-8">
        {/* Back */}
        <Link href="/browse"
          className="inline-flex items-center gap-2 text-sm text-muted mb-6 hover:text-rose transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 12H5m5 5-5-5 5-5" />
          </svg>
          Back to Browse
        </Link>

        <div className="grid md:grid-cols-[340px_1fr] gap-8 items-start">

          {/* ── Left: Photo + actions ── */}
          <div className="space-y-4">
            <div className="card overflow-hidden rounded-3xl" style={{ aspectRatio: '4/5', position: 'relative' }}>
              {photoSrc ? (
                <Image
                  src={photoSrc}
                  alt={`${displayName} profile`}
                  fill
                  sizes="340px"
                  className="object-cover object-top"
                  unoptimized={photoSrc.includes('drive.google.com')}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'var(--cream)' }}>
                  <span className="font-serif text-8xl text-muted opacity-30">
                    {profile.gender === 'Female' ? '♀' : '♂'}
                  </span>
                </div>
              )}

              {/* Overlay badges */}
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                {profile.sect     && <span className={`chip ${sectClass}`}>{profile.sect}</span>}
                {profile.category && <span className={`chip ${catClass}`}>{profile.category}</span>}
              </div>
            </div>

            {/* Actions */}
            <ProposalButton profileId={profile.id} />

            <button className="btn-muted w-full justify-center py-3 text-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="10" width="14" height="11" rx="3" />
                <path d="M8 10V7a4 4 0 018 0v3" strokeLinecap="round" />
              </svg>
              Request Full Details
            </button>

            {/* Privacy notice */}
            <div className="rounded-xl p-4 text-xs leading-relaxed"
              style={{ background: 'var(--gold-pale)', border: '1.5px solid oklch(87% 0.08 75)', color: 'oklch(38% 0.12 75)' }}>
              <strong className="block mb-1">Privacy Protected</strong>
              Full name, contact, and photos shared only after mutual interest through our secure family introduction channel.
            </div>
          </div>

          {/* ── Right: Profile info ── */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <h1 className="font-serif text-4xl font-semibold mb-2">{displayName}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted mb-4">
                {profile.age  && <span className="font-semibold text-base" style={{ color: 'var(--charcoal)' }}>{profile.age} years</span>}
                {profile.city && <span>· {profile.city}</span>}
                <span className="font-mono text-xs opacity-60">#{profile.reg_no}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="chip chip-green">✓ Verified</span>
                <span className="chip chip-stone">Private Profile</span>
                {profile.marital_status && (
                  <span className="chip chip-stone">{profile.marital_status}</span>
                )}
              </div>
            </div>

            {/* About / Requirements */}
            {profile.requirements && (
              <div className="card p-6 mb-6">
                <h2 className="font-serif text-lg font-semibold mb-3">Partner Requirements</h2>
                <p className="text-sm leading-relaxed text-muted">{profile.requirements}</p>
              </div>
            )}

            {/* Info table */}
            <div className="card overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-base">
                <h2 className="font-serif text-lg font-semibold">Profile Details</h2>
              </div>
              <div className="divide-y divide-base">
                {infoRows.map(row => (
                  <div key={row.label} className="flex items-center px-6 py-3.5">
                    <span className="text-sm text-muted w-36 shrink-0">{row.label}</span>
                    <span className="text-sm font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Physical (if available) */}
            {(profile.height_cm || profile.weight_kg || profile.complexion || profile.body_type) && (
              <div className="card p-6 mb-6">
                <h2 className="font-serif text-lg font-semibold mb-4">Physical Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  {profile.height_cm  && <Detail label="Height"     value={formatHeight(profile.height_cm) ?? ''} />}
                  {profile.weight_kg  && <Detail label="Weight"     value={`${profile.weight_kg} kg`} />}
                  {profile.complexion && <Detail label="Complexion" value={profile.complexion} />}
                  {profile.body_type  && <Detail label="Body Type"  value={profile.body_type} />}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="card p-6" style={{ background: 'var(--rose-pale)', borderColor: 'oklch(85% 0.06 10)' }}>
              <h3 className="font-serif text-lg font-semibold mb-2">Interested in this Profile?</h3>
              <p className="text-sm text-muted mb-4 leading-relaxed">
                Send a proposal and our team will facilitate a respectful family introduction.
              </p>
              <ProposalButton profileId={profile.id} large />
            </div>
          </div>
        </div>
      </div>
      <div className="h-16 md:h-0" />
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}

