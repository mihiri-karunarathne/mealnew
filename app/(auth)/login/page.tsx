'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/admin')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9FF] flex items-center justify-center px-4">

      {/* Background accent */}
      <div className="fixed bottom-16 right-16 w-56 h-56 bg-[#006766] opacity-[0.06] rounded-3xl rotate-12 pointer-events-none" />

      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#006766] rounded-xl mb-3 shadow-lg shadow-teal-800/20">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white"/>
            </svg>
          </div>
          <p className="text-[#001B3C] font-bold text-xl">DigitalEase</p>
          <p className="text-[#64748B] text-[10px] font-semibold uppercase tracking-widest mt-0.5">
            Health System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_-8px_rgba(26,54,93,0.12)] p-7">

          <h2 className="text-base font-bold text-[#001B3C] mb-1">Sign in</h2>
          <p className="text-xs text-[#64748B] mb-5">Enter your admin credentials to continue.</p>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            <div>
              <label className="block text-[12px] font-medium text-[#3E4948] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@digitalease.lk"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 bg-[#F0F3FF] rounded-lg border border-[rgba(189,201,200,0.30)] text-[#001B3C] text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006766]/30"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#3E4948] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#F0F3FF] rounded-lg border border-[rgba(189,201,200,0.30)] text-[#001B3C] text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006766]/30"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#006766]">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#006766] text-white rounded-xl font-semibold text-sm hover:bg-[#005555] transition-colors disabled:opacity-60">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><LogIn size={15} /> Sign In</>}
            </button>

          </form>
        </div>

        <p className="text-center text-[#6E7978] text-[11px] mt-5">
          v2.4.1 · Healthcare Enterprise Edition
        </p>
      </div>
    </div>
  )
}