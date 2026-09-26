const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function postChallenge(path, body) {
  const res = await fetch(`${API_BASE}/api/challenge/${path}`, {
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
