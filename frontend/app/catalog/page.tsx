'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

interface Manga {
  id: string
  title: string
  slug: string
  cover: string
  status: string
  type: string
  _count?: { chapters: number }
}

function CatalogPageContent() {
  const searchParams = useSearchParams()
  const [mangas, setMangas] = useState<Manga[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const type = searchParams.get('type') || ''
  const search = searchParams.get('search') || ''

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        setLoading(true)
        const params: any = { page, limit: 12 }
        if (type) params.type = type
        if (search) params.search = search

        const response = await axios.get('/api/mangas', { params })
        setMangas(response.data.data)
        setTotal(response.data.pagination.total)
        setTotalPages(response.data.pagination.pages)
      } catch (error) {
        console.error('Manga yuklab bo\'lmadi:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMangas()
  }, [page, type, search])

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Katalog</h1>
          <p className="text-slate-400">
            {type ? `Turi: ${type}` : ''} {search ? `• Qidirish: ${search}` : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link
            href="/catalog"
            className={`px-4 py-2 rounded transition-colors ${
              !type
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Barchasi
          </Link>
          {['MANGA', 'MANHWA', 'MANHUA'].map((t) => (
            <Link
              key={t}
              href={`/catalog?type=${t}`}
              className={`px-4 py-2 rounded transition-colors ${
                type === t
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Manga Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Yuklanmoqda...</p>
          </div>
        ) : mangas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Manga topilmadi</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {mangas.map((manga) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.slug}`}
                  className="group"
                >
                  <div className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={manga.cover}
                      alt={manga.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-2 line-clamp-2">
                        {manga.title}
                      </h3>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>
                          {manga._count?.chapters || 0} bob
                        </span>
                        <span className="text-cyan-400">
                          {manga.status === 'ONGOING' ? 'Davom' : 'Tugallandi'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded transition-colors ${
                      page === p
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-950" />}>
      <CatalogPageContent />
    </Suspense>
  )
}
