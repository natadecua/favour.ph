import type { PrismaClient } from '@prisma/client'
import type { BookingStatus } from '@favour/shared'

export function createBookingsRepo(prisma: PrismaClient) {
  return {
    async create(data: {
      referenceCode: string
      customerId: string
      providerId: string
      serviceId: string
      datetime: Date
      address: string
      notes?: string
    }) {
      return prisma.booking.create({ data })
    },

    async findById(id: string) {
      return prisma.booking.findUnique({
        where: { id },
        include: { service: true, provider: true, customer: true },
      })
    },

    async updateStatus(id: string, status: BookingStatus, data?: { notes?: string }) {
      return prisma.booking.update({ where: { id }, data: { status, ...data } })
    },

    async findByCustomer(customerId: string) {
      return prisma.booking.findMany({
        where: { customerId },
        include: { service: true, provider: true },
        orderBy: { createdAt: 'desc' },
      })
    },

    async findByProvider(providerId: string) {
      return prisma.booking.findMany({
        where: { providerId },
        include: { service: true, customer: true },
        orderBy: { createdAt: 'desc' },
      })
    },
  }
}
