'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitTime, setWaitTime] = useState(0)
  const router = useRouter()

  const clearSession = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setError('')
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear all Supabase cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    })
    
    setError('Session cleared! Wait 10 seconds before logging in again.')
    setWaitTime(10)
    
    // Countdown
    const interval = setInterval(() => {
      setWaitTime(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setError('')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (waitTime > 0) {
      setError(`Please wait ${waitTime} seconds before trying again`)
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      // Try to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
          setError('⚠️ Rate limit reached! Please wait 60 seconds and try again.')
          setWaitTime(60)
          
          // Countdown
          const interval = setInterval(() => {
            setWaitTime(prev => {
              if (prev <= 1) {
                clearInterval(interval)
                setError('You can try logging in now.')
                return 0
              }
              return prev - 1
            })
          }, 1000)
        } else {
          setError(error.message)
        }
        setLoading(false)
      } else {
        router.push('/projects')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">AI Search Tracker Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
              {error.includes('rate limit') && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={clearSession}
                    className="text-xs underline text-blue-600 hover:text-blue-800"
                  >
                    Clear session and try again
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || waitTime > 0}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : waitTime > 0 ? `Wait ${waitTime}s` : 'Login'}
          </button>
        </form>

        <div className="mt-4 space-y-2">
          <div className="p-3 bg-blue-50 rounded text-sm">
            <strong>Demo credentials:</strong><br />
            Email: demo@example.com<br />
            Password: password123
          </div>
          
          <button
            type="button"
            onClick={clearSession}
            className="w-full text-sm text-slate-600 hover:text-slate-900 underline"
          >
            Having issues? Clear session
          </button>
        </div>
      </div>
    </div>
  )
}
