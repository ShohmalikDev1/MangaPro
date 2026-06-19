'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTheme } from '../app/theme-provider'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200/80 dark:bg-[#09090f]/95 dark:border-violet-900/30">
      <nav className="w-full px-3 sm:px-5 h-14 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-3">
          <img src="/logos/icon-square.svg" alt="" className="h-9 w-9 shrink-0" />
          <span className="whitespace-nowrap text-lg font-black leading-none tracking-normal text-slate-900 dark:text-white">
            MANGA<span className="text-violet-600 dark:text-violet-400">PRO</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5 ml-1">
          <Link href="/catalog" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-violet-900/45">
            Katalog
          </Link>
          <Link href="/catalog?type=MANHWA" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-violet-900/45">
            Manhwa
          </Link>
          <Link href="/catalog?type=MANGA" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-violet-900/45">
            Manga
          </Link>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-yellow-900 hover:bg-yellow-100 transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-violet-900/50"
            aria-label="Qidirish"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
              <circle cx="11" cy="11" r="7.5" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-yellow-900 hover:bg-yellow-100 transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-violet-900/50"
            aria-label="Rejim"
          >
            {theme === 'dark' ? (
              <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <Link
            href="/accounts/login"
            className="hidden sm:flex px-4 py-1.5 rounded-xl bg-yellow-600 hover:bg-yellow-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white text-sm font-semibold transition-colors ml-1"
          >
            Kirish
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-yellow-100 dark:hover:bg-violet-900/50 transition-colors"
            aria-label="Menyu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" d={mobileOpen ? 'M6 18 18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </nav>

      {searchOpen && (
        <div className="border-t border-slate-200 dark:border-violet-900/30 px-3 sm:px-5 py-3 bg-white/95 dark:bg-[#09090f]/95">
          <input
            autoFocus
            type="text"
            placeholder="Manga qidirish..."
            className="w-full max-w-lg bg-yellow-50 dark:bg-violet-950/40 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-violet-500 transition-all"
          />
        </div>
      )}

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-violet-900/30 bg-white dark:bg-[#09090f] px-3 py-3 flex flex-col gap-1">
          <Link href="/catalog" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-yellow-100 dark:hover:bg-violet-900/45 rounded-xl">Katalog</Link>
          <Link href="/catalog?type=MANHWA" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-yellow-100 dark:hover:bg-violet-900/45 rounded-xl">Manhwa</Link>
          <Link href="/catalog?type=MANGA" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-yellow-100 dark:hover:bg-violet-900/45 rounded-xl">Manga</Link>
          <Link href="/accounts/login" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-semibold bg-yellow-600 dark:bg-violet-600 text-white rounded-xl mt-1">Kirish</Link>
        </div>
      )}
    </header>
  )
}
