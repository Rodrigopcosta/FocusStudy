'use client'

import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'
import { UpgradeBanner } from '@/components/dashboard/upgrade-banner'

// Mapeia rotas para nomes amigáveis
const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/tasks': 'Tarefas',
  '/dashboard/notes': 'Anotações',
  '/dashboard/pomodoro': 'Pomodoro',
  '/dashboard/settings': 'Configurações',
}

interface DashboardHeaderProps {
  user: User
  profile: Profile | null | any // Adicionado 'any' temporariamente ou você deve atualizar a interface Profile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const pathname = usePathname()
  const pageName = pageNames[pathname] || 'Dashboard'

  // Acessando via index signature ou cast para evitar o erro de tipagem caso o Profile esteja desatualizado
  const isFreePlan = !profile?.plan_type || profile?.plan_type === 'free'

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{pageName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-4">
        {isFreePlan && (
          <div className="hidden lg:block">
            <UpgradeBanner />
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
