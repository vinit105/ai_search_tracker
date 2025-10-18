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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-1 bg-white p-4 rounded shadow-sm">
          <h3 className="text-sm text-slate-500">Visibility Score</h3>
          <div className="text-3xl font-bold">{score}%</div>
        </div>
        <div className="col-span-2 bg-white p-4 rounded shadow-sm">
          <h3 className="text-sm text-slate-500 mb-2">7-day Trend</h3>
          <TrendChart data={trend} />
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
