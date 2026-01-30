import type React from 'react'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { CookieBanner } from '@/components/ui/cookie-banner'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  metadataBase: new URL('https://focus-study.com.br'),
  title: {
    default: 'FocusStudy | O Método de Elite para sua Aprovação',
    template: '%s | FocusStudy',
  },
  description:
    'Blinde sua concentração e domine o edital. O FocusStudy é a plataforma definitiva com IA, Pomodoro e gestão de alta performance para concurseiros e universitários de elite.',
  keywords: [
    'planejador de estudos',
    'estudo para concursos',
    'método de aprovação',
    'cronograma inteligente',
    'pomodoro para concursos',
    'foco e produtividade',
    'gestão de estudos IA',
    'organização universitária',
  ],
  authors: [{ name: 'FocusStudy' }],
  creator: 'FocusStudy',
  publisher: 'FocusStudy',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://focus-study.com.br',
    siteName: 'FocusStudy',
    title: 'FocusStudy | Foco Total, Resultado Real',
    description:
      'A estrutura profissional que sua aprovação exige. Domine o edital com inteligência e blindagem de foco.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FocusStudy - Plataforma de Estudo de Alta Performance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FocusStudy | Domine seu Edital',
    description:
      'Transforme seu estudo em uma máquina de resultados com o FocusStudy.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://focus-study.com.br',
  },
  category: 'education',
  generator: 'Next.js',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <CookieBanner />
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
