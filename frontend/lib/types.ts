// Kompete — TypeScript type definitions
// These mirror the backend Pydantic schemas exactly.

export interface SwotData {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface FinancialSnapshot {
  revenue: string
  valuation: string
  growth: string
  funding: string
}

export interface ReportData {
  company: string
  executive_summary: string
  swot: SwotData
  financial_snapshot: FinancialSnapshot
  sentiment_score: number   // 1–10
  key_insights: string[]
  strategic_recommendations: string[]
  competitive_threats: string[]
  data_sources: string[]
}

export type JobStatus = 'idle' | 'starting' | 'running' | 'done' | 'error'

export interface ResearchProgress {
  started: boolean
  news_done: boolean
  financials_done: boolean
  reviews_done: boolean
  social_done: boolean
  synthesizing: boolean
  synthesis_done: boolean
}
