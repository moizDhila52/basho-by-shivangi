'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin') // Success!
        router.refresh()
      } else {
        setError('Incorrect Password')
        setLoading(false)
      }
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-basho-earth">BASHO.</h1>
          <p className="text-stone-500 text-sm mt-2">Restricted Area. Admin Access Only.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="password" 
              placeholder="Enter Admin Password" 
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-basho-earth outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button 
            disabled={loading}
            className="w-full bg-basho-earth text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  )
}