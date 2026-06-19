"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding...');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@mangapro.uz' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@mangapro.uz',
            password: null,
            role: 'ADMIN',
            coins: 10000,
        },
    });
    const translator = await prisma.user.upsert({
        where: { email: 'translator@mangapro.uz' },
        update: {},
        create: {
            username: 'tarjimon1',
            email: 'translator@mangapro.uz',
            password: null,
            role: 'TRANSLATOR',
        },
    });
    const manga = await prisma.manga.upsert({
        where: { slug: 'sample-manga' },
        update: {},
        create: {
            title: 'Sample Manga',
            slug: 'sample-manga',
            description: 'Bu demo manga tasnifi.',
            cover: '/uploads/sample-cover.jpg',
            type: 'MANGA',
            status: 'ONGOING',
            translateStatus: 'ONGOING',
            ageRating: '13+',
            releaseYear: 2024,
            translatorId: translator.id,
        },
    });
    await prisma.chapter.create({
        data: {
            mangaId: manga.id,
            number: 1,
            title: 'Boshlanish',
            coinPrice: 0,
            pages: {
                create: [
                    { pageNumber: 1, imageUrl: '/uploads/sample/page1.webp' },
                    { pageNumber: 2, imageUrl: '/uploads/sample/page2.webp' },
                ],
            },
        },
    });
    console.log('Seed tugadi!');
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
