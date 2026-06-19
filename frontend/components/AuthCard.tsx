'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'

type AuthMode = 'login' | 'signup'

type AuthResponse = {
  user: {
    id: string
    username: string
    email: string
    role: string
    coins: number
    avatar?: string | null
  }
  accessToken: string
  refreshToken: string
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || ''

function saveSession(data: AuthResponse) {
  localStorage.setItem('mangapro_user', JSON.stringify(data.user))
  localStorage.setItem('mangapro_access_token', data.accessToken)
  localStorage.setItem('mangapro_refresh_token', data.refreshToken)
}

async function parseAuthResponse(response: Response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Kirishda xatolik yuz berdi')
  }
  return data as AuthResponse
}

export default function AuthCard({ mode }: { mode: AuthMode }) {
  const router = useRouter()
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const isSignup = mode === 'signup'
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const finishAuth = (data: AuthResponse) => {
    saveSession(data)
    router.push('/')
    router.refresh()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const payload = isSignup
      ? {
          username: String(form.get('username') || ''),
          email: String(form.get('email') || ''),
          password: String(form.get('password') || ''),
        }
      : {
          login: String(form.get('login') || ''),
          password: String(form.get('password') || ''),
        }

    try {
      const response = await fetch(`${apiBase}/api/auth/${isSignup ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      finishAuth(await parseAuthResponse(response))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleToken = async (token: string) => {
    setError('')
    setGoogleLoading(true)

    try {
      const response = await fetch(`${apiBase}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      finishAuth(await parseAuthResponse(response))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google orqali kirishda xatolik')
    } finally {
      setGoogleLoading(false)
    }
  }

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return

    const renderGoogleButton = () => {
      const google = (window as any).google
      if (!google?.accounts?.id || !googleButtonRef.current) return

      googleButtonRef.current.innerHTML = ''
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: { credential?: string }) => {
          if (response.credential) handleGoogleToken(response.credential)
        },
      })
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_black',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: isSignup ? 'signup_with' : 'signin_with',
        width: googleButtonRef.current.offsetWidth || 360,
      })
    }

    const existingScript = document.getElementById('google-identity-script')
    if (existingScript) {
      renderGoogleButton()
      return
    }

    const script = document.createElement('script')
    script.id = 'google-identity-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = renderGoogleButton
    document.head.appendChild(script)
  }, [googleClientId, isSignup])

  return (
    <main className="min-h-screen bg-[#0b1626] text-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-md rounded-lg border border-violet-900/50 bg-slate-950/75 p-6 shadow-2xl shadow-violet-950/30">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <img src="/logos/logo-full-dark.svg" alt="MangaPro" className="h-12 w-auto" />
          <div>
            <h1 className="text-2xl font-bold">{isSignup ? "Ro'yxatdan o'tish" : 'Kirish'}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {isSignup ? 'Yangi akkaunt yarating' : 'Akkauntingizga kiring'}
            </p>
          </div>
        </div>

        <div className="min-h-10">
          {googleClientId ? (
            <div className="relative">
              <div ref={googleButtonRef} className={googleLoading ? 'pointer-events-none opacity-60' : ''} />
            </div>
          ) : (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Google kirish uchun NEXT_PUBLIC_GOOGLE_CLIENT_ID kerak.
            </div>
          )}
        </div>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
          <span className="h-px flex-1 bg-slate-800" />
          yoki
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="mb-1 block text-sm text-slate-300">Username</label>
              <input
                name="username"
                type="text"
                required
                minLength={3}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition-colors focus:border-violet-500"
                placeholder="username"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-slate-300">{isSignup ? 'Email' : 'Email yoki username'}</label>
            <input
              name={isSignup ? 'email' : 'login'}
              type={isSignup ? 'email' : 'text'}
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition-colors focus:border-violet-500"
              placeholder={isSignup ? 'email@example.com' : 'email@example.com'}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Parol</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none transition-colors focus:border-violet-500"
              placeholder="********"
            />
            {!isSignup && (
              <Link href="/accounts/forgot-password" className="mt-2 inline-block text-sm text-fuchsia-300 hover:text-fuchsia-200">
                Parolni unutdingizmi?
              </Link>
            )}
          </div>

          {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-fuchsia-600 py-2 font-semibold text-white transition-colors hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Yuklanmoqda...' : isSignup ? "Ro'yxatdan o'tish" : 'Kirish'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-400">
          {isSignup ? 'Akkauntingiz bormi?' : "Akkauntingiz yo'qmi?"}{' '}
          <Link href={isSignup ? '/accounts/login' : '/accounts/signup'} className="text-fuchsia-300 hover:text-fuchsia-200">
            {isSignup ? 'Kirish' : "Ro'yxatdan o'ting"}
          </Link>
        </p>
      </div>
    </main>
  )
}
