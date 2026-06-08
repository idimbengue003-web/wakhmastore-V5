import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash the demo password
  const hashedPassword = await bcrypt.hash('Demo1234', 12);

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@wakhmastore.com' },
    update: {},
    create: {
      email: 'demo@wakhmastore.com',
      name: 'Démo Wakhma',
      phone: '+221 77 123 4567',
      password: hashedPassword,
      role: 'user',
      plan: 'vip_king',
      points: 1600,
      referralCode: 'WK-DEMO1',
    },
  });

  // Create a second user to show referral history
  const user2 = await prisma.user.upsert({
    where: { email: 'ami@wakhmastore.com' },
    update: {},
    create: {
      email: 'ami@wakhmastore.com',
      name: 'Ami Diallo',
      phone: '+221 78 987 6543',
      password: hashedPassword,
      role: 'user',
      plan: 'diambar',
      points: 0,
      referralCode: 'WK-AMI001',
      referredBy: user.id,
    },
  });

  // Create a third user
  const user3 = await prisma.user.upsert({
    where: { email: 'fatou@wakhmastore.com' },
    update: {},
    create: {
      email: 'fatou@wakhmastore.com',
      name: 'Fatou Ndiaye',
      phone: '+221 76 555 1234',
      password: hashedPassword,
      role: 'user',
      plan: 'gratuit',
      points: 0,
      referralCode: 'WK-FATOU1',
      referredBy: user.id,
    },
  });

  // Create referral records
  await prisma.referral.upsert({
    where: { id: 'ref1' },
    update: {},
    create: {
      id: 'ref1',
      referrerId: user.id,
      referredId: user2.id,
      points: 400,
    },
  });

  await prisma.referral.upsert({
    where: { id: 'ref2' },
    update: {},
    create: {
      id: 'ref2',
      referrerId: user.id,
      referredId: user3.id,
      points: 400,
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

  console.log('✅ Seed completed!');
  console.log('📧 Demo login: demo@wakhmastore.com / Demo1234');
  console.log('🎁 Referral code: WK-DEMO1');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
