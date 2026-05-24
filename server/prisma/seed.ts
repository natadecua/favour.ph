import { PrismaClient } from '@prisma/client'

const loadEnvFile = (process as typeof process & { loadEnvFile?: (path?: string) => void }).loadEnvFile
loadEnvFile?.('.env')

const prisma = new PrismaClient()

const sampleProviders = [
  {
    phone: '+639171000001',
    displayName: 'Kuya Mateo',
    type: 'FREELANCER' as const,
    category: 'plumbing',
    bio: 'Licensed plumber with 8 years experience in Batangas City. Specializes in leak repairs and pipe installation.',
    serviceName: 'Leak Inspection & Repair',
    duration: '60-90 min',
    baseRate: 700,
    responseRate: 92,
    completionRate: 88,
    reviewAverage: 4.7,
  },
  {
    phone: '+639171000002',
    displayName: 'Ate Sarah Electrical Services',
    type: 'BUSINESS' as const,
    category: 'electrical',
    bio: 'Licensed electrical contractor serving Batangas City since 2015. Residential and commercial work.',
    serviceName: 'Electrical Troubleshooting',
    duration: '1-2 hrs',
    baseRate: 850,
    responseRate: 95,
    completionRate: 91,
    reviewAverage: 4.9,
  },
  {
    phone: '+639171000003',
    displayName: 'Kuya Rico',
    type: 'FREELANCER' as const,
    category: 'aircon',
    bio: 'Aircon cleaning and repair specialist. Factory-trained technician.',
    serviceName: 'Aircon Cleaning',
    duration: '45-60 min',
    baseRate: 500,
    responseRate: 85,
    completionRate: 90,
    reviewAverage: 4.5,
  },
  {
    phone: '+639171000004',
    displayName: 'Ate Luz Cleaning Co.',
    type: 'BUSINESS' as const,
    category: 'cleaning',
    bio: 'Professional home cleaning service. Team of 4 cleaners available daily.',
    serviceName: 'General Home Cleaning',
    duration: '2-3 hrs',
    baseRate: 600,
    responseRate: 97,
    completionRate: 95,
    reviewAverage: 4.8,
  },
  {
    phone: '+639171000005',
    displayName: 'Kuya Ben',
    type: 'FREELANCER' as const,
    category: 'carpentry',
    bio: 'Custom furniture and repairs. Specializes in kitchen cabinets and wood finishing.',
    serviceName: 'Cabinet Repair Visit',
    duration: '2 hrs',
    baseRate: 900,
    responseRate: 80,
    completionRate: 85,
    reviewAverage: 4.6,
  },
] as const

const sampleCustomer = {
  phone: '+639171999999',
}

const sampleBookings = [
  {
    referenceCode: 'FVR-DEMO-101',
    providerPhone: '+639171000001',
    status: 'PENDING' as const,
    datetime: new Date('2026-05-28T09:00:00.000Z'),
    address: 'P. Burgos Street, Batangas City',
    notes: 'Kitchen sink leak inspection.',
  },
  {
    referenceCode: 'FVR-DEMO-202',
    providerPhone: '+639171000004',
    status: 'CONFIRMED' as const,
    datetime: new Date('2026-05-30T05:30:00.000Z'),
    address: 'Alangilan, Batangas City',
    notes: 'Deep clean before weekend visitors.',
  },
  {
    referenceCode: 'FVR-DEMO-303',
    providerPhone: '+639171000002',
    status: 'COMPLETED' as const,
    datetime: new Date('2026-05-20T02:00:00.000Z'),
    notes: 'Outlet stopped working in the living room.',
    address: 'Kumintang Ibaba, Batangas City',
  },
] as const

async function upsertProvider(providerSeed: (typeof sampleProviders)[number]) {
  const user = await prisma.user.upsert({
    where: { phone: providerSeed.phone },
    update: {
      role: 'PROVIDER',
    },
    create: {
      id: crypto.randomUUID(),
      phone: providerSeed.phone,
      role: 'PROVIDER',
    },
  })

  const provider = await prisma.provider.upsert({
    where: { userId: user.id },
    update: {
      type: providerSeed.type,
      displayName: providerSeed.displayName,
      bio: providerSeed.bio,
      city: 'Batangas City',
      isVerified: true,
      photos: [],
    },
    create: {
      id: crypto.randomUUID(),
      userId: user.id,
      type: providerSeed.type,
      displayName: providerSeed.displayName,
      bio: providerSeed.bio,
      city: 'Batangas City',
      isVerified: true,
      photos: [],
    },
  })

  const existingService = await prisma.service.findFirst({
    where: {
      providerId: provider.id,
      name: providerSeed.serviceName,
    },
  })

  const service = existingService
    ? await prisma.service.update({
        where: { id: existingService.id },
        data: {
          category: providerSeed.category,
          priceMin: providerSeed.baseRate,
          priceMax: providerSeed.baseRate * 3,
          duration: providerSeed.duration,
        },
      })
    : await prisma.service.create({
        data: {
          id: crypto.randomUUID(),
          providerId: provider.id,
          name: providerSeed.serviceName,
          category: providerSeed.category,
          priceMin: providerSeed.baseRate,
          priceMax: providerSeed.baseRate * 3,
          duration: providerSeed.duration,
        },
      })

  const score =
    providerSeed.responseRate / 100 * 0.25 +
    providerSeed.completionRate / 100 * 0.35 +
    providerSeed.reviewAverage / 5 * 0.3 +
    0.1

  await prisma.favourScore.upsert({
    where: { providerId: provider.id },
    update: {
      overall: Math.round(score * 100) / 100,
      responseRate: providerSeed.responseRate / 100,
      completionRate: providerSeed.completionRate / 100,
      reviewAverage: providerSeed.reviewAverage,
      recency: 1,
    },
    create: {
      id: crypto.randomUUID(),
      providerId: provider.id,
      overall: Math.round(score * 100) / 100,
      responseRate: providerSeed.responseRate / 100,
      completionRate: providerSeed.completionRate / 100,
      reviewAverage: providerSeed.reviewAverage,
      recency: 1,
    },
  })

  console.log(`Seeded provider ${providerSeed.displayName}`)

  return { provider, service }
}

async function main() {
  const providerLookup = new Map<string, Awaited<ReturnType<typeof upsertProvider>>>()

  for (const providerSeed of sampleProviders) {
    const seeded = await upsertProvider(providerSeed)
    providerLookup.set(providerSeed.phone, seeded)
  }

  const customer = await prisma.user.upsert({
    where: { phone: sampleCustomer.phone },
    update: {
      role: 'CUSTOMER',
    },
    create: {
      id: crypto.randomUUID(),
      phone: sampleCustomer.phone,
      role: 'CUSTOMER',
    },
  })

  for (const bookingSeed of sampleBookings) {
    const providerBundle = providerLookup.get(bookingSeed.providerPhone)
    if (!providerBundle) {
      throw new Error(`Missing seeded provider for ${bookingSeed.providerPhone}`)
    }

    await prisma.booking.upsert({
      where: { referenceCode: bookingSeed.referenceCode },
      update: {
        customerId: customer.id,
        providerId: providerBundle.provider.id,
        serviceId: providerBundle.service.id,
        status: bookingSeed.status,
        datetime: bookingSeed.datetime,
        address: bookingSeed.address,
        notes: bookingSeed.notes,
      },
      create: {
        id: crypto.randomUUID(),
        referenceCode: bookingSeed.referenceCode,
        customerId: customer.id,
        providerId: providerBundle.provider.id,
        serviceId: providerBundle.service.id,
        status: bookingSeed.status,
        datetime: bookingSeed.datetime,
        address: bookingSeed.address,
        notes: bookingSeed.notes,
      },
    })

    console.log(`Seeded booking ${bookingSeed.referenceCode}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
