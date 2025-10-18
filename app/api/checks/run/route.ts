import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../../lib/supabaseServer'

const ENGINES = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'] as const

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { project_id, keywords } = body as { project_id?: string; keywords?: string[] }

  if (!project_id) {
    return NextResponse.json({ error: 'project_id required' }, { status: 400 })
  }

  // If keywords not provided, fetch project keywords
  let kw: string[] = []
  if (Array.isArray(keywords) && keywords.length > 0) {
    kw = keywords
  } else {
    const { data: proj } = await supabaseServer.from('projects').select('keywords').eq('id', project_id).maybeSingle()
    if (proj && Array.isArray(proj.keywords)) kw = proj.keywords
  }

  if (!kw || kw.length === 0) {
    // fallback demo keywords
    kw = ['ai marketing', 'ai search', 'example keyword']
  }

  const inserts: any[] = []
  const now = new Date().toISOString()

  for (const k of kw) {
    for (const e of ENGINES) {
      const presence = Math.random() < 0.6
      const position = presence ? randomInt(1, 10) : null
      const citations_count = presence ? randomInt(0, 8) : 0
      const answer_snippet = presence ? `Sample answer snippet for ${k} on ${e}` : null
      const observed_urls = presence ? [`https://${project_id}`, `https://example.com/${k.replace(/\s+/g, '-')}`] : []

      inserts.push({
        project_id,
        engine: e,
        keyword: k,
        position,
        presence,
        answer_snippet,
        citations_count,
        observed_urls,
        timestamp: now
      })
    }
  }

  const { error } = await supabaseServer.from('checks').insert(inserts)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ inserted: inserts.length })
}

