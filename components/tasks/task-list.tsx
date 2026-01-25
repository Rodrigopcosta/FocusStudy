"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Task, Discipline } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Timer, Calendar, Clock, Pin, PinOff } from "lucide-react"
import { EditTaskDialog } from "./edit-task-dialog"
import Link from "next/link"

interface TaskListProps {
  tasks: Task[]
  disciplines: Discipline[]
}

const priorityColors = {
  low: "bg-blue-500/20 text-blue-500",
  medium: "bg-yellow-500/20 text-yellow-600",
  high: "bg-orange-500/20 text-orange-500",
  urgent: "bg-red-500/20 text-red-600 font-bold",
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
  const [localTasks, setLocalTasks] = useState(initialTasks)
  const isUpdating = useRef(false)

  useEffect(() => {
    if (!isUpdating.current) setLocalTasks(initialTasks)
  }, [initialTasks])

  // Lógica de Ordenação e Filtro combinada
  const processedTasks = useMemo(() => {
    let filtered = localTasks.filter((task) => {
      const statusF = searchParams.get("status") || "all"
      const discF = searchParams.get("discipline") || "all"
      const prioF = searchParams.get("priority") || "all"

      if (statusF !== "all" && task.status !== statusF) return false
      if (discF !== "all" && task.discipline_id !== discF) return false
      if (prioF !== "all" && task.priority !== prioF) return false
      return true
    })

    // Ordenação: 1º Pinned, 2º Pendentes, 3º Concluídas
    return filtered.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1
      return 0
    })
  }, [localTasks, searchParams])

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    const updatedStatus = completed ? "completed" : "pending"
    isUpdating.current = true
    
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: updatedStatus } : t))

    const supabase = createClient()
    await supabase.from("tasks").update({
      status: updatedStatus,
      completed_at: completed ? new Date().toISOString() : null,
      is_pinned: false // Desafixa ao concluir (opcional, comum em apps de produtividade)
    }).eq("id", taskId)
    
    router.refresh()
    setTimeout(() => { isUpdating.current = false }, 800)
  }

  const handleTogglePin = async (task: Task) => {
    const supabase = createClient()
    const newPinStatus = !task.is_pinned
    
    setLocalTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_pinned: newPinStatus } : t))
    await supabase.from("tasks").update({ is_pinned: newPinStatus }).eq("id", task.id)
    router.refresh()
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Excluir esta tarefa?")) return
    const supabase = createClient()
    await supabase.from("tasks").delete().eq("id", taskId)
    router.refresh()
  }

  return (
    <>
      <div className="space-y-3">
        {processedTasks.map((task) => (
          <Card 
            key={task.id} 
            className={`transition-all border-l-4 ${task.status === "completed" ? "opacity-60 bg-accent/30" : "bg-card hover:shadow-md"}`}
            style={{ borderLeftColor: task.discipline?.color || "transparent" }}
          >
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                  className="h-5 w-5 mt-1" 
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold truncate ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        {task.is_pinned && <Pin className="h-3 w-3 fill-primary text-primary" />}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => handleTogglePin(task)}
                      >
                        {task.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingTask(task)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/pomodoro?task=${task.id}`}>
                              <Timer className="mr-2 h-4 w-4" /> Pomodoro
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {task.discipline && (
                      <Badge 
                        variant="secondary"
                        style={{ backgroundColor: `${task.discipline.color}15`, color: task.discipline.color, border: `1px solid ${task.discipline.color}30` }}
                      >
                        {task.discipline.icon} {task.discipline.name}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {typeLabels[task.type as keyof typeof typeLabels]}
                    </Badge>
                    <Badge className={`text-[10px] uppercase ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                      {task.priority}
                    </Badge>
                    
                    <div className="ml-auto flex items-center gap-3 text-muted-foreground">
                      {task.due_date && (
                        <span className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                      <span className="text-xs flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {Math.floor(task.estimated_minutes / 60)}h{task.estimated_minutes % 60}m
                      </span>
                    </div>
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