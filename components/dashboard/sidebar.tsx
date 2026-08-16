'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/types/database'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  BookOpen,
  LayoutDashboard,
  CheckSquare,
  FileText,
  Timer,
  Settings,
  Flame,
  GraduationCap,
  HelpCircle,
  Trophy,
  Layers,
  Brain,
  Sparkles, // Ícone para o Resumo
} from 'lucide-react'

const menuItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Tarefas', href: '/dashboard/tasks', icon: CheckSquare },
  { title: 'Anotações', href: '/dashboard/notes', icon: FileText },
  { title: 'Disciplinas', href: '/dashboard/disciplines', icon: GraduationCap },
  { title: 'Pomodoro', href: '/dashboard/pomodoro', icon: Timer },
  { title: 'Jornada', href: '/dashboard/jornada', icon: Trophy },
  { title: 'Flashcards', href: '/dashboard/flashcards', icon: Layers },
  { title: 'Estudar', href: '/dashboard/study', icon: Brain },
  { title: 'Resumir IA', href: '/dashboard/summarize', icon: Sparkles }, // ADICIONADO AQUI
]

interface DashboardSidebarProps {
  profile: Profile | null
}

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { isMobile, setOpen, setOpenMobile } = useSidebar()

  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    } else {
      setOpen(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">FocusStudy</span>
          <SidebarTrigger
            className="ml-auto"
            aria-label="Fechar menu lateral"
            title="Fechar menu lateral"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    onClick={closeSidebar}
                  >
                    <Link href={item.href} prefetch={true}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {profile && profile.streak_current > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Sequência</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">
                    {profile.streak_current} dias
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recorde: {profile.streak_best}
                  </p>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/dashboard/settings'}
                  onClick={closeSidebar}
                >
                  <Link href="/dashboard/settings" prefetch={true}>
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ajuda</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={closeSidebar}>
                  <Link href="/faq" target="_blank">
                    <HelpCircle className="h-4 w-4" />
                    <span>Perguntas Frequentes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
