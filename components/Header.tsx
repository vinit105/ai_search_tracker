import { cookies } from 'next/headers'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function Header() {
  const cookieStore = cookies()
  
  // Simple check - just look for auth cookie presence instead of making API call
  const hasAuthCookie = cookieStore.getAll().some(cookie => 
    cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  )

  return (
    <header className="bg-white shadow-sm">
      <div className="container py-4 flex items-center justify-between">
        <Link href="/projects" className="text-lg font-semibold hover:text-blue-600">
          AEO Dashboard
        </Link>
        {hasAuthCookie && <LogoutButton />}
      </div>
    </header>
  )
}
