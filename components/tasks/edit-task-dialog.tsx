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
  
  // Estados básicos
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [disciplineId, setDisciplineId] = useState("")
  const [type, setType] = useState<TaskType>("theory")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [estimatedTime, setEstimatedTime] = useState("00:30")

  // Estados de Data e Hora
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [dueTime, setDueTime] = useState("")

  // Estado de Erro de Validação
  const [timeError, setTimeError] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]

  // Funções de conversão
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
      return { 
        date: parts[0], 
        time: parts[1].slice(0, 5) 
      }
    } catch (e) {
      return { date: "", time: "" }
    }
  }

  // Validação em Tempo Real
  useEffect(() => {
    if (startDate && startTime) {
      const selectedDateTime = new Date(`${startDate}T${startTime}`)
      const now = new Date()

      if (selectedDateTime < now) {
        setTimeError("A data/hora de início não pode ser anterior à atual")
      } else {
        setTimeError(null)
      }
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
    }
  }, [task, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (timeError) {
      toast.error("Corrija o horário antes de salvar")
      return
    }

    const startFull = startDate && startTime ? `${startDate}T${startTime}` : null
    const dueFull = dueDate && dueTime ? `${dueDate}T${dueTime}` : null

    if (startFull && dueFull && new Date(dueFull) <= new Date(startFull)) {
      toast.error("O término deve ser após o início")
      return
    }

    setIsLoading(true)

    const [hours, minutes] = estimatedTime.split(":").map(Number)
    const totalMinutes = (hours * 60) + minutes

    const supabase = createClient()
    const { error } = await supabase
      .from("tasks")
      .update({
        title,
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

    if (error) {
      toast.error("Erro ao atualizar tarefa")
    } else {
      toast.success("Tarefa atualizada!")
      onOpenChange(false)
      router.refresh()
    }
    
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] max-w-md rounded-lg overflow-y-auto max-h-[95vh] p-4 sm:p-6"
        onInteractOutside={(e) => e.preventDefault()}
        // Evita que o teclado abra sozinho ao carregar o diálogo no mobile
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título da Tarefa *</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Disciplina</Label>
              <Select value={disciplineId} onValueChange={setDisciplineId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {disciplines.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.icon} {d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Tarefa</Label>
              <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Teoria</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="questions">Questões</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="edit-estimatedTime" className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Tempo Estimado
              </Label>
              <Input
                id="edit-estimatedTime"
                type="time"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                required
              />
            </div>
          </div>

          <hr className="border-muted" />

          {/* Seção Início com Erro Visual */}
          <div className="space-y-2">
            <Label className={`font-bold ${timeError ? "text-destructive" : "text-primary"}`}>
              Início do Estudo
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                type="date" 
                value={startDate} 
                min={today}
                className={timeError ? "border-destructive focus-visible:ring-destructive" : ""}
                onChange={(e) => setStartDate(e.target.value)} 
              />
              <Input 
                type="time" 
                value={startTime} 
                className={timeError ? "border-destructive focus-visible:ring-destructive" : ""}
                onChange={(e) => setStartTime(e.target.value)} 
              />
            </div>
            {timeError && (
              <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {timeError}
              </p>
            )}
          </div>

          {/* Seção Conclusão */}
          <div className="space-y-2">
            <Label className="text-primary font-bold">Término Previsto</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                type="date" 
                value={dueDate} 
                min={startDate || today}
                onChange={(e) => setDueDate(e.target.value)} 
              />
              <Input 
                type="time" 
                value={dueTime} 
                onChange={(e) => setDueTime(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !!timeError}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}