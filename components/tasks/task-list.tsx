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
import { MoreHorizontal, Pencil, Trash2, Timer, Calendar, Clock, Pin, PinOff, CheckCheck } from "lucide-react"
import { EditTaskDialog } from "./edit-task-dialog"
import { TaskSort, type SortOption } from "./task-sort"
import Link from "next/link"

interface TaskListProps {
  tasks: Task[]
  disciplines: Discipline[]
}

const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 }

const priorityBorderColors = {
  low: "#3b82f6",
  medium: "#eab308",
  high: "#f97316",
  urgent: "#ef4444",
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-600 border-blue-200",
  medium: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  high: "bg-orange-500/10 text-orange-600 border-orange-200",
  urgent: "bg-red-500/10 text-red-600 border-red-200 font-bold",
}

const typeLabels = { theory: "Teoria", review: "Revisão", questions: "Questões" }

export function TaskList({ tasks: initialTasks, disciplines }: TaskListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [localTasks, setLocalTasks] = useState(initialTasks)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const isUpdating = useRef(false)

  useEffect(() => {
    if (!isUpdating.current) setLocalTasks(initialTasks)
  }, [initialTasks])

  const processedTasks = useMemo(() => {
    let result = localTasks.filter((task) => {
      const statusF = searchParams.get("status") || "all"
      const discF = searchParams.get("discipline") || "all"
      const prioF = searchParams.get("priority") || "all"

      if (statusF !== "all" && task.status !== statusF) return false
      if (discF !== "all" && task.discipline_id !== discF) return false
      if (prioF !== "all" && task.priority !== prioF) return false
      return true
    })

    return result.sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1

      switch (sortBy) {
        case "priority-desc":
          return priorityWeight[b.priority as keyof typeof priorityWeight] - priorityWeight[a.priority as keyof typeof priorityWeight]
        case "priority-asc":
          return priorityWeight[a.priority as keyof typeof priorityWeight] - priorityWeight[b.priority as keyof typeof priorityWeight]
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        default:
          return 0
      }
    })
  }, [localTasks, searchParams, sortBy])

  // Helper para formatar data de forma amigável
  const formatTaskDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const isToday = date.toDateString() === today.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()

    const time = date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })
    
    if (isToday) return `Hoje às ${time}`
    if (isTomorrow) return `Amanhã às ${time}`
    
    return date.toLocaleDateString("pt-BR", { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    const updatedStatus = completed ? "completed" : "pending"
    isUpdating.current = true
    
    setLocalTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: updatedStatus, is_pinned: completed ? false : t.is_pinned } : t
    ))

    const supabase = createClient()
    await supabase.from("tasks").update({
      status: updatedStatus,
      completed_at: completed ? new Date().toISOString() : null,
      is_pinned: completed ? false : undefined
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

  const handleMarkAllAsCompleted = async () => {
    const pendingTasks = processedTasks.filter(t => t.status === "pending")
    if (pendingTasks.length === 0) return
    if (!confirm(`Marcar ${pendingTasks.length} tarefas como concluídas?`)) return

    const pendingIds = pendingTasks.map(t => t.id)
    const now = new Date().toISOString()
    isUpdating.current = true
    
    setLocalTasks(prev => prev.map(t => 
      pendingIds.includes(t.id) ? { ...t, status: "completed", is_pinned: false, completed_at: now } : t
    ))

    const supabase = createClient()
    await supabase.from("tasks").update({ status: "completed", completed_at: now, is_pinned: false }).in("id", pendingIds)
    router.refresh()
    setTimeout(() => { isUpdating.current = false }, 800)
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAllAsCompleted}
          disabled={!processedTasks.some(t => t.status === "pending")}
          className="text-xs h-9 gap-2 justify-center"
        >
          <CheckCheck className="h-4 w-4" />
          Concluir Visíveis
        </Button>
        <TaskSort value={sortBy} onValueChange={setSortBy} />
      </div>

      <div className="space-y-3">
        {processedTasks.map((task) => (
          <Card 
            key={task.id} 
            className={`transition-all border-l-[6px] shadow-sm ${
              task.status === "completed" ? "opacity-60 bg-muted/20" : "bg-card hover:border-l-primary"
            }`}
            style={{ borderLeftColor: priorityBorderColors[task.priority as keyof typeof priorityBorderColors] }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                  className="h-5 w-5 mt-0.5 rounded-full" 
                />
                
                <div className="flex-1 min-w-0">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm sm:text-base leading-tight truncate ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </span>
                        {task.is_pinned && <Pin className="h-3 w-3 fill-primary text-primary flex-shrink-0" />}
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => setEditingTask(task)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePin(task)}>
                            {task.is_pinned ? <><PinOff className="mr-2 h-4 w-4" /> Desfixar</> : <><Pin className="mr-2 h-4 w-4" /> Fixar</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/pomodoro?task=${task.id}`}>
                              <Timer className="mr-2 h-4 w-4" /> Pomodoro
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Badges e Disciplina */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {task.discipline && (
                      <Badge 
                        variant="secondary"
                        style={{ backgroundColor: `${task.discipline.color}15`, color: task.discipline.color }}
                        className="text-[10px] font-bold px-1.5 py-0 border-none"
                      >
                        {task.discipline.icon} {task.discipline.name}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase font-medium">
                      {typeLabels[task.type as keyof typeof typeLabels]}
                    </Badge>
                    <Badge className={`text-[9px] px-1 py-0 border ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                      {task.priority.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Data e Tempo - Rodapé do Card */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-muted">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      {task.start_date && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3 text-primary/70" />
                          <span>{formatTaskDate(task.start_date)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground bg-muted px-2 py-0.5 rounded">
                      <Clock className="h-3 w-3" />
                      {Math.floor(task.estimated_minutes / 60)}h{task.estimated_minutes % 60}m
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {processedTasks.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
            <p className="text-muted-foreground text-sm">Nenhuma tarefa encontrada com estes filtros.</p>
          </div>
        )}
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