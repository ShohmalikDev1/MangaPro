import { PrismaClient, MangaType, Status, TranslateStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding boshlandi...')

  // Genres
  const genres = ['Fantastika', 'Garem', 'Komediya', 'Sehr', 'Romantika', 'Jangari', 'Drama', 'Maktab', 'Isekai', 'Psixologik', 'Sport', 'Sarguzasht', 'Detektiv', 'Dahshat', 'Musobaqa']
  for (const name of genres) {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } })
  }
  console.log('✅ Janrlar qo\'shildi')

  // Tags
  const tags = ['Bosh qahramon - erkak', 'Daraja tizimi', 'Sehr', 'Sevgi', 'Zamonaviy dunyo', 'O\'rta asrlar', 'Sistema', 'Reenkarnatsiya', 'Super kuch', 'Akademiya']
  for (const name of tags) {
    await prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
  }
  console.log('✅ Teglar qo\'shildi')

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mangapro.uz' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@mangapro.uz',
      password: adminPassword,
      role: 'ADMIN',
      coins: 9999
    }
  })
  console.log('✅ Admin yaratildi:', admin.email)

  // Translator user
  const translatorPassword = await bcrypt.hash('translator123', 12)
  const translator = await prisma.user.upsert({
    where: { email: 'translator@mangapro.uz' },
    update: {},
    create: {
      username: 'thanos_uz',
      email: 'translator@mangapro.uz',
      password: translatorPassword,
      role: 'TRANSLATOR',
      coins: 100
    }
  })
  console.log('✅ Tarjimon yaratildi:', translator.email)

  // Sample Mangas
  const mangas: Array<{
    title: string; slug: string; description: string; cover: string;
    type: MangaType; status: Status; translateStatus: TranslateStatus;
    ageRating: string; releaseYear: number; translatorId: string; viewCount: number; likeCount: number;
  }> = [
    {
      title: 'Buyuk Gersogning O\'g\'li Sifatida Qayta Tug\'ilgan',
      slug: 'buyuk-gersogning-ogli-sifatida-qayta-tugilgan',
      description: 'Isekai fantastikasi. Buyuk gersogning o\'g\'li bo\'lib qayta tug\'ilgach, u o\'zining kengashchisiga aylandi.',
      cover: 'https://images.unsplash.com/photo-1534282988757-a835e7c1d565?w=300&h=450&fit=crop',
      type: 'MANGA',
      status: 'ONGOING',
      translateStatus: 'ONGOING',
      ageRating: '12+',
      releaseYear: 2020,
      translatorId: translator.id,
      viewCount: 15000,
      likeCount: 2500
    },
    {
      title: 'QORA BIZNES',
      slug: 'qora-biznes',
      description: 'Qora bazar va gizli operatsiyalar haqidagi manga.',
      cover: 'https://images.unsplash.com/photo-1540224947632-00ad83f3e467?w=300&h=450&fit=crop',
      type: 'MANGA',
      status: 'ONGOING',
      translateStatus: 'ONGOING',
      ageRating: '16+',
      releaseYear: 2019,
      translatorId: translator.id,
      viewCount: 12000,
      likeCount: 1800
    },
    {
      title: 'Alpinist',
      slug: 'alpinist',
      description: 'Dag\'larga chiqish va hayat muxammasi.',
      cover: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=300&h=450&fit=crop',
      type: 'MANGA',
      status: 'ONGOING',
      translateStatus: 'ONGOING',
      ageRating: '13+',
      releaseYear: 2021,
      translatorId: translator.id,
      viewCount: 8500,
      likeCount: 1200
    },
    {
      title: 'DaNDaDaN',
      slug: 'dandadan',
      description: 'O\'zgarib ketgan dunyo, jinn va ruhlar bilan jang.',
      cover: 'https://images.unsplash.com/photo-1553678505-d4b5f4f77368?w=300&h=450&fit=crop',
      type: 'MANGA',
      status: 'ONGOING',
      translateStatus: 'ONGOING',
      ageRating: '14+',
      releaseYear: 2022,
      translatorId: translator.id,
      viewCount: 18000,
      likeCount: 3200
    },
    {
      title: 'Qaytadan boshlovchi jangchining yuksalish yo\'li',
      slug: 'qaytadan-boshlovchi-jangchining-yuksalish-yoli',
      description: 'Qaytadan boshlovchi jangguvchi o\'zining g\'alaba tishiga qaytadi.',
      cover: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=450&fit=crop',
      type: 'MANGA',
      status: 'COMPLETED',
      translateStatus: 'COMPLETED',
      ageRating: '15+',
      releaseYear: 2020,
      translatorId: translator.id,
      viewCount: 20000,
      likeCount: 4100
    },
    {
      title: 'Cheksiz nekromanser',
      slug: 'cheksiz-nekromanser',
      description: 'O\'ldirilganlarni yashdirish va qorquv danalarining hukumdori.',
      cover: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=300&h=450&fit=crop',
      type: 'MANGA',
      status: 'ONGOING',
      translateStatus: 'ONGOING',
      ageRating: '16+',
      releaseYear: 2021,
      translatorId: translator.id,
      viewCount: 9200,
      likeCount: 1500
    },
    {
      title: 'Inso Qonuni',
      slug: 'inso-qonuni',
      description: 'Hukumat va sirli tashkilotning to\'qnashuvi.',
      cover: 'https://images.unsplash.com/photo-1551986782-d244d7d9b5b9?w=300&h=450&fit=crop',
      type: 'MANGA',
      status: 'ONGOING',
      translateStatus: 'ONGOING',
      ageRating: '17+',
      releaseYear: 2018,
      translatorId: translator.id,
      viewCount: 11000,
      likeCount: 1700
    }
  ]

  for (const mangaData of mangas) {
    await prisma.manga.upsert({
      where: { slug: mangaData.slug },
      update: {},
      create: mangaData
    })
  }
  console.log('✅ Manga kitoblar qo\'shildi')

  console.log('🎉 Seed muvaffaqiyatli tugadi!')
  console.log('')
  console.log('Admin: admin@mangapro.uz / admin123')
  console.log('Tarjimon: translator@mangapro.uz / translator123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
