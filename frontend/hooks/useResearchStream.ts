'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStreamUrl } from '@/lib/api'
import { ResearchProgress } from '@/lib/types'

import { useAuth } from '@/context/AuthContext'

const DEFAULT_PROGRESS: ResearchProgress = {
  started: false,
  news_done: false,
  financials_done: false,
  reviews_done: false,
  social_done: false,
  synthesizing: false,
  synthesis_done: false,
}

export function useResearchStream(company: string) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<ResearchProgress>(DEFAULT_PROGRESS)
  const [error, setError] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(false)
  const router = useRouter()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!company) return

    const url = getStreamUrl(company, user?.token)
    const es = new EventSource(url)
    esRef.current = es

    es.onmessage = (ev: MessageEvent) => {
      const event = ev.data as string

      setProgress((prev) => {
        const next = { ...prev }
        if (event === 'started') next.started = true
        if (event === 'news_done') next.news_done = true
        if (event === 'financials_done') next.financials_done = true
        if (event === 'reviews_done') next.reviews_done = true
        if (event === 'social_done') next.social_done = true
        if (event === 'synthesizing') next.synthesizing = true
        if (event === 'synthesis_done') next.synthesis_done = true
        return next
      })

      if (event === 'synthesis_done' || event === 'done') {
        setIsDone(true)
        es.close()
        // Navigate to the report page
        setTimeout(() => {
          router.push(`/report/${encodeURIComponent(company.toLowerCase())}`)
        }, 800)
      }

      if (event.startsWith('error:')) {
        setError(event.replace('error:', ''))
        es.close()
      }

      if (event === 'stream_closed') {
        es.close()
      }
    }

    es.onerror = () => {
      setError('Connection to research stream lost. Please try refreshing.')
      es.close()
    }

    return () => {
      es.close()
    }
  }, [company, router])

  return { progress, error, isDone }
}
