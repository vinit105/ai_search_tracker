import React from 'react'
import { supabaseServer } from '../../../../../lib/supabaseServer'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = { 
  params: { 
    id: string
    keyword: string
  } 
}

async function getKeywordChecks(projectId: string, keyword: string) {
  const { data } = await supabaseServer
    .from('checks')
    .select('*')
    .eq('project_id', projectId)
    .eq('keyword', decodeURIComponent(keyword))
    .order('timestamp', { ascending: true })
  return data || []
}

async function getProject(projectId: string) {
  const { data } = await supabaseServer.from('projects').select('*').eq('id', projectId).single()
  return data
}

export default async function KeywordDetailPage({ params }: Props) {
  const { id, keyword } = params
  const decodedKeyword = decodeURIComponent(keyword)
  
  const [checks, project] = await Promise.all([
    getKeywordChecks(id, keyword),
    getProject(id)
  ])

  if (!checks.length) {
    notFound()
  }

  // Group by engine
  const engines = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity']
  const engineData = engines.map(engine => {
    const engineChecks = checks.filter(c => c.engine === engine)
    const latestCheck = engineChecks[engineChecks.length - 1]
    const presenceCount = engineChecks.filter(c => c.presence).length
    const presenceRate = Math.round((presenceCount / engineChecks.length) * 100)
    
    return {
      engine,
      presenceRate,
      latestPresence: latestCheck?.presence || false,
      latestPosition: latestCheck?.position,
      latestSnippet: latestCheck?.answer_snippet,
      citationsCount: latestCheck?.citations_count || 0,
      observedUrls: latestCheck?.observed_urls || []
    }
  })

  // Trend data by day
  const byDay: Record<string, { date: string; present: number; total: number }> = {}
  checks.forEach(c => {
    const day = new Date(c.timestamp).toISOString().slice(0, 10)
    if (!byDay[day]) byDay[day] = { date: day, present: 0, total: 0 }
    byDay[day].total++
    if (c.presence) byDay[day].present++
  })
  const trendData = Object.values(byDay).map(d => ({
    date: d.date,
    percentage: Math.round((d.present / d.total) * 100)
  }))

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Link 
          href={`/projects/${id}`}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">Keyword: "{decodedKeyword}"</h1>
      <p className="text-slate-500 mb-6">Project: {project?.domain}</p>

      {/* Trend */}
      <div className="bg-white p-4 rounded shadow-sm mb-6">
        <h3 className="font-semibold mb-4">Visibility Trend Over Time</h3>
        <div className="flex gap-2 items-end h-32">
          {trendData.map((point, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-blue-500 rounded-t" 
                style={{ height: `${point.percentage}%` }}
                title={`${point.date}: ${point.percentage}%`}
              />
              <div className="text-xs text-slate-400 rotate-45 origin-left w-16">
                {point.date.slice(5)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engine Comparison */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="font-semibold mb-4">Engine Comparison</h3>
        <div className="space-y-4">
          {engineData.map(eng => (
            <div key={eng.engine} className="border rounded p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{eng.engine}</h4>
                  <div className="text-sm text-slate-500">
                    Presence Rate: <span className="font-semibold text-blue-600">{eng.presenceRate}%</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded text-sm font-medium ${
                  eng.latestPresence ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {eng.latestPresence ? '✓ Present' : '✗ Missing'}
                </div>
              </div>
              
              {eng.latestPresence && (
                <>
                  {eng.latestPosition && (
                    <div className="text-sm mb-2">
                      <strong>Position:</strong> {eng.latestPosition}
                    </div>
                  )}
                  <div className="text-sm mb-2">
                    <strong>Citations:</strong> {eng.citationsCount}
                  </div>
                  {eng.latestSnippet && (
                    <div className="text-sm mb-2">
                      <strong>Answer Snippet:</strong>
                      <div className="mt-1 p-2 bg-slate-50 rounded text-slate-700 italic">
                        "{eng.latestSnippet}"
                      </div>
                    </div>
                  )}
                  {eng.observedUrls.length > 0 && (
                    <div className="text-sm">
                      <strong>Observed URLs:</strong>
                      <ul className="mt-1 space-y-1">
                        {eng.observedUrls.map((url: string, i: number) => (
                          <li key={i} className="text-blue-600 text-xs truncate">{url}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
