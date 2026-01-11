import { createClient } from "@/lib/supabase/server"
import { TaskList } from "@/components/tasks/task-list"
import { TaskFilters } from "@/components/tasks/task-filters"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function TasksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, discipline:disciplines(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: disciplines } = await supabase.from("disciplines").select("*").eq("user_id", user.id).order("name")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">Gerencie suas tarefas de estudo</p>
        </div>
        <CreateTaskDialog disciplines={disciplines || []}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </CreateTaskDialog>
      </div>

      <TaskFilters disciplines={disciplines || []} />
      <TaskList tasks={tasks || []} disciplines={disciplines || []} />
    </div>
  )
}
