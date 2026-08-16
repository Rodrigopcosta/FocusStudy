'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { Task } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, ArrowRight } from 'lucide-react'

interface TodayTasksProps {
  tasks: Task[]
}

// Cores atualizadas conforme solicitado
const priorityColors = {
  low: 'bg-blue-500/20 text-blue-500',
  medium: 'bg-yellow-500/20 text-yellow-600',
  high: 'bg-orange-500/20 text-orange-500',
  urgent: 'bg-red-500/20 text-red-600 font-bold',
}

export function TodayTasks({ tasks: initialTasks }: TodayTasksProps) {
  const router = useRouter()
  const [localTasks, setLocalTasks] = useState(initialTasks)
  const isUpdating = useRef(false)

  // Sincroniza estado local com as props do servidor
  useEffect(() => {
    if (!isUpdating.current) {
      setLocalTasks(initialTasks)
    }
  }, [initialTasks])

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    const updatedStatus = completed ? 'completed' : 'pending'
    isUpdating.current = true

    // Atualização Otimista
    setLocalTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: updatedStatus } : t))
    )

    const supabase = createClient()
    const { error } = await supabase
      .from('tasks')
      .update({
        status: updatedStatus,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', taskId)

    if (error) {
      isUpdating.current = false
      setLocalTasks(initialTasks)
    } else {
      router.refresh()
      // Delay para evitar o flicker do refresh no mobile
      setTimeout(() => {
        isUpdating.current = false
      }, 800)
    }
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex min-w-0 flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="min-w-0 text-lg">Tarefas Pendentes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/tasks">
            Ver todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {localTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Nenhuma tarefa pendente
            </p>
            <Button asChild>
              <Link href="/dashboard/tasks">
                <Plus className="mr-2 h-4 w-4" />
                Criar tarefa
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {localTasks.map(task => (
              <div
                key={task.id}
                className="flex min-w-0 items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center justify-center min-w-6 min-h-6">
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={checked =>
                      handleToggleTask(task.id, checked as boolean)
                    }
                    className="h-5 w-5"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`block min-w-0 truncate font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                    {task.discipline && (
                      <span
                        className="inline-block max-w-full truncate rounded-full px-2 py-0.5 text-xs"
                        style={{
                          backgroundColor: `${task.discipline.color}20`,
                          color: task.discipline.color,
                        }}
                      >
                        {task.discipline.icon} {task.discipline.name}
                      </span>
                    )}
                    <Badge
                      variant="secondary"
                      className={
                        priorityColors[
                          task.priority as keyof typeof priorityColors
                        ]
                      }
                    >
                      {task.priority === 'urgent'
                        ? 'Urgente'
                        : task.priority === 'high'
                          ? 'Alta'
                          : task.priority === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
