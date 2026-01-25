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
import { Loader2, Clock } from "lucide-react"

interface EditTaskDialogProps {
  task: Task
  disciplines: Discipline[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({ task, disciplines, open, onOpenChange }: EditTaskDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || "")
  const [disciplineId, setDisciplineId] = useState(task.discipline_id || "")
  const [type, setType] = useState<TaskType>(task.type)
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  
  // Lógica para converter minutos do banco para HH:mm no input
  const formatMinutesToTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
    const mins = (totalMinutes % 60).toString().padStart(2, '0')
    return `${hours}:${mins}`
  }

  const [estimatedTime, setEstimatedTime] = useState(formatMinutesToTime(task.estimated_minutes))
  const [dueDate, setDueDate] = useState(task.due_date || "")
  const [startDate, setStartDate] = useState(task.start_date || new Date().toISOString().split("T")[0])

  const today = new Date().toISOString().split("T")[0]

  // Atualiza o estado local quando a task mudar (importante para edição)
  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description || "")
    setDisciplineId(task.discipline_id || "")
    setType(task.type)
    setPriority(task.priority)
    setEstimatedTime(formatMinutesToTime(task.estimated_minutes))
    setDueDate(task.due_date || "")
    setStartDate(task.start_date || today)
  }, [task, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Converte HH:mm de volta para minutos para o banco
    const [hours, minutes] = estimatedTime.split(":").map(Number)
    const totalMinutes = (hours * 60) + minutes

    const supabase = createClient()
    await supabase
      .from("tasks")
      .update({
        title,
        description: description || null,
        discipline_id: disciplineId || null,
        type,
        priority,
        estimated_minutes: totalMinutes || 30,
        start_date: startDate,
        due_date: dueDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id)

    setIsLoading(false)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md overflow-y-auto max-h-[90vh]"
        onInteractOutside={(e) => e.preventDefault()} // Fix para não fechar no mobile ao clicar nos selects
      >
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título da Tarefa *</Label>
            <Input 
              id="edit-title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              autoFocus={false} // Remove o foco automático irritante
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Disciplina</Label>
              <Select value={disciplineId} onValueChange={setDisciplineId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.icon} {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Tarefa</Label>
              <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Teoria</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="questions">Questões</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="text-blue-500">Baixa (Azul)</SelectItem>
                  <SelectItem value="medium" className="text-yellow-500">Média (Amarela)</SelectItem>
                  <SelectItem value="high" className="text-orange-500">Alta (Laranja)</SelectItem>
                  <SelectItem value="high" className="text-red-500 font-bold">Urgente (Vermelho)</SelectItem>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Data de Início</Label>
              <Input 
                id="edit-startDate" 
                type="date" 
                min={today}
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Conclusão Prevista</Label>
              <Input 
                id="edit-dueDate" 
                type="date" 
                min={startDate || today}
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição / Observações</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}