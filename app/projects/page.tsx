import React from 'react'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ProjectsPage() {
  const cookieStore = cookies()
  
  // For development: bypass auth if service role key is available
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    // Use server client directly in dev mode to bypass auth
    const { supabaseServer } = await import('../../lib/supabaseServer')
    const { data: projects } = await supabaseServer.from('projects').select('*')
    
    return (
      <div>
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4 text-sm">
          ⚠️ Development Mode: Auth bypassed due to rate limit
        </div>
        <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
        <div className="grid grid-cols-1 gap-4">
          {projects && projects.length > 0 ? (
            projects.map((p: any) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="block bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold">{p.domain}</h3>
                <p className="text-sm text-slate-500">{p.brand}</p>
              </Link>
            ))
          ) : (
            <div className="bg-white p-6 rounded shadow-sm">No projects yet.</div>
          )}
        </div>
      </div>
    )
  }
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  let user = null
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    // Auth error - redirect to login
    redirect('/login')
  }
  
  if (!user) {
    redirect('/login')
  }

  const { data: projects } = await supabase.from('projects').select('*')

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
      <div className="grid grid-cols-1 gap-4">
        {projects && projects.length > 0 ? (
          projects.map((p: any) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="block bg-white p-4 rounded shadow-sm">
              <h3 className="font-semibold">{p.domain}</h3>
              <p className="text-sm text-slate-500">{p.brand}</p>
            </Link>
          ))
        ) : (
          <div className="bg-white p-6 rounded shadow-sm">No projects yet.</div>
        )}
      </div>
    </div>
  )
}
