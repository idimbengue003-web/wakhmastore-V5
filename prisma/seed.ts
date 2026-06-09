import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash the demo password
  const hashedPassword = await bcrypt.hash('Demo1234', 12);

  // Create demo user - VIP KING plan (800 pts/annonce)
  const user = await prisma.user.upsert({
    where: { email: 'demo@wakhmastore.com' },
    update: {},
    create: {
      email: 'demo@wakhmastore.com',
      name: 'Démo Wakhma',
      phone: '+221771234567',
      password: hashedPassword,
      role: 'user',
      plan: 'vip_king',
      provider: 'email',
      points: 5000,
      referralCode: 'WK-DEMO1',
    },
  });

  // Create a second user - Diambar plan (1000 pts/annonce)
  const user2 = await prisma.user.upsert({
    where: { email: 'ami@wakhmastore.com' },
    update: {},
    create: {
      email: 'ami@wakhmastore.com',
      name: 'Ami Diallo',
      phone: '+221789876543',
      password: hashedPassword,
      role: 'user',
      plan: 'diambar',
      provider: 'email',
      points: 3200,
      referralCode: 'WK-AMI001',
      referredBy: user.id,
    },
  });

  // Create a third user - Gratuit plan (1500 pts/annonce)
  const user3 = await prisma.user.upsert({
    where: { email: 'fatou@wakhmastore.com' },
    update: {},
    create: {
      email: 'fatou@wakhmastore.com',
      name: 'Fatou Ndiaye',
      phone: '+221765551234',
      password: hashedPassword,
      role: 'user',
      plan: 'gratuit',
      provider: 'email',
      points: 800,
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

  // Create subscription records
  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: 'vip_king',
      priceFcfa: 5000,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.subscription.create({
    data: {
      userId: user2.id,
      plan: 'diambar',
      priceFcfa: 2000,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const annonces = [
    {
      title: 'Je cherche Un iPhone 17 pro max',
      price: 250000,
      category: 'Autre',
      emoji: '📦',
      location: 'Dakar',
      isVip: false,
      phone: '+221771234567',
      whatsapp: '+221771234567',
      description: 'Je cherche un iPhone 17 Pro Max en bon état, préférablement avec garantie. Budget max 250 000 FCFA. Contactez-moi si vous avez un appareil disponible à Dakar.',
    },
    {
      title: 'Je cherche tablette samsung',
      price: 190000,
      category: 'Tablettes',
      emoji: '📲',
      location: 'Dakar',
      isVip: true,
      vipType: 'vip_king',
      phone: '+221771234567',
      whatsapp: '+221771234567',
      description: 'Recherche une tablette Samsung Galaxy Tab S8 ou S9 en bon état. Pour usage professionnel et dessin digital. Écran de 11 pouces minimum.',
    },
    {
      title: 'Je cherche un canapé 3 places',
      price: 120000,
      category: 'Meubles',
      emoji: '🛋️',
      location: 'Mermoz',
      isVip: false,
      phone: '+221789876543',
      whatsapp: '+221789876543',
      description: 'Je cherche un canapé 3 places confortable, couleur neutre (gris, beige ou marron). Livraison à Mermoz souhaitée. État neuf ou très bon état.',
    },
    {
      title: 'Je cherche un ordinateur portable pour études',
      price: 180000,
      category: 'Ordinateurs',
      emoji: '💻',
      location: 'Sicap Liberté',
      isVip: false,
      phone: '+221765551234',
      whatsapp: '+221765551234',
      description: 'Ordinateur portable pour études universitaires. Minimum 8 Go RAM, 256 Go SSD. Préférablement HP, Lenovo ou Dell. Windows 11.',
    },
    {
      title: 'Je cherche un climatiseur split 12000 BTU',
      price: 150000,
      category: 'Climatiseur & Ventilateur',
      emoji: '❄️',
      location: 'Almadies',
      isVip: false,
      phone: '+221771234567',
      whatsapp: '+221771234567',
      description: 'Climatiseur split 12000 BTU, marque fiable (Samsung, LG ou Hisense). Installation incluse souhaitée. Pour une chambre à Almadies.',
    },
    {
      title: 'Je cherche un frigo Samsung double porte',
      price: 200000,
      category: 'Frigo & Congélateur',
      emoji: '🧊',
      location: 'Médina',
      isVip: false,
      phone: '+221789876543',
      whatsapp: '',
      description: 'Réfrigérateur Samsung double porte, capacité 300L minimum. En bon état de fonctionnement. Livraison à Médina.',
    },
    {
      title: 'Je cherche un iPhone 14 Pro Max',
      price: 350000,
      category: 'Téléphones',
      emoji: '📱',
      location: 'Plateau',
      isVip: false,
      phone: '+221765551234',
      whatsapp: '+221765551234',
      description: 'iPhone 14 Pro Max, 256 Go minimum. Couleur indifférente. En très bon état sans rayures. Avec chargeur et étui si possible.',
    },
  ];

  for (const annonce of annonces) {
    await prisma.annonce.create({
      data: {
        ...annonce,
        authorId: user.id,
      },
    });
  }

  console.log('✅ Seed completed!');
  console.log('📧 Demo login: demo@wakhmastore.com / Demo1234');
  console.log('🎁 Referral code: WK-DEMO1');
  console.log('👑 Demo user: VIP KING plan (800 pts/annonce), 5000 points');
  console.log('⭐ User 2: Diambar plan (1000 pts/annonce), 3200 points');
  console.log('🆓 User 3: Gratuit plan (1500 pts/annonce), 800 points');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
