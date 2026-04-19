import type { Metadata } from 'next'
import { Manrope, Figtree, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/Providers'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-figtree',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Favour.ph — Book trusted home pros near you',
  description: 'Find verified home service providers in Batangas City. Aircon, plumbing, electrical, cleaning and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${figtree.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-surface min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
