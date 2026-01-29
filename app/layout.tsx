import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { CookieBanner } from "@/components/ui/cookie-banner"
import { Toaster } from "sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://focus-study.online"),
  title: {
    default: "FocusStudy - Planejador de Estudos para Concursos e Faculdade",
    template: "%s | FocusStudy",
  },
  description:
    "Organize seus estudos com o FocusStudy. Gerencie tarefas, crie anotações estruturadas e use a técnica Pomodoro para maximizar seu foco. Ideal para concurseiros e universitários.",
  keywords: [
    "planejador de estudos",
    "concursos",
    "faculdade",
    "pomodoro",
    "organização",
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
      "Organize seus estudos com tarefas, notas e técnica Pomodoro. Ideal para concurseiros e universitários.",
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
    description: "Organize seus estudos com tarefas, notas e técnica Pomodoro.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://focus-study.online",
  },
  category: "education",
  generator: "Next.js",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
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
          <CookieBanner />
          {/* 2. ADICIONE O TOASTER AQUI */}
          <Toaster position="top-right" richColors closeButton /> 
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}