import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function Header() {
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

  return (
    <header className="bg-white shadow-sm">
      <div className="container py-4 flex items-center justify-between">
        <Link href="/projects" className="text-lg font-semibold hover:text-blue-600">
          AEO Dashboard
        </Link>
        {user && <LogoutButton />}
      </div>
    </header>
  )
}
