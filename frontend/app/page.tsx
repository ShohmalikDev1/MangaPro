'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

type Manga = {
  id: string
  title: string
  slug: string
  cover: string
  type?: string
  status: string
  viewCount?: number
  likeCount?: number
  _count?: { chapters: number }
}

function FanCarousel({
  slides,
  activeIdx,
  onSelect,
}: {
  slides: Manga[]
  activeIdx: number
  onSelect: (i: number) => void
}) {
  if (!slides.length) return null
  const len = slides.length
  const positions = len >= 5 ? [-2, -1, 0, 1, 2] : len >= 3 ? [-1, 0, 1] : [0]

  const cfgs: Record<number, { scale: number; tx: number; ry: number; z: number; op: number }> = {
    0: { scale: 1, tx: 0, ry: 0, z: 10, op: 1 },
    1: { scale: 0.78, tx: 180, ry: 20, z: 6, op: 0.72 },
    2: { scale: 0.6, tx: 300, ry: 30, z: 2, op: 0.38 },
  }

  return (
    <div>
      <div
        className="relative w-full h-[260px] sm:h-[330px] flex items-center justify-center overflow-hidden"
        style={{ perspective: '1100px' }}
      >
        {positions.map((offset) => {
          const idx = ((activeIdx + offset) % len + len) % len
          const manga = slides[idx]
          const abs = Math.abs(offset)
          const cfg = cfgs[Math.min(abs, 2)]
          const tx = offset < 0 ? -cfg.tx : cfg.tx
          const ry = offset > 0 ? cfg.ry : -cfg.ry

          return (
            <div
              key={`fan-${offset}`}
              className="absolute cursor-pointer transition-all duration-500 ease-out select-none"
              style={{
                transform: `translateX(${tx}px) scale(${cfg.scale}) rotateY(${ry}deg)`,
                zIndex: cfg.z,
                opacity: cfg.op,
              }}
              onClick={() => {
                if (offset !== 0) onSelect(idx)
              }}
            >
              <Link
                href={`/manga/${manga.slug}`}
                onClick={(e) => {
                  if (offset !== 0) e.preventDefault()
                }}
                className="block"
              >
                <div className="w-[145px] sm:w-[175px] h-[215px] sm:h-[262px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
                  <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover" />
                  {offset === 0 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl" />
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      <Link
        href={`/manga/${slides[activeIdx % len].slug}`}
        className="block text-center mt-5 hover:opacity-90 transition-opacity"
      >
        <p className="text-[10px] uppercase tracking-widest text-violet-400 font-bold">
          {slides[activeIdx % len].type || 'MANGA'}
        </p>
        <h2 className="text-white font-black text-lg sm:text-2xl mt-1 line-clamp-2 leading-tight px-8">
          {slides[activeIdx % len].title}
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          {slides[activeIdx % len]._count?.chapters || 0} bob mavjud
        </p>
      </Link>

      {slides.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIdx === i ? 'w-7 bg-violet-500' : 'w-2 bg-white/25 hover:bg-white/40'
              }`}
              aria-label={`${i + 1}-slayd`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function HScrollRow({
  title,
  mangas,
  href,
}: {
  title: string
  mangas: Manga[]
  href?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 330, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-3 sm:px-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-1.5">
          {href && (
            <Link href={href} className="text-xs font-semibold text-yellow-700 dark:text-violet-400 hover:opacity-70 transition-opacity mr-2">
              Barchasini ko'rish &rarr;
            </Link>
          )}
          <button onClick={() => scroll(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100/80 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-yellow-100 dark:hover:bg-white/20 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={() => scroll(1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100/80 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-yellow-100 dark:hover:bg-white/20 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-3 px-3 sm:px-4 scroll-smooth no-scrollbar">
        {mangas.map((manga) => (
          <Link key={manga.id} href={`/manga/${manga.slug}`} className="shrink-0 group w-[130px] sm:w-[155px]">
            <div className="aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-yellow-900/10 dark:ring-white/8 bg-slate-100/70 dark:bg-[#1a1a2e]">
              <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-yellow-700 dark:text-violet-400 font-bold mt-2">{manga.type || 'MANGA'}</p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-2 leading-snug">{manga.title}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">{manga._count?.chapters || 0} bob</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

function RankRow({ idx, manga }: { idx: number; manga: Manga }) {
  return (
    <Link href={`/manga/${manga.slug}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-yellow-50 dark:hover:bg-white/5 transition-colors">
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${idx <= 3 ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'}`}>
        {idx}
      </span>
      <img src={manga.cover} alt={manga.title} className="w-9 h-12 rounded-lg object-cover shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{manga.title}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{new Intl.NumberFormat('uz-UZ').format(manga.viewCount || 0)} ko'rish</p>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [activeTab, setActiveTab] = useState<'kun' | 'hafta' | 'oy'>('kun')
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    axios.get('/api/mangas?limit=40').then((res) => {
      const data: Manga[] = res.data?.data || res.data || []
      setMangas(data)
    }).catch(() => {})
  }, [])

  const heroSlides = useMemo(() => mangas.slice(0, 10), [mangas])
  const spotlight = useMemo(() => mangas.slice(0, 16), [mangas])
  const latest = useMemo(() => [...mangas].reverse().slice(0, 10), [mangas])

  const ranking = useMemo(() => {
    const sorted = [...mangas]
    if (activeTab === 'kun') return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    if (activeTab === 'hafta') return sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    return sorted.sort((a, b) => (b._count?.chapters || 0) - (a._count?.chapters || 0))
  }, [mangas, activeTab])

  useEffect(() => {
    if (heroSlides.length <= 1) return
    const t = setInterval(() => setHeroIndex((p) => (p + 1) % heroSlides.length), 4500)
    return () => clearInterval(t)
  }, [heroSlides.length])

  return (
    <main className="min-h-screen text-slate-800 dark:text-slate-200 w-full pb-16">
      <section className="relative w-full overflow-hidden bg-[#09090f]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-1/3 w-[700px] h-[380px] bg-violet-900/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] bg-violet-800/12 rounded-full blur-[60px]" />
        </div>

        <div className="relative w-full px-4 sm:px-6 pt-8 pb-4">
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-2 space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-900/50 border border-violet-700/40 text-violet-300 text-xs font-bold uppercase tracking-wider">
                Yangi uslub
              </span>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.05] text-white">
                O'qish zavqini<br />qayta his qiling
              </h1>
              <p className="text-slate-400 leading-7">
                Uzbek tilidagi eng yaxshi manga va manhwalar - har kuni yangi chapterlar, premium sifat.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/catalog" className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-900/30">
                  Katalogni ochish
                </Link>
                <Link href="/accounts/signup" className="px-5 py-2.5 rounded-xl border border-violet-700/50 text-slate-300 hover:border-violet-500 hover:text-white font-semibold text-sm transition-colors">
                  Ro'yxatdan o'tish
                </Link>
              </div>
              <p className="text-slate-600 text-sm">{mangas.length} ta asar · Yangilanishlar har kuni</p>
            </div>

            <div className="lg:col-span-3">
              {heroSlides.length ? (
                <FanCarousel slides={heroSlides} activeIdx={heroIndex} onSelect={setHeroIndex} />
              ) : (
                <div className="h-[380px] flex items-center justify-center gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="rounded-2xl bg-white/5 animate-pulse" style={{ width: `${145 - i * 20}px`, height: `${215 - i * 30}px`, opacity: 1 - i * 0.3 }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-10 bg-gradient-to-b from-transparent to-slate-50 dark:to-[#09090f]" />
      </section>

      <section className="w-full pt-5 pb-2">
        <HScrollRow title="Bugungi spotlight" mangas={spotlight} href="/catalog" />
      </section>

      <section className="w-full px-3 sm:px-4 pt-6">
        <div className="grid lg:grid-cols-5 gap-4">
          <article className="lg:col-span-3 rounded-3xl border border-yellow-900/10 bg-slate-50/70 p-5 dark:border-violet-900/30 dark:bg-[#0f0f20]">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Yaqinda qo'shilganlar</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {latest.map((manga, i) => (
                <Link key={manga.id} href={`/manga/${manga.slug}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-yellow-50 dark:hover:bg-white/5 transition-colors">
                  <img src={manga.cover} alt={manga.title} className="w-12 h-16 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">{manga.title}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{i + 1}-o'rin · {manga.status === 'ONGOING' ? 'Davom etmoqda' : 'Tugagan'}</p>
                    <p className="text-[10px] text-yellow-700 dark:text-violet-400 font-bold uppercase mt-0.5">{manga.type || 'MANGA'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="lg:col-span-2 rounded-3xl border border-yellow-900/10 bg-slate-50/70 p-5 dark:border-violet-900/30 dark:bg-[#0f0f20]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Top reyting</h3>
              <div className="flex gap-1 rounded-xl bg-slate-100/80 dark:bg-white/5 p-1">
                {(['kun', 'hafta', 'oy'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${activeTab === tab ? 'bg-yellow-500 dark:bg-violet-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-0.5">
              {ranking.slice(0, 8).map((manga, i) => <RankRow key={manga.id} idx={i + 1} manga={manga} />)}
            </div>
          </article>
        </div>
      </section>

      <section className="w-full px-3 sm:px-4 pt-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">O'qishni davom ettirish</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {mangas.slice(0, 3).map((manga, i) => {
            const progress = 35 + i * 22
            return (
              <article key={manga.id} className="rounded-2xl border border-yellow-900/10 bg-slate-50/70 p-4 dark:border-violet-900/30 dark:bg-[#0f0f20]">
                <div className="flex gap-3">
                  <img src={manga.cover} alt={manga.title} className="w-14 h-16 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 w-full">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">{manga.title}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Bob {Math.max(1, Math.floor(progress / 10))}</p>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 mt-3 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 dark:from-violet-600 dark:to-violet-400 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="w-full px-3 sm:px-4 pt-8">
        <div className="rounded-3xl border border-yellow-900/10 bg-gradient-to-br from-slate-50/80 to-yellow-50/70 p-7 sm:p-10 dark:border-violet-900/40 dark:from-[#0f0b1e] dark:to-[#12102a]">
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            Yangi bo'limlar doim<br />birinchi sizga
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-xl">
            Sevimli asarlaringizni kuzating, tarjimonlarni qo'llab-quvvatlang va yangi chapterlarni birinchi bo'lib oching.
          </p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link href="/catalog" className="px-6 py-3 rounded-xl bg-yellow-600 dark:bg-violet-600 hover:bg-yellow-700 dark:hover:bg-violet-500 text-white font-semibold transition-colors">
              O'qishni boshlash
            </Link>
            <Link href="/accounts/signup" className="px-6 py-3 rounded-xl bg-slate-50/80 dark:bg-white/8 border border-yellow-900/10 dark:border-violet-700/40 text-slate-900 dark:text-white font-semibold hover:bg-yellow-50 dark:hover:bg-white/12 transition-colors">
              Ro'yxatdan o'tish
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
