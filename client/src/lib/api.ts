import type {
  Booking,
  CancelBookingInput,
  CreateBookingInput,
  CreateProviderInput,
  CreateReviewInput,
  ProviderDetail,
  ProviderSummary,
  RespondToBookingInput,
  Review,
} from '@favour/shared'

const BASE = process.env.NEXT_PUBLIC_API_URL!

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
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
      request<ProviderSummary[]>(`/providers?${new URLSearchParams(params)}`),
    getById: (id: string) => request<ProviderDetail>(`/providers/${id}`),
    create: (body: CreateProviderInput, token: string) =>
      request<ProviderDetail>('/providers', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
  bookings: {
    create: (body: CreateBookingInput, token: string) =>
      request<Booking>('/bookings', {
        method: 'POST', body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
    list: (token: string, scope?: 'provider' | 'customer') =>
      request<Booking[]>(`/bookings${scope ? `?scope=${scope}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    getById: (id: string, token: string) =>
      request<Booking>(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    respond: (id: string, body: RespondToBookingInput, token: string) =>
      request<Booking>(`/bookings/${id}/respond`, {
        method: 'PATCH', body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
    cancel: (id: string, body: CancelBookingInput, token: string) =>
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
    create: (body: CreateReviewInput, token: string) =>
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
  auth: {
    devLogin: (identity: 'customer' | 'provider') =>
      request<{ accessToken: string; userId: string; role: string; providerId: string | null }>(
        '/auth/dev-login',
        {
          method: 'POST',
          body: JSON.stringify({ identity }),
        }
      ),
    me: (token: string) =>
      request<{ userId: string; role: string; providerId: string | null }>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      }),
  },
}
