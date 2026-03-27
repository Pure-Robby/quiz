import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const authRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL

export const ALLOWED_EMAIL_DOMAIN = 'puresurvey.co.za'
export const LEADERBOARD_OWNER_EMAIL = 'robby@puresurvey.co.za'

export const supabase = url && anonKey
  ? createClient(url, anonKey)
  : null

export function isAllowedEmail(email) {
  if (!email || typeof email !== 'string') return false
  return email.toLowerCase().trim().endsWith('@' + ALLOWED_EMAIL_DOMAIN)
}

export function isLeaderboardOwner(email) {
  return String(email || '').toLowerCase().trim() === LEADERBOARD_OWNER_EMAIL
}

export async function signInWithGoogle() {
  if (!supabase) return { error: new Error('Supabase not configured') }
  const defaultRedirect = window.location.origin + '/'
  const redirectTo = import.meta.env.DEV ? defaultRedirect : (authRedirectUrl || defaultRedirect)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) return { error }
  if (data?.url) window.location.href = data.url
  return { data }
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

export function getDisplayNameFromUser(user) {
  if (!user) return 'Anonymous'
  const name = user.user_metadata?.full_name || user.user_metadata?.name
  if (name && name.trim()) return name.trim()
  const email = user.email || ''
  const local = email.split('@')[0]
  if (local) return local
  return 'Anonymous'
}

export async function submitAttempt({ userId, displayName, score, total, gaveUp = false, answersJson = null }) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      display_name: displayName,
      score,
      total,
      gave_up: gaveUp,
      answers_json: answersJson,
    })
    .select('id, created_at')
    .single()
  if (error) return { error }
  return { data }
}

export async function getLeaderboard(limit = 50) {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id, display_name, score, total, gave_up, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) return { data: [], error }
  const withRank = (data || []).map((row, i) => ({ ...row, rank: i + 1 }))
  return { data: withRank, error: null }
}

export async function clearAllResults() {
  if (!supabase) return { error: new Error('Supabase not configured') }
  const user = await getCurrentUser()
  if (!isLeaderboardOwner(user?.email)) {
    return { error: new Error('Not authorized to clear all results') }
  }
  const { data, error } = await supabase.rpc('clear_all_quiz_results')
  if (error) return { error }
  return { error: null, deletedCount: Number(data || 0) }
}

export function findRankInLeaderboard(leaderboard, { score, displayName, created_at }) {
  const idx = (leaderboard || []).findIndex(
    (r) => r.score === score && r.display_name === displayName && r.created_at === created_at
  )
  return idx >= 0 ? idx + 1 : null
}
