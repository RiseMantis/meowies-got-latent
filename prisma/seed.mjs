import { prisma } from '../lib/prisma';

const seedLocations = [
  {
    placeId: 'seed-quiet-coffee-garden',
    name: 'Quiet Coffee Garden',
    address: 'Bandra West, Mumbai',
    lat: 19.0517,
    lon: 72.8296,
    soundTag: 'Quiet',
    lightTag: 'Soft Light',
    aromaTag: 'Pleasant Aroma',
    crowdTag: 'Light Crowd',
    reports: [
      { soundTag: 5, lightTag: 4, aromaTag: 4, crowdTag: 4 },
      { soundTag: 4, lightTag: 4, aromaTag: 5, crowdTag: 4 }
    ]
  },
  {
    placeId: 'seed-aroma-park',
    name: 'Aroma Park Retreat',
    address: 'Lower Parel, Mumbai',
    lat: 19.0134,
    lon: 72.8445,
    soundTag: 'Somewhat Quiet',
    lightTag: 'Bright',
    aromaTag: 'Strong Aroma',
    crowdTag: 'Moderate',
    reports: [
      { soundTag: 4, lightTag: 4, aromaTag: 5, crowdTag: 3 },
      { soundTag: 4, lightTag: 5, aromaTag: 4, crowdTag: 3 }
    ]
  },
  {
    placeId: 'seed-calm-terrace',
    name: 'Calm Terrace',
    address: 'Colaba, Mumbai',
    lat: 18.9152,
    lon: 72.8258,
    soundTag: 'Quiet',
    lightTag: 'Warm Light',
    aromaTag: 'Mild Aroma',
    crowdTag: 'Low Crowd',
    reports: [
      { soundTag: 4, lightTag: 4, aromaTag: 4, crowdTag: 4 },
      { soundTag: 5, lightTag: 4, aromaTag: 4, crowdTag: 4 }
    ]
  }
];

async function main() {
  const seedUser = await prisma.user.upsert({
    where: { name: 'Seed User' },
    update: { email: 'seed-user@example.com' },
    create: { name: 'Seed User', email: 'seed-user@example.com' }
  });

  for (const location of seedLocations) {
    await prisma.location.upsert({
      where: { placeId: location.placeId },
      update: {},
      create: {
        name: location.name,
        address: location.address,
        lat: location.lat,
        lon: location.lon,
        placeId: location.placeId,
        isVerified: true,
        ownerId: seedUser.id,
        soundTag: location.soundTag,
        lightTag: location.lightTag,
        aromaTag: location.aromaTag,
        crowdTag: location.crowdTag,
        reports: {
          create: location.reports.map((report) => ({
            ...report,
            userId: seedUser.id
          }))
        }
      }
    });
  }

  console.log('Seed complete: added verified locations with sensory reports.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
