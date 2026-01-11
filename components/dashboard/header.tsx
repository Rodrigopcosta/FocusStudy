"use client"

import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/tasks": "Tarefas",
  "/dashboard/notes": "Notas",
  "/dashboard/pomodoro": "Pomodoro",
  "/dashboard/settings": "Configuracoes",
}

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const pathname = usePathname()
  const pageName = pageNames[pathname] || "Dashboard"

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
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
