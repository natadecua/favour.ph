import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed users (providers)
  const providers = [
    {
      phone: '+639171000001',
      displayName: 'Kuya Mateo',
      type: 'FREELANCER' as const,
      category: 'plumbing',
      bio: 'Licensed plumber with 8 years experience in Batangas City. Specializes in leak repairs and pipe installation.',
      baseRate: 700,
      responseRate: 92,
      completionRate: 88,
      reviewAverage: 4.7,
      yearsExperience: 8,
    },
    {
      phone: '+639171000002',
      displayName: 'Ate Sarah Electrical Services',
      type: 'BUSINESS' as const,
      category: 'electrical',
      bio: 'Licensed electrical contractor serving Batangas City since 2015. Residential and commercial work.',
      baseRate: 850,
      responseRate: 95,
      completionRate: 91,
      reviewAverage: 4.9,
      yearsExperience: 9,
    },
    {
      phone: '+639171000003',
      displayName: 'Kuya Rico',
      type: 'FREELANCER' as const,
      category: 'aircon',
      bio: 'Aircon cleaning and repair specialist. Factory-trained technician.',
      baseRate: 500,
      responseRate: 85,
      completionRate: 90,
      reviewAverage: 4.5,
      yearsExperience: 5,
    },
    {
      phone: '+639171000004',
      displayName: 'Ate Luz Cleaning Co.',
      type: 'BUSINESS' as const,
      category: 'cleaning',
      bio: 'Professional home cleaning service. Team of 4 cleaners available daily.',
      baseRate: 600,
      responseRate: 97,
      completionRate: 95,
      reviewAverage: 4.8,
      yearsExperience: 6,
    },
    {
      phone: '+639171000005',
      displayName: 'Kuya Ben',
      type: 'FREELANCER' as const,
      category: 'carpentry',
      bio: 'Custom furniture and repairs. Specializes in kitchen cabinets and wood finishing.',
      baseRate: 900,
      responseRate: 80,
      completionRate: 85,
      reviewAverage: 4.6,
      yearsExperience: 12,
    },
  ]

  for (const p of providers) {
    const user = await prisma.user.upsert({
      where: { phone: p.phone },
      update: {},
      create: {
        id: crypto.randomUUID(),
        phone: p.phone,
        role: 'PROVIDER',
        updatedAt: new Date(),
      },
    })

    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        id: crypto.randomUUID(),
        userId: user.id,
        type: p.type,
        displayName: p.displayName,
        bio: p.bio,
        city: 'Batangas City',
        isVerified: true,
        photos: [],
        updatedAt: new Date(),
      },
    })

    await prisma.service.create({
      data: {
        id: crypto.randomUUID(),
        providerId: provider.id,
        name: p.displayName,
        category: p.category,
        priceMin: p.baseRate,
        priceMax: p.baseRate * 3,
      },
    })

    const score =
      p.responseRate / 100 * 0.25 +
      p.completionRate / 100 * 0.35 +
      p.reviewAverage / 5 * 0.30 +
      0.10

    await prisma.favourScore.upsert({
      where: { providerId: provider.id },
      update: {},
      create: {
        id: crypto.randomUUID(),
        providerId: provider.id,
        overall: Math.round(score * 100) / 100,
        responseRate: p.responseRate / 100,
        completionRate: p.completionRate / 100,
        reviewAverage: p.reviewAverage,
        recency: 1.0,
        updatedAt: new Date(),
      },
    })

    console.log(`✓ Seeded ${p.displayName}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
