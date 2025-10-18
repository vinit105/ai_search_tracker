'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabaseClient'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded"
    >
      Logout
    </button>
  )
}
