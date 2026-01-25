"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Discipline, TaskType, TaskPriority } from "@/types/database"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react"
import { DisciplineManager } from "./discipline-manager"

interface CreateTaskDialogProps {
  disciplines: Discipline[]
  children: React.ReactNode
}

export function CreateTaskDialog({ disciplines, children }: CreateTaskDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [disciplineId, setDisciplineId] = useState<string>("")
  const [type, setType] = useState<TaskType>("theory")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  
  // Alterado para formato de tempo HH:mm
  const [estimatedTime, setEstimatedTime] = useState("00:30")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState("")

  const today = new Date().toISOString().split("T")[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Converte HH:mm para minutos totais para o banco
    const [hours, minutes] = estimatedTime.split(":").map(Number)
    const totalMinutes = (hours * 60) + minutes

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("tasks").insert({
      user_id: user.id,
      title,
      description: description || null,
      discipline_id: disciplineId || null,
      type,
      priority,
      estimated_minutes: totalMinutes || 30,
      start_date: startDate || today,
      due_date: dueDate || null,
      status: "pending"
    })

    setIsLoading(false)
    setOpen(false)
    resetForm()
    router.refresh()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDisciplineId("")
    setType("theory")
    setPriority("medium")
    setEstimatedTime("00:30")
    setStartDate(today)
    setDueDate("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* onInteractOutside impede fechar ao clicar nos selects no mobile */}
      <DialogContent 
        className="max-w-md overflow-y-auto max-h-[90vh]" 
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Tarefa *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Estudar Direito Constitucional"
              required
              autoFocus={false} // Evita abrir teclado automaticamente
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Disciplina</Label>
                <DisciplineManager disciplines={disciplines} />
              </div>
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
                  <SelectItem value="urgent" className="text-red-500 font-bold">Urgente (Vermelho)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Tempo Estimado
              </Label>
              <Input
                id="estimatedTime"
                type="time"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input 
                id="startDate" 
                type="date" 
                min={today}
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Conclusão Prevista</Label>
              <Input 
                id="dueDate" 
                type="date" 
                min={startDate || today} // Validação: não permite antes do início
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição / Observações</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O que você precisa estudar hoje?"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Tarefa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}