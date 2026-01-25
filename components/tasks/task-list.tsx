"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Task, Discipline } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { MoreHorizontal, Trash2, Pencil, Move, ArrowUpDown, Pin, PinOff, Play, Calendar, Clock, CheckCheck, Filter, ChevronDown, ChevronUp, XCircle, Save } from "lucide-react"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from "@/lib/utils"
import { EditTaskDialog } from "./edit-task-dialog"
import { TaskSort, type SortOption } from "./task-sort"

interface TaskListProps {
  tasks: Task[]
  disciplines: Discipline[]
}

const priorityWeight: Record<string, number> = {
  urgent: 4, urgente: 4,
  high: 3, alta: 3,
  medium: 2, média: 2, media: 2,
  low: 1, baixa: 1
}

const priorityLabels: Record<string, string> = { 
  low: "Baixa", baixa: "Baixa",
  medium: "Média", média: "Média", media: "Média",
  high: "Alta", alta: "Alta",
  urgent: "Urgente", urgente: "Urgente" 
}

const priorityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20", baixa: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", média: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", media: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20", alta: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-600 border-red-500/20 font-bold", urgente: "bg-red-500/10 text-red-600 border-red-500/20 font-bold",
}

const priorityBorderColors: Record<string, string> = { 
  low: "border-l-blue-500", baixa: "border-l-blue-500",
  medium: "border-l-yellow-500", média: "border-l-yellow-500", media: "border-l-yellow-500",
  high: "border-l-orange-500", alta: "border-l-orange-500",
  urgent: "border-l-red-500", urgente: "border-l-red-500" 
}

const typeLabels = { theory: "Teoria", review: "Revisão", questions: "Questões" }

function SortableTaskCard({ 
  task, 
  handleUpdateTask, 
  setTaskToDelete,
  setEditingTask,
  isReorderMode,
  onMove,
  index,
  showMoveButton
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id,
    disabled: !isReorderMode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityKey = task.priority.toLowerCase();

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col">
      <Card 
        {...(isReorderMode ? { ...attributes, ...listeners } : {})}
        className={cn(
          "transition-all border-l-[6px] shadow-sm",
          task.is_pinned && task.status === "pending" ? "ring-2 ring-primary/20 bg-primary/5" : "bg-card",
          task.status === "completed" 
            ? "opacity-60 grayscale-[0.5]" 
            : priorityBorderColors[priorityKey] || "border-l-muted",
          isReorderMode && "cursor-move select-none"
        )}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            {!isReorderMode && (
              <Checkbox
                checked={task.status === "completed"}
                onCheckedChange={(checked) => handleUpdateTask(task.id, { 
                  status: checked ? "completed" : "pending",
                  completed_at: checked ? new Date().toISOString() : null,
                  is_pinned: checked ? false : undefined
                })}
                className="h-5 w-5 mt-1 rounded-full border-2 border-primary/50" 
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  {task.is_pinned && task.status === "pending" && (
                    <Pin className="h-3.5 w-3.5 text-primary fill-current shrink-0" />
                  )}
                  <span className={cn(
                    "font-bold text-sm sm:text-base leading-tight truncate block",
                    task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {task.status === "pending" && !isReorderMode && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-7 w-7 sm:h-8 sm:w-8 rounded-full transition-all",
                        task.is_pinned ? "text-primary bg-primary/10" : "text-muted-foreground opacity-40 hover:opacity-100"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateTask(task.id, { is_pinned: !task.is_pinned });
                      }}
                    >
                      {task.is_pinned ? <Pin className="h-4 w-4 fill-current" /> : <PinOff className="h-4 w-4" />}
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"><MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setEditingTask(task)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setTaskToDelete(task.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {task.discipline && (
                  <Badge variant="secondary" style={{ backgroundColor: `${task.discipline.color}15`, color: task.discipline.color }} className="text-[9px] sm:text-[10px] font-bold border-none px-1.5 py-0">
                    <span className="mr-1">{task.discipline.icon}</span>{task.discipline.name}
                  </Badge>
                )}
                <Badge variant="outline" className="text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0">{typeLabels[task.type as keyof typeof typeLabels]}</Badge>
                <Badge className={cn("text-[9px] sm:text-[10px] border-transparent px-1.5 py-0", priorityColors[priorityKey])}>
                  {priorityLabels[priorityKey] || task.priority}
                </Badge>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-muted">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] sm:text-[11px]">
                  {task.start_date && <div className="flex items-center gap-1 font-medium"><Calendar className="h-3 w-3 text-primary" />{new Date(task.start_date).toLocaleDateString("pt-BR")}</div>}
                  <div className="flex items-center gap-1 font-bold text-foreground bg-secondary/50 px-2 py-0.5 rounded-full"><Clock className="h-3 w-3 text-primary" />{Math.floor(task.estimated_minutes / 60)}h{task.estimated_minutes % 60}m</div>
                </div>

                {task.status === "pending" && !isReorderMode && (
                  <Button variant="default" size="icon" asChild className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary text-white shadow-sm active:scale-95 transition-all">
                    <Link href={`/dashboard/pomodoro?task=${task.id}`}><Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current ml-0.5" /></Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isReorderMode && showMoveButton && (
        <div className="flex justify-center -mb-5 mt-1 z-50 relative">
          <Button 
            variant="secondary" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10 shadow-lg border-2 border-primary bg-background"
            onClick={() => onMove(index, index + 1)}
          >
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </Button>
        </div>
      )}
      {isReorderMode && showMoveButton && <div className="h-4" />}
      {isReorderMode && !showMoveButton && <div className="h-2" />}
    </div>
  );
}

export function TaskList({ tasks: initialTasks, disciplines }: TaskListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [localTasks, setLocalTasks] = useState(initialTasks)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { setLocalTasks(initialTasks) }, [initialTasks])

  useEffect(() => {
    if (isReorderMode) setSortBy("manual")
  }, [isReorderMode])

  const currentStatus = searchParams.get("status") || "all"
  const currentDiscipline = searchParams.get("discipline") || "all"
  const currentPriority = searchParams.get("priority") || "all"

  const hasActiveFilters = currentStatus !== "all" || currentDiscipline !== "all" || currentPriority !== "all"

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") params.delete(key)
    else params.set(key, value)
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/dashboard/tasks")
  }

  const processedTasks = useMemo(() => {
    let result = [...localTasks].filter((task) => {
      if (currentStatus !== "all" && task.status !== currentStatus) return false
      if (currentDiscipline !== "all" && task.discipline_id !== currentDiscipline) return false
      if (currentPriority !== "all" && task.priority.toLowerCase() !== currentPriority.toLowerCase()) return false
      return true
    })

    return result.sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      if (isReorderMode || sortBy === "manual") return (a.position || 0) - (b.position || 0)

      const weightA = priorityWeight[a.priority.toLowerCase()] || 0
      const weightB = priorityWeight[b.priority.toLowerCase()] || 0

      switch (sortBy) {
        case "priority-desc": return weightB - weightA
        case "priority-asc": return weightA - weightB
        case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default: return (a.position || 0) - (b.position || 0)
      }
    })
  }, [localTasks, currentStatus, currentDiscipline, currentPriority, sortBy, isReorderMode])

  const saveNewOrder = async (newOrder: Task[]) => {
    setLocalTasks(newOrder);
    const updates = newOrder.map((task, index) => ({ id: task.id, position: index, user_id: task.user_id }));
    await supabase.from('tasks').upsert(updates);
  }

  const handleManualMove = (oldIndex: number, newIndex: number) => {
    const updated = arrayMove(processedTasks, oldIndex, newIndex);
    const newLocal = [...localTasks];
    updated.forEach((task, idx) => {
      const originalIdx = newLocal.findIndex(t => t.id === task.id);
      if (originalIdx > -1) newLocal[originalIdx].position = idx;
    });
    saveNewOrder(newLocal.sort((a, b) => (a.position || 0) - (b.position || 0)));
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))
    await supabase.from("tasks").update(updates).eq("id", taskId)
    router.refresh()
  }

  const FiltersContent = () => (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block ml-1">Status</label>
        <Select value={currentStatus} onValueChange={(v) => updateFilter("status", v)}>
          <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block ml-1">Disciplina</label>
        <Select value={currentDiscipline} onValueChange={(v) => updateFilter("discipline", v)}>
          <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Disciplina" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Disciplinas</SelectItem>
            {disciplines.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block ml-1">Prioridade</label>
        <Select value={currentPriority} onValueChange={(v) => updateFilter("priority", v)}>
          <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Prioridades</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasActiveFilters && (
        <div className="flex items-end pb-0.5 sm:pb-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="h-10 w-full sm:w-auto px-3 text-destructive hover:bg-destructive/10 gap-2 font-bold text-xs"
          >
            <XCircle className="h-4 w-4" /> Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3">
        {/* Mobile: Collapsible Filters */}
        <div className="sm:hidden">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="bg-secondary/30 rounded-xl border border-border/60 overflow-hidden shadow-sm transition-all">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between px-4 h-12 hover:bg-transparent">
                <div className="flex items-center gap-2 font-bold text-xs uppercase text-foreground">
                  <Filter className="h-4 w-4 text-primary" />
                  Filtrar Tarefas
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && <Badge variant="default" className="h-5 px-1.5 text-[10px]">Ativo</Badge>}
                  {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 border-t border-border/40">
               <div className="pt-4">
                 <FiltersContent />
               </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Desktop: Grid Filters */}
        <div className="hidden sm:block">
           <FiltersContent />
        </div>

        {/* Action Buttons & Sort */}
        <div className="flex flex-col gap-3 p-3 sm:p-0 bg-secondary/20 sm:bg-transparent rounded-xl border border-border/50 sm:border-none">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsBulkConfirmOpen(true)} 
              disabled={!processedTasks.some(t => t.status === "pending")} 
              className="flex-1 text-[10px] sm:text-[11px] h-9 gap-1.5 font-bold uppercase shadow-sm bg-background hover:bg-secondary"
            >
              <CheckCheck className="h-3.5 w-3.5 text-primary" /> 
              <span>Concluir</span>
            </Button>
            <Button 
              variant={isReorderMode ? "default" : "outline"} 
              size="sm" 
              onClick={() => setIsReorderMode(!isReorderMode)} 
              className={cn(
                "flex-1 text-[10px] sm:text-[11px] h-9 gap-1.5 font-bold uppercase shadow-sm transition-all",
                isReorderMode 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-background hover:bg-secondary"
              )}
            >
              {isReorderMode ? <Save className="h-3.5 w-3.5" /> : <Move className="h-3.5 w-3.5" />}
              {isReorderMode ? "Salvar" : "Reordenar"}
            </Button>
          </div>

          {!isReorderMode && (
            <div className="w-full pt-1 border-t border-border/40 sm:border-none sm:pt-0">
               <TaskSort value={sortBy} onValueChange={setSortBy} />
            </div>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
        const { active, over } = e;
        if (over && active.id !== over.id) {
          const oldIndex = processedTasks.findIndex(t => t.id === active.id);
          const newIndex = processedTasks.findIndex(t => t.id === over.id);
          if (processedTasks[oldIndex].is_pinned === processedTasks[newIndex].is_pinned && processedTasks[oldIndex].status === processedTasks[newIndex].status) {
            handleManualMove(oldIndex, newIndex);
          }
        }
      }}>
        <SortableContext items={processedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5 sm:space-y-3 pb-10">
            {processedTasks.map((task, index) => {
              const nextTask = processedTasks[index + 1];
              const showMoveButton = nextTask && nextTask.is_pinned === task.is_pinned && nextTask.status === task.status;
              return (
                <SortableTaskCard 
                  key={task.id} 
                  task={task} 
                  index={index}
                  isReorderMode={isReorderMode}
                  showMoveButton={showMoveButton}
                  onMove={handleManualMove}
                  handleUpdateTask={handleUpdateTask}
                  setEditingTask={setEditingTask}
                  setTaskToDelete={setTaskToDelete}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Restante dos componentes de alerta e diálogo permanecem iguais */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir Tarefa?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await supabase.from("tasks").delete().eq("id", taskToDelete);
              setLocalTasks(prev => prev.filter(t => t.id !== taskToDelete));
              setTaskToDelete(null);
              router.refresh();
            }} className="bg-destructive">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkConfirmOpen} onOpenChange={setIsBulkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Concluir Visíveis?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              const pendingIds = processedTasks.filter(t => t.status === "pending").map(t => t.id);
              await supabase.from("tasks").update({ status: "completed", is_pinned: false }).in("id", pendingIds);
              setLocalTasks(prev => prev.map(t => pendingIds.includes(t.id) ? { ...t, status: "completed", is_pinned: false } : t));
              setIsBulkConfirmOpen(false);
              router.refresh();
            }}>Sim, concluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingTask && (
        <EditTaskDialog task={editingTask} disciplines={disciplines} open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)} />
      )}
    </div>
  )
}