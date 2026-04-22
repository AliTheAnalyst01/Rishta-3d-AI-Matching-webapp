import { notFound } from 'next/navigation'
import { formatIncome, formatHeight } from '@/lib/gdrive'
import { getProfile } from '@/lib/api'
import Link from 'next/link'
import ProfilePhoto from '@/components/ui/ProfilePhoto'

interface PageProps {
  params: { id: string }
}

export default async function ProfileDetailPage({ params }: PageProps) {
  let p
  try {
    p = await getProfile(parseInt(params.id, 10))
  } catch {
    p = null
  }
  
  if (!p) notFound()

  const displayName = p.name ? `${p.name[0]}***` : 'Anonymous'
  const atAGlance = [
    p.age ? `${p.age} years` : null,
    p.city || null,
    p.education || null,
    p.profession || null,
    p.sect || null,
    p.marital_status || null,
  ].filter(Boolean)
  const quickFacts = [
    { label: 'Age', value: p.age ? `${p.age} years` : null },
    { label: 'Gender', value: p.gender || null },
    { label: 'City', value: p.city || null },
    { label: 'Sect', value: p.sect || null },
    { label: 'Marital', value: p.marital_status || null },
    { label: 'Education', value: p.education || null },
  ].filter((item) => item.value)

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-base py-8">
        <div className="app-container max-w-5xl">
          <Link href="/browse" className="btn-link mb-6">
            Back to Browse
          </Link>
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Registration No.</p>
          <h1 className="text-3xl font-serif">{p.reg_no}</h1>
        </div>
      </div>

      <div className="app-container max-w-5xl py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Photo */}
            <div className="card aspect-[3/4] overflow-hidden">
              <ProfilePhoto photoUrl={p.photo_url} name={p.name} gender={p.gender} />
            </div>

            <div className="card p-6">
              <h3 className="text-xs uppercase tracking-widest text-gold-400 mb-3">Request Introduction</h3>
              <p className="text-sm text-muted mb-4">
                Send this profile to our team for family-level introduction. We review requests for safety before sharing details.
              </p>
              <div className="space-y-2">
                <button className="btn-primary w-full">Request Family Introduction</button>
                <button className="btn-secondary w-full">Save for Family Review</button>
              </div>
              <p className="text-xs text-muted mt-3">Expected response within 24-48 hours.</p>
            </div>
            <div className="card p-5">
              <h3 className="text-xs uppercase tracking-widest text-gold-400 mb-3">Verification</h3>
              <div className="space-y-2 text-sm text-muted">
                <p className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Reviewed by moderation team</span></p>
                <p className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Contact details hidden by default</span></p>
                <p className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Photo sharing controlled by request</span></p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {p.sect && (
                <span className={`badge ${p.sect === 'Shia' ? 'bg-violet-600/20 border-violet-500/30 text-violet-400' : 'bg-blue-600/20 border-blue-500/30 text-blue-400'}`}>
                  {p.sect}
                </span>
              )}
              {p.category && <span className="badge">{p.category}</span>}
              {p.marital_status && <span className="badge bg-mist/10 border-mist/20 text-mist">{p.marital_status}</span>}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted mb-1">Profile Snapshot</p>
                  <h2 className="text-2xl font-serif text-parchment">{displayName}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-muted">Privacy Safe Name</p>
                  <p className="text-sm text-sand/80">Full details shown after introduction request</p>
                </div>
              </div>
              {atAGlance.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-gold-400 mb-2">At a glance</p>
                  <div className="flex flex-wrap gap-2">
                    {atAGlance.slice(0, 6).map((item) => (
                      <span key={item} className="badge">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {p.age && <span className="badge">{p.age} years old</span>}
                {p.gender && <span className="badge">{p.gender}</span>}
                {p.caste && <span className="badge bg-mist/10 border-mist/20 text-mist">{p.caste}</span>}
              </div>
              {quickFacts.length > 0 && (
                <div className="grid sm:grid-cols-3 gap-3 mt-5">
                  {quickFacts.map((fact) => (
                    <div key={fact.label} className="bg-surface rounded-xl p-3 border border-base">
                      <p className="text-[11px] uppercase tracking-widest text-sand/95">{fact.label}</p>
                      <p className="text-sm text-gold-300 mt-1">{fact.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location & Background */}
            <details className="card p-6" open>
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-gold-400">Location & Background</h3>
                <span className="text-xs text-muted">Expand/Collapse</span>
              </summary>
              <div className="grid sm:grid-cols-2 gap-4">
                {p.city && (
                  <div className="bg-surface rounded-xl p-4">
                    <p className="text-xs text-sand/95 mb-1">City</p>
                    <p className="text-gold-300">{p.city}</p>
                  </div>
                )}
                {p.country && (
                  <div className="bg-surface rounded-xl p-4">
                    <p className="text-xs text-sand/95 mb-1">Country</p>
                    <p className="text-gold-300">{p.country}</p>
                  </div>
                )}
                {p.nationality && (
                  <div className="bg-surface rounded-xl p-4">
                    <p className="text-xs text-sand/95 mb-1">Nationality</p>
                    <p className="text-gold-300">{p.nationality}</p>
                  </div>
                )}
                {p.family_status && (
                  <div className="bg-surface rounded-xl p-4">
                    <p className="text-xs text-sand/95 mb-1">Family Status</p>
                    <p className="text-gold-300">{p.family_status}</p>
                  </div>
                )}
                {p.no_of_kids != null && p.no_of_kids > 0 && (
                  <div className="bg-surface rounded-xl p-4">
                    <p className="text-xs text-sand/95 mb-1">Children</p>
                    <p className="text-gold-300">{p.no_of_kids}</p>
                  </div>
                )}
              </div>
            </details>

            {/* Education & Career */}
            <details className="card p-6" open>
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-gold-400">Education & Career</h3>
                <span className="text-xs text-muted">Expand/Collapse</span>
              </summary>
              <div className="grid sm:grid-cols-2 gap-4">
                {p.education && (
                  <div className="bg-surface rounded-xl p-4">
                    <p className="text-xs text-sand/95 mb-1">Education</p>
                    <p className="text-gold-300">{p.education}</p>
                  </div>
                )}
                {p.profession && (
                  <div className="bg-surface rounded-xl p-4">
                    <p className="text-xs text-sand/95 mb-1">Profession</p>
                    <p className="text-gold-300">{p.profession}</p>
                  </div>
                )}
                {p.income && (
                  <div className="bg-surface rounded-xl p-4">
                    <p className="text-xs text-sand/95 mb-1">Income</p>
                    <p className="text-gold-300">{formatIncome(p.income)}</p>
                  </div>
                )}
              </div>
            </details>

            {/* Physical Profile */}
            {(p.height_cm || p.weight_kg || p.complexion || p.body_type) && (
              <details className="card p-6" open>
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-gold-400">Physical Profile</h3>
                  <span className="text-xs text-muted">Expand/Collapse</span>
                </summary>
                <div className="grid sm:grid-cols-2 gap-4">
                  {p.height_cm && (
                    <div className="bg-surface rounded-xl p-4">
                      <p className="text-xs text-sand/95 mb-1">Height</p>
                      <p className="text-gold-300">{formatHeight(p.height_cm)}</p>
                    </div>
                  )}
                  {p.weight_kg && (
                    <div className="bg-surface rounded-xl p-4">
                      <p className="text-xs text-sand/95 mb-1">Weight</p>
                      <p className="text-gold-300">{p.weight_kg} kg</p>
                    </div>
                  )}
                  {p.complexion && (
                    <div className="bg-surface rounded-xl p-4">
                      <p className="text-xs text-sand/95 mb-1">Complexion</p>
                      <p className="text-gold-300">{p.complexion}</p>
                    </div>
                  )}
                  {p.body_type && (
                    <div className="bg-surface rounded-xl p-4">
                      <p className="text-xs text-sand/95 mb-1">Body Type</p>
                      <p className="text-gold-300">{p.body_type}</p>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Partner Requirements */}
            {p.requirements && (
              <details className="card p-6" open>
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-gold-400">Partner Preferences</h3>
                  <span className="text-xs text-muted">Expand/Collapse</span>
                </summary>
                <p className="text-sand/70 leading-relaxed">{p.requirements}</p>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}