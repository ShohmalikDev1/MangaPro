'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

interface Chapter {
  id: string
  number: number
  title?: string
  createdAt: string
  coinPrice: number
}

interface Manga {
  id: string
  title: string
  slug: string
  cover: string
  description: string
  status: string
  type: string
  ageRating: string
  releaseYear: number
  viewCount: number
  likeCount: number
  translator?: { username: string }
  chapters?: Chapter[]
  genres?: Array<{ genre: { name: string } }>
  _count?: { chapters: number }
}

export default function MangaPage({ params }: { params: { slug: string } }) {
  const [manga, setManga] = useState<Manga | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const response = await axios.get(`/api/mangas/${params.slug}`)
        setManga(response.data)

        // Fetch chapters
        const chaptersRes = await axios.get(`/api/chapters?mangaId=${response.data.id}`)
        setChapters(chaptersRes.data)
      } catch (error) {
        console.error('Manga topilmadi:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchManga()
  }, [params.slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Yuklanmoqda...</p>
      </main>
    )
  }

  if (!manga) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Manga topilmadi</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/catalog" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">
            ← Katalogga qaytish
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
            {/* Cover */}
            <div>
              <img
                src={manga.cover}
                alt={manga.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            {/* Details */}
            <div className="md:col-span-3">
              <h1 className="text-4xl font-bold mb-4">{manga.title}</h1>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-slate-400 text-sm">Turi</p>
                  <p className="font-semibold">{manga.type}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Holati</p>
                  <p className="font-semibold text-cyan-400">
                    {manga.status === 'ONGOING' ? 'Davom etmoqda' : 'Tugallandi'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Yosh reytingi</p>
                  <p className="font-semibold">{manga.ageRating}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Chiqish yili</p>
                  <p className="font-semibold">{manga.releaseYear}</p>
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded font-semibold">
                  ♥ {manga.likeCount}
                </button>
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded font-semibold">
                  👁 {manga.viewCount}
                </button>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {manga.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Boblar ({chapters.length})</h2>

          {chapters.length === 0 ? (
            <p className="text-slate-400">Hozircha boblar yo\'q</p>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/manga/${manga.slug}/chapter/${chapter.number}`}
                  className="block bg-slate-800 hover:bg-slate-700 p-4 rounded transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        Bob {chapter.number}
                        {chapter.title && ` - ${chapter.title}`}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {new Date(chapter.createdAt).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                    {chapter.coinPrice > 0 && (
                      <span className="text-yellow-500 font-semibold">
                        💰 {chapter.coinPrice}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
