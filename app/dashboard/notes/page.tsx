import { createClient } from "@/lib/supabase/server"
import { NotesList } from "@/components/notes/notes-list"
import { CreateNoteDialog } from "@/components/notes/create-note-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function NotesPage() {
  const supabase = await createClient()

  // Obtém o usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null // Se não estiver logado, não renderiza nada

  // Busca todas as notas do usuário, incluindo dados da disciplina relacionada
  const { data: notes } = await supabase
    .from("notes")
    .select("*, discipline:disciplines(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  // Busca todas as disciplinas do usuário para o select no modal de criação
  const { data: disciplines } = await supabase
    .from("disciplines")
    .select("*")
    .eq("user_id", user.id)
    .order("name")

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas</h1>
          <p className="text-muted-foreground">Suas anotações de estudo organizadas</p>
        </div>

        {/* Botão de criar nova nota */}
        <CreateNoteDialog disciplines={disciplines || []}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Nota
          </Button>
        </CreateNoteDialog>
      </div>

      {/* Lista de notas */}
      <NotesList notes={notes || []} disciplines={disciplines || []} />
    </div>
  )
}
