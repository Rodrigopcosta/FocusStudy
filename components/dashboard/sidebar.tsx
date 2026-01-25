"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  BookOpen,
  LayoutDashboard,
  CheckSquare,
  FileText,
  Timer,
  Settings,
  LogOut,
  ChevronUp,
  Flame,
  GraduationCap,
  HelpCircle,
  Trophy,
} from "lucide-react"

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Tarefas", href: "/dashboard/tasks", icon: CheckSquare },
  { title: "Anotações", href: "/dashboard/notes", icon: FileText },
  { title: "Disciplinas", href: "/dashboard/disciplines", icon: GraduationCap },
  { title: "Pomodoro", href: "/dashboard/pomodoro", icon: Timer },
  { title: "Jornada", href: "/dashboard/jornada", icon: Trophy },
]

interface DashboardSidebarProps {
  user: User
  profile: Profile | null
}

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    if (isMobile) setOpenMobile(false)
    router.push("/login")
  }

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  const initials =
    profile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user.email?.slice(0, 2).toUpperCase() ||
    "US"

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">FocusStudy</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    onClick={closeMobile}
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
                  <p className="text-sm font-medium">{profile.streak_current} dias</p>
                  <p className="text-xs text-muted-foreground">Recorde: {profile.streak_best}</p>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Ajuda</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={closeMobile}>
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
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-sidebar-primary text-sidebar-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left truncate">{profile?.name || user.email}</span>
                  <ChevronUp className="h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-(--radix-popper-anchor-width)">
                <DropdownMenuItem asChild onClick={closeMobile}>
                  <Link href="/dashboard/settings" prefetch={true}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}