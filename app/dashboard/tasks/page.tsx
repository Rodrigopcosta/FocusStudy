import { createClient } from '@/lib/supabase/server'
import { TaskList } from '@/components/tasks/task-list'
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Removida a ordenação complexa do banco para deixar o TaskList
  // gerenciar a lógica de ordenação personalizada/manual e status.
  const { data: tasksRes } = await supabase
    .from('tasks')
    .select('*, discipline:disciplines(*)')
    .eq('user_id', user.id)

  const { data: disciplinesRes } = await supabase
    .from('disciplines')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  const tasks = tasksRes || []
  const disciplines = disciplinesRes || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie suas tarefas de estudo
          </p>
        </div>
        <CreateTaskDialog disciplines={disciplines}>
          <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </CreateTaskDialog>
      </div>

      {/* O TaskFilters foi removido daqui porque agora ele está 
          embutido dentro do TaskList com a função de Collapsible no mobile.
      */}
      <TaskList tasks={tasks} disciplines={disciplines} />
    </div>
  )
}
