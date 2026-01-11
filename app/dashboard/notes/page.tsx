import { createClient } from "@/lib/supabase/server"
import { NotesList } from "@/components/notes/notes-list"
import { CreateNoteDialog } from "@/components/notes/create-note-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function NotesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: notes } = await supabase
    .from("notes")
    .select("*, discipline:disciplines(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  const { data: disciplines } = await supabase.from("disciplines").select("*").eq("user_id", user.id).order("name")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas</h1>
          <p className="text-muted-foreground">Suas anotacoes de estudo organizadas</p>
        </div>
        <CreateNoteDialog disciplines={disciplines || []}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Nota
          </Button>
        </CreateNoteDialog>
      </div>

      <NotesList notes={notes || []} disciplines={disciplines || []} />
    </div>
  )
}
