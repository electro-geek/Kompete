const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

function headers(secret) {
  return {
    'Content-Type': 'application/json',
    'X-Admin-Secret': secret,
  }
}

export async function login(secret) {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret }),
  })
  if (!res.ok) throw new Error('Invalid admin secret')
  return res.json()
}

export async function getStats(secret) {
  const res = await fetch(`${BASE_URL}/admin/stats`, { headers: headers(secret) })
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export async function getUsers(secret) {
  const res = await fetch(`${BASE_URL}/admin/users`, { headers: headers(secret) })
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function getUserReports(secret, userId) {
  const res = await fetch(`${BASE_URL}/admin/users/${encodeURIComponent(userId)}/reports`, {
    headers: headers(secret),
  })
  if (!res.ok) throw new Error('Failed to fetch user reports')
  return res.json()
}

export async function getAllReports(secret) {
  const res = await fetch(`${BASE_URL}/admin/reports`, { headers: headers(secret) })
  if (!res.ok) throw new Error('Failed to fetch reports')
  return res.json()
}

export async function deleteUser(secret, userId) {
  const res = await fetch(`${BASE_URL}/admin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: headers(secret),
  })
  if (!res.ok) throw new Error('Failed to delete user')
  return res.json()
}

export async function resetUserLimit(secret, userId) {
  const res = await fetch(`${BASE_URL}/admin/users/${encodeURIComponent(userId)}/reset-limit`, {
    method: 'POST',
    headers: headers(secret),
  })
  if (!res.ok) throw new Error('Failed to reset limit')
  return res.json()
}

export async function deleteReport(secret, userId, company) {
  const res = await fetch(
    `${BASE_URL}/admin/users/${encodeURIComponent(userId)}/reports/${encodeURIComponent(company)}`,
    { method: 'DELETE', headers: headers(secret) }
  )
  if (!res.ok) throw new Error('Failed to delete report')
  return res.json()
}

export async function getActivity(secret, days = 30) {
  const res = await fetch(`${BASE_URL}/admin/activity?days=${days}`, { headers: headers(secret) })
  if (!res.ok) throw new Error('Failed to fetch activity')
  return res.json()
}
