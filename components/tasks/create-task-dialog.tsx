'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Discipline, TaskType, TaskPriority } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Clock, AlertCircle } from 'lucide-react'
import { DisciplineManager } from './discipline-manager'
import { toast } from 'sonner'

interface CreateTaskDialogProps {
  disciplines: Discipline[]
  children: React.ReactNode
}

export function CreateTaskDialog({
  disciplines = [],
  children,
}: CreateTaskDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInnerModalOpen, setIsInnerModalOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [disciplineId, setDisciplineId] = useState<string>('')
  const [type, setType] = useState<TaskType>('theory')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [estimatedTime, setEstimatedTime] = useState('00:30')

  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [startTime, setStartTime] = useState('08:00')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('09:00')

  const [timeError, setTimeError] = useState<string | null>(null)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)

  useEffect(() => {
    if (startDate && startTime) {
      const selectedDateTime = new Date(`${startDate}T${startTime}`)
      const now = new Date()
      if (selectedDateTime < now) {
        setTimeError('O horário de início não pode ser anterior ao atual')
      } else {
        setTimeError(null)
      }
    }
  }, [startDate, startTime])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDisciplineId('')
    setType('theory')
    setPriority('medium')
    setEstimatedTime('00:30')
    setStartDate(today)
    setStartTime('08:00')
    setDueDate('')
    setDueTime('09:00')
    setTimeError(null)
    setDuplicateError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isInnerModalOpen || isLoading) return

    const cleanTitle = title.trim()
    if (!cleanTitle) return

    setDuplicateError(null)
    setIsLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    // 1. BUSCA EXAUSTIVA DE DUPLICIDADE
    const { data: existing, error: searchError } = await supabase
      .from('tasks')
      .select('title')
      .eq('user_id', user.id)
      .ilike('title', cleanTitle) // Case-insensitive
      .maybeSingle()

    if (existing) {
      setDuplicateError(`A tarefa "${cleanTitle}" já existe.`)
      toast.error('Título já cadastrado')
      setIsLoading(false)
      return
    }

    if (timeError) {
      toast.error('Verifique os horários')
      setIsLoading(false)
      return
    }

    const startFull = `${startDate}T${startTime}`
    const dueFull = dueDate ? `${dueDate}T${dueTime}` : null

    const [hours, minutes] = estimatedTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes

    // 2. INSERÇÃO
    const { error: dbError } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: cleanTitle,
      description: description || null,
      discipline_id: disciplineId || null,
      type,
      priority,
      estimated_minutes: totalMinutes || 30,
      start_date: startFull,
      due_date: dueFull,
      status: 'pending',
    })

    if (dbError) {
      toast.error('Erro ao salvar tarefa')
      console.error(dbError)
    } else {
      toast.success('Tarefa criada!')
      setOpen(false)
      resetForm()
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={val => {
        if (!val && isInnerModalOpen) return
        setOpen(val)
        if (!val) setDuplicateError(null)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="w-[95vw] max-w-md rounded-lg overflow-y-auto max-h-[95vh] p-4 sm:p-6"
        onPointerDownOutside={e => {
          if (isInnerModalOpen) e.preventDefault()
        }}
        onInteractOutside={e => {
          if (isInnerModalOpen) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className={duplicateError ? 'text-destructive' : ''}
            >
              Título da Tarefa *
            </Label>
            <Input
              id="title"
              value={title}
              autoComplete="off"
              onChange={e => {
                setTitle(e.target.value)
                if (duplicateError) setDuplicateError(null)
              }}
              required
              className={
                duplicateError
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
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
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma disciplina..." />
              </SelectTrigger>
              <SelectContent>
                {disciplines.length === 0 && (
                  <div className="p-2 text-xs text-center text-muted-foreground">
                    Nenhuma disciplina
                  </div>
                )}
                {disciplines.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.icon} {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={v => setType(v as TaskType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Teoria</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="questions">Questões</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={priority}
                onValueChange={v => setPriority(v as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
            <Label htmlFor="estimatedTime">
              <Clock className="inline h-3 w-3 mr-1" /> Tempo Estimado
            </Label>
            <Input
              id="estimatedTime"
              type="time"
              value={estimatedTime}
              onChange={e => setEstimatedTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className={timeError ? 'text-destructive' : ''}>
              Início
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={startDate}
                min={today}
                onChange={e => setStartDate(e.target.value)}
              />
              <Input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            {timeError && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {timeError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Término Previsto (Opcional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={dueDate}
                min={startDate}
                onChange={e => setDueDate(e.target.value)}
              />
              <Input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !!timeError || !title.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Tarefa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
