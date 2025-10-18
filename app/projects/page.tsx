import React from 'react'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ProjectsPage() {
  const cookieStore = cookies()
  
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

  const { data: { user } } = await supabase.auth.getUser()
  
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
