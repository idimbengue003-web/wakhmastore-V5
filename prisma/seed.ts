import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@wakhmastore.com' },
    update: {},
    create: {
      email: 'demo@wakhmastore.com',
      name: 'Demo User',
      phone: '+221 77 123 4567',
      password: 'demo123',
      role: 'user',
      plan: 'vip_king',
    },
  });

  const annonces = [
    { title: 'Je cherche Un iPhone 17 pro max', price: 250000, category: 'Autre', emoji: '📦', location: 'Dakar', isVip: false },
    { title: 'Je cherche tablette samsung', price: 190000, category: 'Tablettes', emoji: '📲', location: 'Dakar', isVip: true, vipType: 'vip_king' },
    { title: 'Je cherche un canapé 3 places', price: 120000, category: 'Meubles', emoji: '🛋️', location: 'Mermoz', isVip: false },
    { title: 'Je cherche un ordinateur portable pour études', price: 180000, category: 'Ordinateurs', emoji: '💻', location: 'Sicap Liberté', isVip: false },
    { title: 'Je cherche un climatiseur split 12000 BTU', price: 150000, category: 'Climatiseur & Ventilateur', emoji: '❄️', location: 'Almadies', isVip: false },
    { title: 'Je cherche un frigo Samsung double porte', price: 200000, category: 'Frigo & Congélateur', emoji: '🧊', location: 'Médina', isVip: false },
    { title: 'Je cherche un iPhone 14 Pro Max', price: 350000, category: 'Téléphones', emoji: '📱', location: 'Plateau', isVip: false },
  ];

  for (const annonce of annonces) {
    await prisma.annonce.create({
      data: {
        ...annonce,
        description: `Description pour: ${annonce.title}`,
        authorId: user.id,
      },
    });
  }

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
