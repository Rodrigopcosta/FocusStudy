import { createClient } from "@/lib/supabase/server"
import { TaskList } from "@/components/tasks/task-list"
import { TaskFilters } from "@/components/tasks/task-filters"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const sort = (searchParams.sort as string) || "created_at"
  const order = (searchParams.order as string) || "desc"

  let query = supabase
    .from("tasks")
    .select("*, discipline:disciplines(*)")
    .eq("user_id", user.id)
    
  // Prioriza tarefas fixadas (is_pinned), depois tarefas não concluídas, depois a ordenação escolhida
  query = query
    .order("is_pinned", { ascending: false })
    .order("status", { ascending: false }) // 'pending' vem antes de 'completed' alfabeticamente? Não, melhor tratar no front.
    .order(sort, { ascending: order === "asc" })

  const [tasksRes, disciplinesRes] = await Promise.all([
    query,
    supabase
      .from("disciplines")
      .select("*")
      .eq("user_id", user.id)
      .order("name")
  ])

  const tasks = tasksRes.data || []
  const disciplines = disciplinesRes.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">Gerencie suas tarefas de estudo</p>
        </div>
        <CreateTaskDialog disciplines={disciplines}>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </CreateTaskDialog>
      </div>

      <TaskFilters disciplines={disciplines} />
      <TaskList tasks={tasks} disciplines={disciplines} />
    </div>
  )
}