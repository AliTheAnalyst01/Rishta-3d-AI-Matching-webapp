'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signup, setAuthToken, UserAuthPayload } from '@/lib/api'

const sectOptions = ['Shia', 'Sunni', 'Ahl-E-Hadees', 'Deobandi', 'Other']
const maritalOptions = ['Unmarried', 'Nikha Break Only', 'Divorced', 'Khula', 'Widow', 'Married Looking for 2nd']
const complexionOptions = ['White', 'Fair', 'Light Brown', 'Brown', 'Dark Brown', 'Other']
const bodyTypeOptions = ['Slim', 'Average', 'Athletic', 'Healthy', 'Heavy', 'Other']
const nationalityOptions = ['Pakistani Only', 'Dual Nationality', 'Visa Only', 'PR']
const familyStatusOptions = ['Middle Class', 'Upper Middle Class', 'Elite Class', 'Other']
const professionOptions = ['Private Job', 'Government Job', 'Business', 'Doctor', 'Engineer', 'Teacher', 'Student', 'Other']
const educationOptions = ['Matric', 'Intermediate', 'Bachelors', 'Masters', 'MPhil', 'PhD', 'Religious Education', 'Other']
const relationOptions = ['Self', 'Father', 'Mother', 'Brother', 'Sister', 'Guardian', 'Other']

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<UserAuthPayload>({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'Male',
    marital_status: '',
    kids_info: '',
    caste: '',
    sect: 'Shia',
    dob: '',
    height: '',
    weight: '',
    body_type: '',
    complexion: '',
    education: '',
    profession: '',
    job_income: '',
    family_status: '',
    parents_profession: '',
    siblings: '',
    nationality: 'Pakistani Only',
    address: '',
    city_country: '',
    demand_requirements: '',
    remarks: '',
    photo_url: '',
    relation_with_person: '',
    affidavit_agreed: true,
    agreement_allowed: true,
  })

  const set = (k: keyof UserAuthPayload, v: any) => setForm((p) => ({ ...p, [k]: v }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await signup(form)
      localStorage.setItem('auth_token', res.token)
      setAuthToken(res.token)
      router.push('/proposals')
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-10">
      <div className="app-container max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-serif mb-2">Create Your Profile / رجسٹریشن</h1>
          <p className="text-muted max-w-2xl mx-auto">Tell us your details once. We will show personalized proposals according to your preferences.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="trust-chip">Step 1: Basic</span>
            <span className="trust-chip">Step 2: Personal</span>
            <span className="trust-chip">Step 3: Family</span>
            <span className="trust-chip">Step 4: Preferences</span>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <section className="card p-4 md:p-5">
              <h2 className="font-serif text-xl mb-1">Account Details / اکاؤنٹ تفصیل</h2>
              <p className="text-xs text-muted mb-4">Used for secure login and profile identification.</p>
              <div className="grid md:grid-cols-2 gap-3">
                <input className="input" placeholder="Name / نام" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
                <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
                <input className="input" placeholder="Phone / رابطہ نمبر" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => set('password', e.target.value)} required />
              </div>
            </section>

            <section className="card p-4 md:p-5">
              <h2 className="font-serif text-xl mb-1">Personal Information / ذاتی معلومات</h2>
              <p className="text-xs text-muted mb-4">Tell us your basic profile details.</p>
              <div className="grid md:grid-cols-2 gap-3">
                <select className="select-field" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                  <option value="Male">Male</option><option value="Female">Female</option>
                </select>
                <select className="select-field" value={form.marital_status || ''} onChange={(e) => set('marital_status', e.target.value)}>
                  <option value="">Marital Status / ازدواجی حیثیت</option>
                  {maritalOptions.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <input className="input" placeholder="Kids Info (if any) / بچوں کی تفصیل" value={form.kids_info || ''} onChange={(e) => set('kids_info', e.target.value)} />
                <input className="input" placeholder="Caste / ذات" value={form.caste || ''} onChange={(e) => set('caste', e.target.value)} />
                <select className="select-field" value={form.sect || ''} onChange={(e) => set('sect', e.target.value)}>
                  {sectOptions.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <input className="input" type="date" value={form.dob || ''} onChange={(e) => set('dob', e.target.value)} />
                <input className="input" placeholder="Height (Feet/Inches)" value={form.height || ''} onChange={(e) => set('height', e.target.value)} />
                <input className="input" placeholder="Weight / وزن" value={form.weight || ''} onChange={(e) => set('weight', e.target.value)} />
                <select className="select-field" value={form.body_type || ''} onChange={(e) => set('body_type', e.target.value)}>
                  <option value="">Body Type / جسمانی ساخت</option>
                  {bodyTypeOptions.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <select className="select-field" value={form.complexion || ''} onChange={(e) => set('complexion', e.target.value)}>
                  <option value="">Complexion / رنگت</option>
                  {complexionOptions.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
            </section>

            <section className="card p-4 md:p-5">
              <h2 className="font-serif text-xl mb-1">Education & Family / تعلیم اور خاندان</h2>
              <p className="text-xs text-muted mb-4">These details improve match quality.</p>
              <div className="grid md:grid-cols-2 gap-3">
                <select className="select-field" value={form.education || ''} onChange={(e) => set('education', e.target.value)}>
                  <option value="">Education / تعلیم</option>
                  {educationOptions.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <select className="select-field" value={form.profession || ''} onChange={(e) => set('profession', e.target.value)}>
                  <option value="">Profession / پیشہ</option>
                  {professionOptions.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <input className="input" placeholder="Job/Business + Income" value={form.job_income || ''} onChange={(e) => set('job_income', e.target.value)} />
                <input className="input" placeholder="Parents Profession / والدین کا پیشہ" value={form.parents_profession || ''} onChange={(e) => set('parents_profession', e.target.value)} />
                <input className="input" placeholder="Siblings / بہن بھائی" value={form.siblings || ''} onChange={(e) => set('siblings', e.target.value)} />
                <select className="select-field" value={form.nationality || ''} onChange={(e) => set('nationality', e.target.value)}>
                  {nationalityOptions.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <input className="input" placeholder="Current City & Country" value={form.city_country || ''} onChange={(e) => set('city_country', e.target.value)} />
                <input className="input" placeholder="Address / پتہ" value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
              </div>
              <select className="select-field mt-3" value={form.family_status || ''} onChange={(e) => set('family_status', e.target.value)}>
                <option value="">Family Status / خاندانی حیثیت</option>
                {familyStatusOptions.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </section>

            <section className="card p-4 md:p-5">
              <h2 className="font-serif text-xl mb-1">Match Preferences / ضروریات</h2>
              <p className="text-xs text-muted mb-4">Clearly write expectations for better proposals.</p>
              <div className="grid md:grid-cols-2 gap-3">
                <input className="input" placeholder="Photo URL (optional)" value={form.photo_url || ''} onChange={(e) => set('photo_url', e.target.value)} />
                <select className="select-field" value={form.relation_with_person || ''} onChange={(e) => set('relation_with_person', e.target.value)}>
                  <option value="">Relation with Person / رشتہ</option>
                  {relationOptions.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <textarea className="input min-h-[100px] mt-3" placeholder="Demand/Requirements / ضروریات" value={form.demand_requirements || ''} onChange={(e) => set('demand_requirements', e.target.value)} />
              <textarea className="input min-h-[80px] mt-3" placeholder="Remarks / اضافی نوٹ" value={form.remarks || ''} onChange={(e) => set('remarks', e.target.value)} />
            </section>

            <section className="card p-4 md:p-5">
              <h2 className="font-serif text-xl mb-1">Consent / معاہدہ</h2>
              <p className="text-xs text-muted mb-3">Please confirm both declarations.</p>
              <label className="flex items-center gap-2 text-sm text-muted mb-2"><input type="checkbox" checked={form.affidavit_agreed} onChange={(e) => set('affidavit_agreed', e.target.checked)} /> Affidavit accepted / بیان حلفی منظور</label>
              <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={form.agreement_allowed} onChange={(e) => set('agreement_allowed', e.target.checked)} /> Agreement allowed / معاہدہ منظور</label>
            </section>

            {error && <p className="text-sm text-red-400">{error}</p>}
            <button className="btn-primary w-full py-3 text-base" disabled={loading}>{loading ? 'Creating profile...' : 'Create Account & See Proposals'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
