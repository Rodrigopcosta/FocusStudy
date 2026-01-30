'use client'

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light" // Define um padrão fixo
      enableSystem={false} // Desabilita a detecção do sistema operacional
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
