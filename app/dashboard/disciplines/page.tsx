import { createClient } from "@/lib/supabase/server"
import { DisciplinesList } from "@/components/disciplines/disciplines-list"
import { CreateDisciplineDialog } from "@/components/disciplines/create-discipline-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Definindo o tipo esperado pelos componentes para evitar o erro "Type string is not assignable"
type StudyType = 'exam' | 'college';

export const metadata = {
  title: "Disciplinas",
}

export default async function DisciplinesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: disciplines } = await supabase
    .from("disciplines")
    .select("*")
    .eq("user_id", user.id)
    .order("name")

  // Inicializamos com o tipo explícito StudyType
  let studyType: StudyType = "exam"

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("study_type")
      .eq("id", user.id)
      .maybeSingle()

    // Usamos o Type Casting 'as StudyType' para validar a string vinda do banco
    if (!error && profile?.study_type) {
      studyType = profile.study_type as StudyType
    }
  } catch {
    // Se a coluna não existir ou houver erro, mantém o padrão "exam"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disciplinas</h1>
          <p className="text-muted-foreground">
            {studyType === "college"
              ? "Organize suas disciplinas por curso e matéria"
              : "Organize suas disciplinas de estudo para concursos"}
          </p>
        </div>
        
        {/* Agora o TypeScript entende que studyType é compatível com o Dialog */}
        <CreateDisciplineDialog studyType={studyType}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Disciplina
          </Button>
        </CreateDisciplineDialog>
      </div>

      {/* Agora o TypeScript entende que studyType é compatível com a List */}
      <DisciplinesList disciplines={disciplines || []} studyType={studyType} />
    </div>
  )
}