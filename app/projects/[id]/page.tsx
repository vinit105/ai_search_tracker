import React from 'react'
import { supabaseServer } from '../../../lib/supabaseServer'
import TrendChart from './TrendChart'
import Link from 'next/link'

type Props = { params: { id: string } }

async function getChecks(projectId: string) {
  const { data } = await supabaseServer.from('checks').select('*').eq('project_id', projectId).order('timestamp', { ascending: true })
  return data || []
}

async function getProject(projectId: string) {
  const { data } = await supabaseServer.from('projects').select('*').eq('id', projectId).single()
  return data
}

function computeVisibilityScore(checks: any[]) {
  if (!checks || checks.length === 0) return 0
  const presenceCount = checks.filter((c) => c.presence).length
  return Math.round((presenceCount / checks.length) * 100)
}

export default async function ProjectPage({ params }: Props) {
  const { id } = params
  const [checks, project] = await Promise.all([
    getChecks(id),
    getProject(id)
  ])

  const score = computeVisibilityScore(checks)

  // Build simple trend: group by day and compute percent presence
  const byDay: Record<string, { total: number; present: number }> = {}
  for (const c of checks) {
    const day = new Date(c.timestamp).toISOString().slice(0, 10)
    byDay[day] = byDay[day] || { total: 0, present: 0 }
    byDay[day].total += 1
    if (c.presence) byDay[day].present += 1
  }

  const trend = Object.keys(byDay).map((d) => ({ date: d, value: Math.round((byDay[d].present / byDay[d].total) * 100) }))

  // Calculate engine breakdown
  const engines = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity']
  const engineStats = engines.map(engine => {
    const engineChecks = checks.filter(c => c.engine === engine)
    const present = engineChecks.filter(c => c.presence).length
    const total = engineChecks.length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0
    return { engine, percentage, present, total }
  })

  // Calculate keyword stats
  const keywordStats: Record<string, { total: number; present: number; engines: string[] }> = {}
  checks.forEach(c => {
    if (!keywordStats[c.keyword]) {
      keywordStats[c.keyword] = { total: 0, present: 0, engines: [] }
    }
    keywordStats[c.keyword].total++
    if (c.presence) {
      keywordStats[c.keyword].present++
      if (!keywordStats[c.keyword].engines.includes(c.engine)) {
        keywordStats[c.keyword].engines.push(c.engine)
      }
    }
  })

  // Generate recommendations
  const recommendations: string[] = []
  const missingEngines = engineStats.filter(e => e.percentage < 30).map(e => e.engine)
  if (missingEngines.length > 0) {
    recommendations.push(`⚠️ Low visibility on ${missingEngines.join(', ')}`)
  }
  
  const lowCitationKeywords = Object.entries(keywordStats)
    .filter(([_, stats]) => stats.present < stats.total * 0.4)
    .map(([kw]) => kw)
  if (lowCitationKeywords.length > 0) {
    recommendations.push(`📉 Low citations for: ${lowCitationKeywords.slice(0, 3).join(', ')}`)
  }

  const topKeywords = Object.entries(keywordStats)
    .sort((a, b) => (b[1].present / b[1].total) - (a[1].present / a[1].total))
    .slice(0, 3)
    .map(([kw]) => kw)
  if (topKeywords.length > 0) {
    recommendations.push(`✅ Best performing: ${topKeywords.join(', ')}`)
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Link 
          href="/projects" 
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>
      </div>
      
      <h2 className="text-2xl font-bold mb-2">
        {project?.domain || 'Project'} 
        {project?.brand && <span className="text-lg text-slate-500 ml-2">({project.brand})</span>}
      </h2>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
          <h3 className="font-semibold mb-2 text-blue-900">💡 Recommendations</h3>
          <ul className="space-y-1">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-blue-800">{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-1 bg-white p-4 rounded shadow-sm">
          <h3 className="text-sm text-slate-500">Visibility Score</h3>
          <div className="text-3xl font-bold">{score}%</div>
        </div>
        <div className="col-span-2 bg-white p-4 rounded shadow-sm">
          <h3 className="text-sm text-slate-500 mb-2">14-day Trend</h3>
          <TrendChart data={trend} />
        </div>
      </div>

      {/* Engine Breakdown */}
      <div className="bg-white p-4 rounded shadow-sm mb-6">
        <h3 className="font-semibold mb-4">Breakdown by Engine</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {engineStats.map(stat => (
            <div key={stat.engine} className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stat.percentage}%</div>
              <div className="text-sm text-slate-600">{stat.engine}</div>
              <div className="text-xs text-slate-400">{stat.present}/{stat.total} present</div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyword Breakdown */}
      <div className="bg-white p-4 rounded shadow-sm mb-6">
        <h3 className="font-semibold mb-4">Breakdown by Keyword</h3>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(keywordStats).slice(0, 10).map(([keyword, stats]) => {
            const percentage = Math.round((stats.present / stats.total) * 100)
            return (
              <Link 
                key={keyword}
                href={`/projects/${id}/keyword/${encodeURIComponent(keyword)}`}
                className="flex items-center justify-between p-3 hover:bg-slate-50 rounded border"
              >
                <div className="flex-1">
                  <div className="font-medium">{keyword}</div>
                  <div className="text-xs text-slate-500">
                    Present on: {stats.engines.join(', ') || 'None'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{percentage}%</div>
                  <div className="text-xs text-slate-400">{stats.present}/{stats.total}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="font-semibold mb-2">Recent Checks</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="pb-2">Keyword</th>
              <th className="pb-2">Engine</th>
              <th className="pb-2">Presence</th>
              <th className="pb-2">Position</th>
            </tr>
          </thead>
          <tbody>
            {checks.slice(-20).reverse().map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="py-2">{c.keyword}</td>
                <td className="py-2">{c.engine}</td>
                <td className="py-2">{c.presence ? 'Yes' : 'No'}</td>
                <td className="py-2">{c.position ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
