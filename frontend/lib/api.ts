// Kompete — API client
// All fetch calls to the FastAPI backend go through this module.

import { ReportData } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function getHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * Start a research job for the given company.
 * Returns immediately with the job_id.
 */
export async function startResearch(company: string, token?: string | null): Promise<{ job_id: string; status: string }> {
  const res = await fetch(`${API_URL}/research`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ company }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  return res.json()
}

export async function saveUserApiKey(apiKey: string, token?: string | null): Promise<void> {
  const res = await fetch(`${API_URL}/user/settings`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ api_key: apiKey }),
  })
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
}

/**
 * Fetch the full report JSON for a completed research job.
 * Throws if the report is not ready yet or doesn't exist.
 */
export async function fetchReport(company: string, token?: string | null): Promise<ReportData> {
  const res = await fetch(`${API_URL}/report/${encodeURIComponent(company.toLowerCase())}`, {
    headers: getHeaders(token),
  })

  if (res.status === 202) {
    throw new Error('Report is still being generated. Please wait.')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  return res.json()
}

/**
 * Fetch all reports created by the current user.
 */
export async function fetchUserReports(token?: string | null): Promise<any[]> {
  const res = await fetch(`${API_URL}/reports`, {
    headers: getHeaders(token),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  return res.json()
}

/**
 * Returns the URL to download the PDF for a completed report.
 */
export function getPdfDownloadUrl(company: string, token?: string | null): string {
  let url = `${API_URL}/download/${encodeURIComponent(company.toLowerCase())}`
  if (token) {
    url += `?token=${encodeURIComponent(token)}`
  }
  return url
}

/**
 * Returns the SSE stream URL for a company research job.
 */
export function getStreamUrl(company: string, token?: string | null): string {
  let url = `${API_URL}/stream/${encodeURIComponent(company.toLowerCase())}`
  if (token) {
    url += `?token=${encodeURIComponent(token)}`
  }
  return url
}

