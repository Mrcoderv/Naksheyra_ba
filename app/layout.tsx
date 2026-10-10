import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { getContent } from '@/lib/content'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  let seo: any = {}
  try {
    seo = (await getContent()).seo || {}
  } catch {}
  const keywords = typeof seo.keywords === 'string' ? seo.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : undefined
  return {
    title: seo.title || 'Nakshatra Business Advisory | Plan Today. Prosper Tomorrow.',
    description: seo.description,
    generator: 'v0.app',
    keywords,
    openGraph: {
      title: seo.title || 'Nakshatra Business Advisory',
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
      type: 'website',
      locale: 'en_NP',
    },
    icons: {
      icon: [
        { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
        { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0b1b3d',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
