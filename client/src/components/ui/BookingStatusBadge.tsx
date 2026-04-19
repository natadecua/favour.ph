import type { BookingStatus } from '@favour/shared'
import { Pill } from './Pill'

const statusConfig: Record<BookingStatus, { label: string; color: 'blue' | 'green' | 'amber' | 'dark' }> = {
  PENDING:   { label: 'PENDING',   color: 'amber' },
  CONFIRMED: { label: 'CONFIRMED', color: 'blue'  },
  DECLINED:  { label: 'DECLINED',  color: 'dark'  },
  COMPLETED: { label: 'COMPLETED', color: 'green' },
  CANCELLED: { label: 'CANCELLED', color: 'dark'  },
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { label, color } = statusConfig[status]
  return <Pill color={color}>{label}</Pill>
}
