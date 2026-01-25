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
import { Input } from "@/components/ui/input"
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
import { MoreHorizontal, Trash2, Pencil, Move, ArrowUpDown, Pin, PinOff, Play, Calendar, Clock, CheckCheck, Filter, ChevronDown, ChevronUp, XCircle, Save, Search, GripVertical } from "lucide-react"

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
  urgent: 4, high: 3, medium: 2, low: 1,
  urgente: 4, alta: 3, média: 2, media: 2, baixa: 1
}

const priorityLabels: Record<string, string> = { 
  low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente",
  baixa: "Baixa", média: "Média", media: "Média", alta: "Alta", urgente: "Urgente" 
}

const priorityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-600 border-red-500/20 font-bold",
}

const priorityBorderColors: Record<string, string> = { 
  low: "border-l-blue-500", medium: "border-l-yellow-500", high: "border-l-orange-500", urgent: "border-l-red-500" 
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
  const [searchQuery, setSearchQuery] = useState("")

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

  const hasActiveFilters = currentStatus !== "all" || currentDiscipline !== "all" || currentPriority !== "all" || searchQuery !== ""

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") params.delete(key)
    else params.set(key, value)
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    router.push("/dashboard/tasks")
  }

  const processedTasks = useMemo(() => {
    let result = [...localTasks].filter((task) => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
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
  }, [localTasks, currentStatus, currentDiscipline, currentPriority, sortBy, isReorderMode, searchQuery])

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

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col gap-4">
        
        {/* MOBILE FILTERS */}
        <div className="sm:hidden w-full">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="bg-secondary/30 rounded-xl border border-border/60 overflow-hidden shadow-sm transition-all">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between px-4 h-12 hover:bg-transparent">
                <div className="flex items-center gap-2 font-bold text-xs uppercase text-foreground">
                  <Filter className="h-4 w-4 text-primary" />
                  Filtrar e Buscar
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && <Badge variant="default" className="h-5 px-1.5 text-[10px]">Ativo</Badge>}
                  {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-4 border-t border-border/40">
               <div className="pt-4 flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Encontrar tarefa..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 bg-background border-border/60"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={currentStatus} onValueChange={(v) => updateFilter("status", v)}>
                      <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos Status</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="completed">Concluídas</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={currentPriority} onValueChange={(v) => updateFilter("priority", v)}>
                      <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Prioridades</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Select value={currentDiscipline} onValueChange={(v) => updateFilter("discipline", v)}>
                    <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Disciplina" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Disciplinas</SelectItem>
                      {disciplines.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive h-9 gap-2 font-bold text-xs">
                      <XCircle className="h-4 w-4" /> Limpar Filtros
                    </Button>
                  )}
               </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* DESKTOP BAR (COM SEPARAÇÃO VISUAL FORTE) */}
        <div className="hidden sm:flex flex-row items-center gap-4 w-full bg-secondary/20 p-2.5 rounded-xl border border-border shadow-sm">
           {/* Seção Pesquisa */}
           <div className="flex-1 min-w-37.5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar tarefas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background border-border/40 focus-visible:ring-primary shadow-inner"
              />
           </div>

           <GripVertical className="h-6 w-6 text-border shrink-0" />

           {/* Seção Filtros (Visual de Pílulas) */}
           <div className="flex items-center gap-2 shrink-0">
              <Select value={currentStatus} onValueChange={(v) => updateFilter("status", v)}>
                <SelectTrigger className="h-10 w-30 bg-background border-border/60 text-xs font-semibold rounded-full hover:border-primary transition-colors"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currentDiscipline} onValueChange={(v) => updateFilter("discipline", v)}>
                <SelectTrigger className="h-10 w-35 bg-background border-border/60 text-xs font-semibold rounded-full hover:border-primary transition-colors"><SelectValue placeholder="Disciplina" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Disciplinas</SelectItem>
                  {disciplines.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={currentPriority} onValueChange={(v) => updateFilter("priority", v)}>
                <SelectTrigger className="h-10 w-30 bg-background border-border/60 text-xs font-semibold rounded-full hover:border-primary transition-colors"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Prioridades</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
           </div>

           <GripVertical className="h-6 w-6 text-border shrink-0" />

           {/* Seção Ordenação */}
           <div className="shrink-0">
              {!isReorderMode && <TaskSort value={sortBy} onValueChange={setSortBy} />}
           </div>

           {/* Seção Botões (Cores e Estilos Contrastantes) */}
           <div className="flex items-center gap-3 shrink-0 ml-auto pl-4 border-l-2 border-primary/10">
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setIsBulkConfirmOpen(true)} 
                disabled={!processedTasks.some(t => t.status === "pending")} 
                className="h-10 px-4 gap-2 font-black uppercase text-[10px] bg-primary hover:bg-primary/90 text-white shadow-md active:scale-95 transition-all"
              >
                <CheckCheck className="h-4 w-4" /> 
                CONCLUIR LISTA
              </Button>
              <Button 
                variant={isReorderMode ? "destructive" : "outline"} 
                size="sm" 
                onClick={() => setIsReorderMode(!isReorderMode)} 
                className={cn(
                  "h-10 px-4 gap-2 font-black uppercase text-[10px] shadow-sm transition-all border-2 active:scale-95",
                  isReorderMode 
                    ? "bg-red-600 border-red-700 text-white" 
                    : "bg-background border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                )}
              >
                {isReorderMode ? <Save className="h-4 w-4" /> : <Move className="h-4 w-4" />}
                {isReorderMode ? "SALVAR" : "REORDENAR"}
              </Button>
           </div>

           {hasActiveFilters && (
             <Button variant="ghost" size="icon" onClick={clearFilters} className="h-10 w-10 text-destructive shrink-0 hover:bg-destructive/10 rounded-full ml-1">
               <XCircle className="h-5 w-5" />
             </Button>
           )}
        </div>

        {/* Mobile Action Bar */}
        <div className="sm:hidden flex flex-col gap-2 p-3 bg-secondary/15 rounded-xl border border-border/40">
           <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={() => setIsBulkConfirmOpen(true)} className="flex-1 h-11 text-[10px] font-black uppercase gap-2 bg-primary text-white shadow-sm">
                <CheckCheck className="h-4 w-4" /> CONCLUIR LISTA
              </Button>
              <Button variant={isReorderMode ? "destructive" : "outline"} size="sm" onClick={() => setIsReorderMode(!isReorderMode)} className="flex-1 h-11 text-[10px] font-black uppercase gap-2 border-2">
                {isReorderMode ? <Save className="h-4 w-4" /> : <Move className="h-4 w-4" />} {isReorderMode ? "SALVAR" : "REORDENAR"}
              </Button>
           </div>
           {!isReorderMode && <TaskSort value={sortBy} onValueChange={setSortBy} />}
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
          <div className="space-y-3 pb-10 w-full">
            {processedTasks.length > 0 ? (
              processedTasks.map((task, index) => {
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
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 opacity-60 border-2 border-dashed border-muted rounded-2xl">
                <Search className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">Nenhuma tarefa encontrada.</p>
                {hasActiveFilters && <Button variant="link" onClick={clearFilters} className="text-primary text-xs">Limpar filtros</Button>}
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

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
            }} className="bg-destructive text-white hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkConfirmOpen} onOpenChange={setIsBulkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Concluir Lista Visível?</AlertDialogTitle></AlertDialogHeader>
          <p className="text-sm text-muted-foreground">Isso marcará todas as tarefas pendentes mostradas atualmente como concluídas.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              const pendingIds = processedTasks.filter(t => t.status === "pending").map(t => t.id);
              await supabase.from("tasks").update({ status: "completed", is_pinned: false }).in("id", pendingIds);
              setLocalTasks(prev => prev.map(t => pendingIds.includes(t.id) ? { ...t, status: "completed", is_pinned: false } : t));
              setIsBulkConfirmOpen(false);
              router.refresh();
            }} className="bg-primary text-white hover:bg-primary/90">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingTask && (
        <EditTaskDialog task={editingTask} disciplines={disciplines} open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)} />
      )}
    </div>
  )
}