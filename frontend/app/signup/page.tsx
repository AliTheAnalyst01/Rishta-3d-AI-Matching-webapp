'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signup, UserAuthPayload } from '@/lib/api'
import { useAuth } from '@/components/ui/AuthProvider'

type FormData = Omit<UserAuthPayload, 'affidavit_agreed' | 'agreement_allowed'>

const INITIAL: FormData = {
  full_name: '', email: '', phone: '', password: '',
  gender: '', marital_status: 'Single', caste: '', sect: '',
  dob: '', height: '', weight: '', body_type: '', complexion: '',
  education: '', profession: '', job_income: '',
  family_status: '', parents_profession: '', siblings: '',
  nationality: 'Pakistani', address: '', city_country: '',
  demand_requirements: '', remarks: '', photo_url: '',
  relation_with_person: 'Self', kids_info: '',
}

const STEPS = [
  {
    title: 'Account Details',
    subtitle: 'Set up your login credentials',
    fields: ['full_name', 'email', 'phone', 'password'],
  },
  {
    title: 'Personal Details',
    subtitle: 'Tell us about yourself',
    fields: ['gender', 'dob', 'marital_status', 'sect', 'caste', 'nationality', 'city_country'],
  },
  {
    title: 'Education & Career',
    subtitle: 'Your academic and professional background',
    fields: ['education', 'profession', 'job_income', 'family_status'],
  },
  {
    title: 'Partner Requirements',
    subtitle: 'What are you looking for?',
    fields: ['demand_requirements', 'remarks', 'relation_with_person'],
  },
  {
    title: 'Review & Submit',
    subtitle: 'Confirm your details and create your profile',
    fields: [],
  },
]

export default function SignupPage() {
  const router = useRouter()
  const { login: setAuth } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  const inputCls  = 'input text-sm'
  const selectCls = 'select-field text-sm'
  const labelCls  = 'block text-sm font-semibold mb-1.5'

  const handleSubmit = async () => {
    if (!agreed) { setError('Please agree to the terms before submitting.'); return }
    setLoading(true); setError('')
    try {
      const payload: UserAuthPayload = { ...form, affidavit_agreed: agreed, agreement_allowed: agreed }
      const { token, user } = await signup(payload)
      setAuth(token, user)
      router.push('/proposals')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 0) return form.full_name && form.email && form.password && form.password.length >= 6
    if (step === 1) return form.gender && form.city_country
    return true
  }

  const renderFields = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <Field label="Full Name *">
            <input className={inputCls} placeholder="Your full name" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
          </Field>
          <Field label="Email Address *">
            <input className={inputCls} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
          </Field>
          <Field label="Phone Number">
            <input className={inputCls} type="tel" placeholder="+92 300 0000000" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} />
          </Field>
          <Field label="Password * (min 6 characters)">
            <input className={inputCls} type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="Submitted by (relationship to profile)">
            <select className={selectCls} value={form.relation_with_person ?? ''} onChange={e => set('relation_with_person', e.target.value)}>
              {['Self','Father','Mother','Brother','Sister','Guardian'].map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>
        </div>
      )
      case 1: return (
        <div className="space-y-4">
          <Field label="I am a * ">
            <div className="grid grid-cols-2 gap-2">
              {['Male','Female'].map(g => (
                <button key={g} type="button" onClick={() => set('gender', g)}
                  className="py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: form.gender === g ? 'var(--rose-pale)' : 'var(--bg-elev)',
                    border: form.gender === g ? '2px solid var(--rose)' : '1.5px solid var(--stone)',
                    color: form.gender === g ? 'var(--rose-dark)' : 'var(--charcoal)',
                    fontWeight: form.gender === g ? 600 : 400,
                  }}>
                  {g === 'Female' ? '♀ Bride' : '♂ Groom'}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date of Birth">
              <input className={inputCls} type="date" value={form.dob ?? ''} onChange={e => set('dob', e.target.value)} />
            </Field>
            <Field label="Marital Status">
              <select className={selectCls} value={form.marital_status ?? ''} onChange={e => set('marital_status', e.target.value)}>
                {['Single','Divorced','Widowed','Nikkah only'].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sect">
              <select className={selectCls} value={form.sect ?? ''} onChange={e => set('sect', e.target.value)}>
                <option value="">Select</option>
                <option>Sunni</option><option>Shia</option>
              </select>
            </Field>
            <Field label="Caste / Biradari">
              <input className={inputCls} placeholder="e.g. Syed, Rajput…" value={form.caste ?? ''} onChange={e => set('caste', e.target.value)} />
            </Field>
          </div>
          <Field label="City & Country *">
            <input className={inputCls} placeholder="e.g. Lahore, Pakistan" value={form.city_country ?? ''} onChange={e => set('city_country', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nationality">
              <input className={inputCls} placeholder="Pakistani" value={form.nationality ?? ''} onChange={e => set('nationality', e.target.value)} />
            </Field>
            <Field label="Height">
              <input className={inputCls} placeholder="e.g. 5'6&quot;" value={form.height ?? ''} onChange={e => set('height', e.target.value)} />
            </Field>
          </div>
        </div>
      )
      case 2: return (
        <div className="space-y-4">
          <Field label="Education">
            <input className={inputCls} placeholder="e.g. MBBS, King Edward Medical University" value={form.education ?? ''} onChange={e => set('education', e.target.value)} />
          </Field>
          <Field label="Profession">
            <input className={inputCls} placeholder="e.g. Doctor, Engineer, Lawyer…" value={form.profession ?? ''} onChange={e => set('profession', e.target.value)} />
          </Field>
          <Field label="Monthly Income (PKR)">
            <input className={inputCls} placeholder="e.g. 150000" type="number" value={form.job_income ?? ''} onChange={e => set('job_income', e.target.value)} />
          </Field>
          <Field label="Family Status">
            <select className={selectCls} value={form.family_status ?? ''} onChange={e => set('family_status', e.target.value)}>
              <option value="">Select</option>
              {['Upper Class','Upper Middle Class','Middle Class','Lower Middle Class'].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Parents' Profession">
            <input className={inputCls} placeholder="e.g. Father: Doctor, Mother: Teacher" value={form.parents_profession ?? ''} onChange={e => set('parents_profession', e.target.value)} />
          </Field>
          <Field label="Siblings">
            <input className={inputCls} placeholder="e.g. 2 brothers, 1 sister" value={form.siblings ?? ''} onChange={e => set('siblings', e.target.value)} />
          </Field>
        </div>
      )
      case 3: return (
        <div className="space-y-4">
          <Field label="Partner Requirements">
            <textarea
              className={inputCls}
              rows={4}
              placeholder="Describe your ideal partner — age, education, profession, values, city preference, etc."
              value={form.demand_requirements ?? ''}
              onChange={e => set('demand_requirements', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </Field>
          <Field label="Additional Remarks">
            <textarea
              className={inputCls}
              rows={3}
              placeholder="Anything else you'd like to share about yourself or your family…"
              value={form.remarks ?? ''}
              onChange={e => set('remarks', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </Field>
        </div>
      )
      case 4: return (
        <div className="space-y-5">
          <div className="card p-5 space-y-3 text-sm">
            <ReviewRow label="Name"       value={form.full_name} />
            <ReviewRow label="Email"      value={form.email} />
            <ReviewRow label="Gender"     value={form.gender} />
            <ReviewRow label="City"       value={form.city_country ?? ''} />
            <ReviewRow label="Sect"       value={form.sect ?? ''} />
            <ReviewRow label="Education"  value={form.education ?? ''} />
            <ReviewRow label="Profession" value={form.profession ?? ''} />
          </div>

          {/* Affidavit */}
          <div className="rounded-xl p-4 text-sm leading-relaxed"
            style={{ background: 'var(--gold-pale)', border: '1.5px solid oklch(87% 0.08 75)', color: 'oklch(38% 0.12 75)' }}>
            <strong className="block mb-1">Affidavit & Agreement</strong>
            I confirm that the information provided is truthful and accurate. I agree to use
            RishtaConnect respectfully and in accordance with Islamic matrimonial etiquette.
            I understand that providing false information may result in account suspension.
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-rose-500 shrink-0" />
            <span className="text-sm text-muted">
              I agree to the <span style={{ color: 'var(--rose)' }}>terms of service</span> and{' '}
              <span style={{ color: 'var(--rose)' }}>privacy policy</span>, and confirm all information is accurate.
            </span>
          </label>
        </div>
      )
      default: return null
    }
  }

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 font-serif text-2xl font-bold text-white"
            style={{ background: 'var(--rose)', boxShadow: '0 8px 24px oklch(55% 0.18 10 / 0.3)' }}>
            R
          </div>
          <h1 className="font-serif text-3xl font-semibold mb-1">Create Your Profile</h1>
          <p className="text-muted text-sm">Join thousands of families on RishtaConnect</p>
        </div>

        {/* Step progress */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? 'var(--rose)' : 'var(--stone)' }} />
          ))}
        </div>

        {/* Card */}
        <div className="card p-7 rounded-3xl" style={{ boxShadow: '0 20px 60px oklch(18% 0.01 60 / 0.1)' }}>
          <div className="mb-6">
            <h2 className="font-serif text-xl font-semibold">{STEPS[step].title}</h2>
            <p className="text-muted text-sm mt-0.5">{STEPS[step].subtitle}</p>
          </div>

          {renderFields()}

          {error && (
            <div className="mt-4 rounded-xl px-4 py-3 text-sm"
              style={{ background: 'oklch(95% 0.04 15)', color: 'var(--rose-dark)', border: '1.5px solid oklch(88% 0.06 10)' }}>
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button type="button" className="btn-muted flex-1 py-3 justify-center" onClick={() => setStep(s => s - 1)}>
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn-primary flex-1 py-3 justify-center"
                disabled={!canProceed()}
                onClick={() => setStep(s => s + 1)}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary flex-1 py-3.5 justify-center text-base"
                disabled={loading || !agreed}
                onClick={handleSubmit}
              >
                {loading ? 'Creating Profile…' : 'Create My Profile'}
              </button>
            )}
          </div>

          <div className="text-center mt-5">
            <span className="text-muted text-sm">Already registered? </span>
            <Link href="/login" className="text-sm font-semibold" style={{ color: 'var(--rose)' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-1 border-b border-base last:border-0">
      <span className="text-muted w-28 shrink-0 text-xs">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  )
}
