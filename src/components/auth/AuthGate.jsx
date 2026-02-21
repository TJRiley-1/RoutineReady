import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LoginPage from './LoginPage'

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for auth changes first — this catches the OAuth callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setLoading(false)
    })

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-brand-primary to-brand-primary-dark flex flex-col items-center justify-center gap-4">
        <img src="/logos/RoutineReady_Logo_Horizontal_White.svg" alt="Routine Ready" className="h-12" />
        <div className="text-white text-xl font-semibold">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return children
}
