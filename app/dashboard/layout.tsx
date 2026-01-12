import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Obtém o usuário logado
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Redireciona para login se não houver usuário ou houver erro
  if (error || !user) {
    redirect("/login")
  }

  // Busca o perfil do usuário no banco
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <SidebarProvider>
      {/* Sidebar principal */}
      <DashboardSidebar user={user} profile={profile} />

      {/* Conteúdo principal com header fixo */}
      <SidebarInset>
        <DashboardHeader user={user} profile={profile} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
