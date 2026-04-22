import axios from 'axios'

function normalizeApiBase(url?: string): string {
  const raw = (url || 'http://localhost:8000').trim().replace(/\/+$/, '')
  return raw.endsWith('/api') ? raw : `${raw}/api`
}

function resolveApiBase(): string {
  // Server-side requests inside Docker must use service DNS, not localhost.
  const serverSide = typeof window === 'undefined'
  const internal = process.env.INTERNAL_API_URL
  const publicUrl = process.env.NEXT_PUBLIC_API_URL
  return normalizeApiBase(serverSide ? internal || publicUrl : publicUrl)
}

const API_BASE = resolveApiBase()

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  proxy: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types matching backend schemas
export interface Profile {
  id: number
  reg_no: string
  name: string | null
  gender: string | null
  sect: string | null
  caste: string | null
  marital_status: string | null
  no_of_kids: number | null
  age: number | null
  dob: string | null
  height_cm: number | null
  weight_kg: number | null
  complexion: string | null
  body_type: string | null
  education: string | null
  profession: string | null
  income: number | null
  family_status: string | null
  city: string | null
  country: string | null
  nationality: string | null
  requirements: string | null
  photo_url: string | null
  category: string | null
  is_active: boolean
}

export interface ProfileSummary {
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

export interface ProfileFilters {
  gender?: string
  sect?: string
  caste?: string
  city?: string
  category?: string
  min_age?: number
  max_age?: number
  search?: string
}

export interface AnalyticsStats {
  total_profiles: number
  female_count: number
  male_count: number
  avg_age: number | null
  top_cities: { city: string; count: number }[]
  sect_breakdown: Record<string, number>
  marital_status_breakdown: Record<string, number>
  category_breakdown: Record<string, number>
  age_distribution: { bucket: string; count: number }[]
}

export interface MatchResult {
  profile_id: number
  reg_no: string | null
  name: string | null
  gender: string | null
  age: number | null
  city: string | null
  education: string | null
  profession: string | null
  income: number | null
  sect: string | null
  caste: string | null
  category: string | null
  marital_status: string | null
  photo_url: string | null
  score: number | null
  reasoning: string | null
}

export interface MatchRequest {
  seeking_gender?: string
  min_age?: number
  max_age?: number
  sect?: string
  caste?: string
  city?: string
  education_level?: string
  profession?: string
  category?: string
}

// API functions
export async function getProfiles(filters: ProfileFilters = {}, page = 0, limit = 24): Promise<ProfileSummary[]> {
  const params = new URLSearchParams()
  if (filters.gender) params.set('gender', filters.gender)
  if (filters.sect) params.set('sect', filters.sect)
  if (filters.caste) params.set('caste', filters.caste)
  if (filters.city) params.set('city', filters.city)
  if (filters.category) params.set('category', filters.category)
  if (filters.min_age) params.set('min_age', String(filters.min_age))
  if (filters.max_age) params.set('max_age', String(filters.max_age))
  if (filters.search) params.set('search', filters.search)
  params.set('skip', String(page * limit))
  params.set('limit', String(limit))
  
  const { data } = await api.get<ProfileSummary[]>(`/profiles?${params}`)
  return data
}

export async function getProfileCount(filters: ProfileFilters = {}): Promise<number> {
  const params = new URLSearchParams()
  if (filters.gender) params.set('gender', filters.gender)
  if (filters.sect) params.set('sect', filters.sect)
  if (filters.caste) params.set('caste', filters.caste)
  if (filters.city) params.set('city', filters.city)
  if (filters.category) params.set('category', filters.category)
  if (filters.min_age) params.set('min_age', String(filters.min_age))
  if (filters.max_age) params.set('max_age', String(filters.max_age))
  if (filters.search) params.set('search', filters.search)
  
  const { data } = await api.get<{ total: number }>(`/profiles/count?${params}`)
  return data.total
}

export async function getProfile(id: number): Promise<Profile> {
  const { data } = await api.get<Profile>(`/profiles/${id}`)
  return data
}

export async function getAnalytics(): Promise<AnalyticsStats> {
  const { data } = await api.get<AnalyticsStats>('/analytics/')
  return data
}

export async function getMatchScores(request: MatchRequest): Promise<{ matches: MatchResult[]; candidates_considered: number }> {
  try {
    const { data } = await api.post<{ matches: MatchResult[]; candidates_considered: number }>(
      '/match/score',
      request,
      { timeout: 120000 }
    )
    return data
  } catch (error: any) {
    if (error?.code === 'ECONNABORTED') {
      throw new Error('AI matching is taking longer than expected. Please try again with fewer filters.')
    }
    const detail = error?.response?.data?.detail
    if (typeof detail === 'string' && detail.trim()) {
      throw new Error(detail)
    }
    throw error
  }
}

export async function checkMatchHealth(): Promise<{ status: string; service: string }> {
  try {
    const { data } = await api.get('/match/health')
    return data
  } catch {
    return { status: 'unavailable', service: 'ollama' }
  }
}

export interface ChatRequestPayload {
  message: string
  history: { role: 'user' | 'assistant'; content: string }[]
}

export interface ChatResponsePayload {
  reply: string
  language: string
  profiles_found: number
}

export interface AdminPipelineStatus {
  current?: {
    status?: string
    finished_at?: string | null
    stats?: { success?: number; errors?: number }
  }
  recent_logs?: Array<{
    id: number
    status: string
    started_at: string
    success: number
    errors: number
  }>
}

export interface UserAuthPayload {
  full_name: string
  email: string
  phone?: string
  password: string
  gender: string
  marital_status?: string
  kids_info?: string
  caste?: string
  sect?: string
  dob?: string
  height?: string
  weight?: string
  body_type?: string
  complexion?: string
  education?: string
  profession?: string
  job_income?: string
  family_status?: string
  parents_profession?: string
  siblings?: string
  nationality?: string
  address?: string
  city_country?: string
  demand_requirements?: string
  remarks?: string
  photo_url?: string
  relation_with_person?: string
  affidavit_agreed: boolean
  agreement_allowed: boolean
}

export interface AuthUser {
  id: number
  full_name: string
  email: string
  phone?: string | null
  gender: string
  marital_status?: string | null
  caste?: string | null
  sect?: string | null
  city_country?: string | null
  demand_requirements?: string | null
}

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export async function signup(payload: UserAuthPayload): Promise<{ token: string; user: AuthUser }> {
  const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/signup', payload)
  return data
}

export async function login(payload: { email: string; password: string }): Promise<{ token: string; user: AuthUser }> {
  const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/login', payload)
  return data
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me')
  return data
}

export async function getPersonalizedProposals(skip = 0, limit = 20): Promise<{ total: number; results: ProfileSummary[] }> {
  const { data } = await api.get<{ total: number; results: ProfileSummary[] }>(`/auth/proposals?skip=${skip}&limit=${limit}`)
  return data
}

export async function getMatchHealth(): Promise<{ status: string; service: string; model?: string; model_ready?: boolean }> {
  const { data } = await api.get('/match/health')
  return data
}

export async function sendChatMessage(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  const { data } = await api.post<ChatResponsePayload>('/chat/', payload)
  return data
}

export async function getAdminPipelineStatus(): Promise<AdminPipelineStatus> {
  const { data } = await api.get<AdminPipelineStatus>('/admin/pipeline-status')
  return data
}

export async function triggerAdminSync(): Promise<{ status: string; stats?: Record<string, number> }> {
  const { data } = await api.post<{ status: string; stats?: Record<string, number> }>('/admin/sync')
  return data
}

export default api