import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center">
      <div className="bg-white rounded-[16px] shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <img src="/logos/RoutineReady_Logo_Stacked_Colour.svg" alt="Routine Ready" className="h-24 mx-auto mb-4" />
          <p className="text-brand-text-muted text-sm">Visual routine display for classrooms</p>
        </div>

        <form onSubmit={handleEmailLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-brand-text mb-1">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 h-[44px] border-2 border-brand-border rounded-[6px] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-pale focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-brand-text mb-1">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 h-[44px] border-2 border-brand-border rounded-[6px] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-pale focus:outline-none transition-colors"
              />
            </div>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-[6px] text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-5 min-h-[44px] py-3 bg-brand-primary text-white rounded-[6px] font-semibold hover:bg-brand-primary-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Please wait...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
