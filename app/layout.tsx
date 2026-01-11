import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "FocusStudy - Planejador de Estudos para Concursos e Faculdade",
    template: "%s | FocusStudy",
  },
  description:
    "Organize seus estudos com o FocusStudy. Gerencie tarefas, crie anotacoes estruturadas e use a tecnica Pomodoro para maximizar seu foco. Ideal para concurseiros e universitarios.",
  keywords: [
    "planejador de estudos",
    "concursos",
    "faculdade",
    "pomodoro",
    "organizacao",
    "tarefas",
    "notas",
    "estudo",
    "produtividade",
    "foco",
  ],
  authors: [{ name: "FocusStudy" }],
  creator: "FocusStudy",
  publisher: "FocusStudy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://focus-study.online",
    siteName: "FocusStudy",
    title: "FocusStudy - Planejador de Estudos para Concursos e Faculdade",
    description:
      "Organize seus estudos com tarefas, notas e tecnica Pomodoro. Ideal para concurseiros e universitarios.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FocusStudy - Planejador de Estudos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusStudy - Planejador de Estudos",
    description: "Organize seus estudos com tarefas, notas e tecnica Pomodoro.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://focus-study.online",
  },
  category: "education",
  generator: "Next.js",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
