import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()

  // Obtém o usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null // Se não houver usuário logado, não renderiza nada

  // Busca o perfil do usuário no banco
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="max-w-2xl space-y-6">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e conta</p>
      </div>

      {/* Formulário de configurações, passando perfil e email */}
      <SettingsForm profile={profile} userEmail={user.email || ""} />
    </div>
  )
}
