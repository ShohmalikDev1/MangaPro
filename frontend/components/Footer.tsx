import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 py-10 px-2 sm:px-4 dark:border-violet-900/30 dark:bg-[#09090f]">
      <div className="w-full max-w-none">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-yellow-600 dark:bg-violet-700 flex items-center justify-center text-white text-xs font-black">M</div>
              <span className="font-black text-slate-900 dark:text-white text-lg">
                MANGA<span className="text-yellow-600 dark:text-violet-400">PRO</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-6 max-w-sm">
              Uzbek tilida manga va manhwa o'qish uchun zamonaviy platforma. Har hafta yangi chapterlar, yangi tarjimalar.
            </p>
            <div className="mt-4 inline-flex px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-200 dark:border-green-800/40">
              ● Online yangilanmoqda
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Link href="/catalog" className="px-4 py-2 rounded-xl bg-yellow-600 dark:bg-violet-600 hover:bg-yellow-700 dark:hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
                O'qishni boshlash
              </Link>
              <Link href="/accounts/signup" className="px-4 py-2 rounded-xl border border-slate-300 dark:border-violet-800/50 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                Ro'yxatdan o'tish
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm uppercase tracking-wider">Bo'limlar</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/catalog" className="hover:text-slate-900 dark:hover:text-white transition-colors">Katalog</Link></li>
              <li><Link href="/catalog?type=MANGA" className="hover:text-slate-900 dark:hover:text-white transition-colors">Manga</Link></li>
              <li><Link href="/catalog?type=MANHWA" className="hover:text-slate-900 dark:hover:text-white transition-colors">Manhwa</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm uppercase tracking-wider">Aloqa</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Telegram</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-violet-900/20 text-center text-slate-400 dark:text-slate-600 text-xs">
          © 2026 MangaPro. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  )
}
