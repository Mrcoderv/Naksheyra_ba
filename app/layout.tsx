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
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0b0f19',
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
