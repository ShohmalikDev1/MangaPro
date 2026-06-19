'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

const apiBase = process.env.NEXT_PUBLIC_API_URL || ''

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const requestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${apiBase}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Kod yuborilmadi')
      setCodeSent(true)
      setMessage(data.message || 'Kod emailingizga yuborildi')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') || '')
    const confirmPassword = String(form.get('confirmPassword') || '')

    if (password !== confirmPassword) {
      setLoading(false)
      setError('Parollar bir xil emas')
      return
    }

    try {
      const response = await fetch(`${apiBase}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: String(form.get('code') || ''),
          password,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Parol yangilanmadi')
      setMessage(data.message || 'Parol yangilandi')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0b1626] px-4 py-10 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-md rounded-lg border border-violet-900/50 bg-slate-950/75 p-6 shadow-2xl shadow-violet-950/30">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <img src="/logos/logo-full-dark.svg" alt="MangaPro" className="h-12 w-auto" />
          <div>
            <h1 className="text-2xl font-bold">Parolni tiklash</h1>
            <p className="mt-1 text-sm text-slate-400">Gmail pochtangizga 6 xonali kod yuboriladi</p>
          </div>
        </div>

        {!codeSent ? (
          <form onSubmit={requestCode} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition-colors focus:border-violet-500"
                placeholder="email@example.com"
              />
            </div>
            {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
            {message && <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p>}
            <button disabled={loading} className="w-full rounded-md bg-fuchsia-600 py-2 font-semibold text-white transition-colors hover:bg-fuchsia-500 disabled:opacity-60">
              {loading ? 'Yuborilmoqda...' : 'Kod yuborish'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Tasdiqlash kodi</label>
              <input
                name="code"
                inputMode="numeric"
                minLength={6}
                maxLength={6}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition-colors focus:border-violet-500"
                placeholder="123456"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Yangi parol</label>
              <input
                name="password"
                type="password"
                minLength={6}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition-colors focus:border-violet-500"
                placeholder="********"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Parolni takrorlang</label>
              <input
                name="confirmPassword"
                type="password"
                minLength={6}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition-colors focus:border-violet-500"
                placeholder="********"
              />
            </div>
            {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
            {message && <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p>}
            <button disabled={loading} className="w-full rounded-md bg-fuchsia-600 py-2 font-semibold text-white transition-colors hover:bg-fuchsia-500 disabled:opacity-60">
              {loading ? 'Yangilanmoqda...' : 'Parolni yangilash'}
            </button>
          </form>
        )}

        <p className="mt-4 text-sm text-slate-400">
          Esladingizmi?{' '}
          <Link href="/accounts/login" className="text-fuchsia-300 hover:text-fuchsia-200">
            Kirish
          </Link>
        </p>
      </div>
    </main>
  )
}
