"use client"

import { useState, useEffect } from "react" // Adicionado useEffect
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Task, Discipline } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Timer, Calendar, Clock } from "lucide-react"
import { EditTaskDialog } from "./edit-task-dialog"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

interface TaskListProps {
  tasks: Task[]
  disciplines: Discipline[]
}

const priorityColors = {
  low: "bg-chart-2/20 text-chart-2",
  medium: "bg-chart-4/20 text-chart-4",
  high: "bg-destructive/20 text-destructive",
}

const typeLabels = {
  theory: "Teoria",
  review: "Revisão",
  questions: "Questões",
}

export function TaskList({ tasks: initialTasks, disciplines }: TaskListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  // Estado local para resposta instantânea
  const [localTasks, setLocalTasks] = useState(initialTasks)

  // Sincroniza estado local quando as props mudarem (ex: após router.refresh)
  useEffect(() => {
    setLocalTasks(initialTasks)
  }, [initialTasks])

  const statusFilter = searchParams.get("status") || "all"
  const disciplineFilter = searchParams.get("discipline") || "all"
  const priorityFilter = searchParams.get("priority") || "all"

  const filteredTasks = localTasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false
    if (disciplineFilter !== "all" && task.discipline_id !== disciplineFilter) return false
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false
    return true
  })

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    const updatedStatus = completed ? "completed" : "pending"
    
    // 1. Atualização Otimista
    setLocalTasks(prev => 
      prev.map(t => t.id === taskId ? { ...t, status: updatedStatus } : t)
    )

    const supabase = createClient()
    const { error } = await supabase
      .from("tasks")
      .update({
        status: updatedStatus,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", taskId)
    
    if (error) {
      setLocalTasks(initialTasks) // Reverte em caso de erro
    } else {
      router.refresh()
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    // Confirmação simples conforme checklist item 4
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return

    const supabase = createClient()
    await supabase.from("tasks").delete().eq("id", taskId)
    router.refresh()
  }

  if (filteredTasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {localTasks.length === 0
              ? "Nenhuma tarefa criada ainda. Crie sua primeira tarefa!"
              : "Nenhuma tarefa encontrada com os filtros selecionados."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} className={task.status === "completed" ? "opacity-60" : ""}>
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                {/* Wrapper para aumentar área de clique (Checklist item 1) */}
                <div className="flex items-center justify-center min-w-6 min-h-6 mt-1">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                    className="h-5 w-5" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTask(task)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/pomodoro?task=${task.id}`}>
                            <Timer className="mr-2 h-4 w-4" />
                            Iniciar Pomodoro
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* ... Restante do código (Badges e Metadados) mantido exatamente igual */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {task.discipline && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${task.discipline.color}20`,
                          color: task.discipline.color,
                        }}
                      >
                        {task.discipline.icon} {task.discipline.name}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {typeLabels[task.type]}
                    </Badge>
                    <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority]}`}>
                      {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                    </Badge>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.estimated_minutes}min
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          disciplines={disciplines}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}
    </>
  )
}