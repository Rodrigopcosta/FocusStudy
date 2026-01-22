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

  if (!user) return null

  /**
   * PERFORMANCE: Executamos as duas buscas em paralelo.
   * Usamos '*' para garantir que todas as propriedades exigidas pelas interfaces
   * (como user_id, created_at, etc) estejam presentes, evitando erros de tipo.
   */
  const [notesResponse, disciplinesResponse] = await Promise.all([
    supabase
      .from("notes")
      .select("*, discipline:disciplines(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("disciplines")
      .select("*")
      .eq("user_id", user.id)
      .order("name")
  ])

  const notes = notesResponse.data || []
  const disciplines = disciplinesResponse.data || []

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas</h1>
          <p className="text-muted-foreground">Suas anotações de estudo organizadas</p>
        </div>

        {/* Botão de criar nova nota */}
        <CreateNoteDialog disciplines={disciplines}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Nota
          </Button>
        </CreateNoteDialog>
      </div>

      {/* Lista de notas */}
      <NotesList notes={notes} disciplines={disciplines} />
    </div>
  )
}