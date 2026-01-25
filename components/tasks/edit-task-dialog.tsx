"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Task, Discipline, TaskType, TaskPriority } from "@/types/database"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Clock, AlertCircle } from "lucide-react"
import { DisciplineManager } from "./discipline-manager"
import { toast } from "sonner"

interface EditTaskDialogProps {
  task: Task
  disciplines: Discipline[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({ task, disciplines, open, onOpenChange }: EditTaskDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isInnerModalOpen, setIsInnerModalOpen] = useState(false)
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [disciplineId, setDisciplineId] = useState("")
  const [type, setType] = useState<TaskType>("theory")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [estimatedTime, setEstimatedTime] = useState("00:30")

  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [dueTime, setDueTime] = useState("")

  const [timeError, setTimeError] = useState<string | null>(null)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]

  const formatMinutesToTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
    const mins = (totalMinutes % 60).toString().padStart(2, '0')
    return `${hours}:${mins}`
  }

  const splitISOString = (isoStr: string | null) => {
    if (!isoStr) return { date: "", time: "" }
    try {
      const d = new Date(isoStr)
      const offset = d.getTimezoneOffset() * 60000
      const localDate = new Date(d.getTime() - offset)
      const parts = localDate.toISOString().split("T")
      return { date: parts[0], time: parts[1].slice(0, 5) }
    } catch (e) {
      return { date: "", time: "" }
    }
  }

  useEffect(() => {
    if (startDate && startTime) {
      const selectedDateTime = new Date(`${startDate}T${startTime}`)
      const now = new Date()
      setTimeError(selectedDateTime < now ? "A data/hora de início não pode ser anterior à atual" : null)
    }
  }, [startDate, startTime])

  useEffect(() => {
    if (open && task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setDisciplineId(task.discipline_id || "")
      setType(task.type)
      setPriority(task.priority)
      setEstimatedTime(formatMinutesToTime(task.estimated_minutes))
      const start = splitISOString(task.start_date)
      setStartDate(start.date)
      setStartTime(start.time)
      const due = splitISOString(task.due_date)
      setDueDate(due.date)
      setDueTime(due.time)
      setTimeError(null)
      setDuplicateError(null)
    }
  }, [task, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isInnerModalOpen || isLoading) return

    const cleanTitle = title.trim()
    if (!cleanTitle) return

    setIsLoading(true)
    setDuplicateError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    const { data: existing } = await supabase
      .from("tasks")
      .select("id")
      .eq("user_id", user.id)
      .ilike("title", cleanTitle)
      .neq("id", task.id)
      .maybeSingle()

    if (existing) {
      setDuplicateError(`Já existe outra tarefa chamada "${cleanTitle}"`)
      toast.error("Nome de tarefa já em uso")
      setIsLoading(false)
      return
    }

    const startFull = startDate && startTime ? `${startDate}T${startTime}` : null
    const dueFull = dueDate && dueTime ? `${dueDate}T${dueTime}` : null

    const [hours, minutes] = estimatedTime.split(":").map(Number)
    const totalMinutes = (hours * 60) + minutes

    const { error: dbError } = await supabase
      .from("tasks")
      .update({
        title: cleanTitle,
        description: description || null,
        discipline_id: disciplineId || null,
        type,
        priority,
        estimated_minutes: totalMinutes || 30,
        start_date: startFull,
        due_date: dueFull,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id)

    if (dbError) {
      toast.error("Erro ao atualizar tarefa")
    } else {
      toast.success("Tarefa atualizada!")
      onOpenChange(false)
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Impede fechar se o modal de disciplina estiver aberto
      if (!val && isInnerModalOpen) return 
      onOpenChange(val)
    }}>
      <DialogContent 
        className="w-[95vw] max-w-md rounded-lg overflow-y-auto max-h-[95vh] p-4 sm:p-6"
        onOpenAutoFocus={(e) => e.preventDefault()}
        // SOLUÇÃO: Impede fechar ao interagir com Selects ou Modais internos
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target?.closest('[data-radix-select-viewport]') || isInnerModalOpen) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target?.closest('[data-radix-select-viewport]') || isInnerModalOpen) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className={duplicateError ? "text-destructive" : ""}>
              Título da Tarefa *
            </Label>
            <Input 
              id="edit-title" 
              value={title} 
              onChange={(e) => {
                setTitle(e.target.value)
                if (duplicateError) setDuplicateError(null)
              }} 
              required 
              className={duplicateError ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {duplicateError && (
              <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {duplicateError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-start gap-2">
              <Label>Disciplina</Label>
              <DisciplineManager 
                disciplines={disciplines} 
                mode="create" 
                onOpenChange={setIsInnerModalOpen} 
              />
            </div>
            <Select value={disciplineId} onValueChange={setDisciplineId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {disciplines.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.icon} {d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Teoria</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="questions">Questões</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-estimatedTime" className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Tempo Estimado
            </Label>
            <Input id="edit-estimatedTime" type="time" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label className={timeError ? "text-destructive" : ""}>Início</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} />
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            {timeError && <p className="text-[11px] text-destructive flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {timeError}</p>}
          </div>

          <div className="space-y-2">
            <Label>Término Previsto</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={dueDate} min={startDate || today} onChange={(e) => setDueDate(e.target.value)} />
              <Input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || !!timeError || !!duplicateError}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}