// In dev with Vite proxy or production with nginx, relative requests '/api' are preferred
const API_BASE = import.meta.env.VITE_API_URL || ''

async function postChallenge(path, body) {
  const url = `${API_BASE}/api/challenge/${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data
}

export function runErrorBased(mode, productId) {
  return postChallenge('error-based', { mode, product_id: productId })
}

export function runUnionBased(mode, search) {
  return postChallenge('union-based', { mode, search })
}

export function runBlindBoolean(mode, username, password) {
  return postChallenge('blind-boolean', { mode, username, password })
}

export function runBlindTime(mode, username) {
  return postChallenge('blind-time', { mode, username })
}

export async function fetchChallenges() {
  const res = await fetch(`${API_BASE}/api/challenges`)
  return res.json()
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`)
  return res.json()
}

export async function fetchSchema() {
  const res = await fetch(`${API_BASE}/api/schema`)
  return res.json()
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/api/reset-db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return res.json()
}
