import type { Booking, Provider, Review } from '@favour/shared'

const BASE = process.env.NEXT_PUBLIC_API_URL!

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.error ?? 'Request failed'), { status: res.status })
  }
  return res.json() as Promise<T>
}

export const api = {
  providers: {
    feed: (params?: Record<string, string>) =>
      request<Provider[]>(`/providers?${new URLSearchParams(params)}`),
    getById: (id: string) => request<Provider>(`/providers/${id}`),
  },
  bookings: {
    create: (body: unknown, token: string) =>
      request<Booking>('/bookings', {
        method: 'POST', body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
    getById: (id: string, token: string) =>
      request<Booking>(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    respond: (id: string, body: unknown, token: string) =>
      request<Booking>(`/bookings/${id}/respond`, {
        method: 'PATCH', body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
    cancel: (id: string, body: unknown, token: string) =>
      request<Booking>(`/bookings/${id}/cancel`, {
        method: 'PATCH', body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
    complete: (id: string, token: string) =>
      request<Booking>(`/bookings/${id}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  reviews: {
    create: (body: unknown, token: string) =>
      request<Review>('/reviews', {
        method: 'POST', body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  uploads: {
    sign: (body: unknown, token: string) =>
      request<{ signedUrl: string; path: string }>('/uploads/sign', {
        method: 'POST', body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
}
