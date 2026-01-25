"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Task, Discipline } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Pencil, Trash2, Timer, Calendar, Clock, Pin, PinOff, CheckCheck, AlertCircle } from "lucide-react"
import { EditTaskDialog } from "./edit-task-dialog"
import { TaskSort, type SortOption } from "./task-sort"
import Link from "next/link"

interface TaskListProps {
  tasks: Task[]
  disciplines: Discipline[]
}

const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 }

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400",
  urgent: "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 font-bold",
}

const priorityBorderColors = {
  low: "border-l-blue-500",
  medium: "border-l-yellow-500",
  high: "border-l-orange-500",
  urgent: "border-l-red-500",
}

const typeLabels = { theory: "Teoria", review: "Revisão", questions: "Questões" }

export function TaskList({ tasks: initialTasks, disciplines }: TaskListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false)
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
      
      // Filtro de prioridade agora aceita match exato baseado nos novos SelectItems
      if (prioF !== "all" && task.priority.toLowerCase() !== prioF.toLowerCase()) return false
      
      return true
    })

    return result.sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1

      switch (sortBy) {
        case "priority-desc":
          return (priorityWeight[b.priority as keyof typeof priorityWeight] || 0) - (priorityWeight[a.priority as keyof typeof priorityWeight] || 0)
        case "priority-asc":
          return (priorityWeight[a.priority as keyof typeof priorityWeight] || 0) - (priorityWeight[b.priority as keyof typeof priorityWeight] || 0)
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        default:
          return 0
      }
    })
  }, [localTasks, searchParams, sortBy])

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
    return date.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    const updatedStatus = completed ? "completed" : "pending"
    isUpdating.current = true
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: updatedStatus, is_pinned: completed ? false : t.is_pinned } : t))
    const supabase = createClient()
    await supabase.from("tasks").update({ status: updatedStatus, completed_at: completed ? new Date().toISOString() : null, is_pinned: completed ? false : undefined }).eq("id", taskId)
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

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return
    const supabase = createClient()
    await supabase.from("tasks").delete().eq("id", taskToDelete)
    setTaskToDelete(null)
    router.refresh()
  }

  const handleMarkAllAsCompleted = async () => {
    const pendingTasks = processedTasks.filter(t => t.status === "pending")
    if (pendingTasks.length === 0) return
    const pendingIds = pendingTasks.map(t => t.id)
    const now = new Date().toISOString()
    isUpdating.current = true
    setLocalTasks(prev => prev.map(t => pendingIds.includes(t.id) ? { ...t, status: "completed", is_pinned: false, completed_at: now } : t))
    const supabase = createClient()
    await supabase.from("tasks").update({ status: "completed", completed_at: now, is_pinned: false }).in("id", pendingIds)
    setIsBulkConfirmOpen(false)
    router.refresh()
    setTimeout(() => { isUpdating.current = false }, 800)
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsBulkConfirmOpen(true)}
          disabled={!processedTasks.some(t => t.status === "pending")}
          className="text-xs h-9 gap-2 justify-center border-dashed hover:border-primary/50"
        >
          <CheckCheck className="h-4 w-4 text-primary" />
          Concluir Visíveis
        </Button>
        <TaskSort value={sortBy} onValueChange={setSortBy} />
      </div>

      <div className="space-y-3">
        {processedTasks.map((task) => (
          <Card 
            key={task.id} 
            className={`transition-all border-l-[6px] shadow-sm hover:shadow-md ${
              task.status === "completed" 
                ? "opacity-60 bg-muted/40 grayscale-[0.5]" 
                : `bg-card hover:translate-x-1 ${priorityBorderColors[task.priority as keyof typeof priorityBorderColors]}`
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                  className="h-5 w-5 mt-1 rounded-full border-2 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-base sm:text-lg leading-tight truncate tracking-tight ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </span>
                        {task.is_pinned && <Pin className="h-3.5 w-3.5 fill-primary text-primary shrink-0 animate-pulse" />}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1 italic">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setEditingTask(task)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePin(task)}>
                          {task.is_pinned ? <><PinOff className="mr-2 h-4 w-4" /> Desfixar</> : <><Pin className="mr-2 h-4 w-4" /> Fixar</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/pomodoro?task=${task.id}`}>
                            <Timer className="mr-2 h-4 w-4 text-primary" /> Pomodoro
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setTaskToDelete(task.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {task.discipline && (
                      <Badge 
                        variant="secondary"
                        style={{ backgroundColor: `${task.discipline.color}15`, color: task.discipline.color }}
                        className="text-[10px] font-bold px-2 py-0.5 border-none shadow-sm"
                      >
                        <span className="mr-1.5">{task.discipline.icon}</span>
                        {task.discipline.name}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 uppercase tracking-wider bg-background/50">
                      {typeLabels[task.type as keyof typeof typeLabels]}
                    </Badge>
                    <Badge className={`text-[10px] px-2 py-0.5 border-transparent shadow-sm ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                      {priorityLabels[task.priority] || task.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-muted">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      {task.start_date && (
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{formatTaskDate(task.start_date)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {Math.floor(task.estimated_minutes / 60)}h{task.estimated_minutes % 60}m
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {processedTasks.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/5">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm font-medium">Nenhuma tarefa encontrada com estes filtros.</p>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Excluir Tarefa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta tarefa? Esta ação não pode ser desfeita e removerá todos os dados associados a ela.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, excluir tarefa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkConfirmOpen} onOpenChange={setIsBulkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCheck className="h-5 w-5 text-primary" />
              Concluir Selecionadas
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deseja marcar todas as tarefas visíveis nesta lista como concluídas de uma só vez?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Agora não</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAllAsCompleted}>
              Sim, concluir todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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