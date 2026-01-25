"use client"

import { useState } from "react" // Adicionado para controle de estado local
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Task } from "@/types/database"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Plus, ArrowRight } from "lucide-react"

interface TodayTasksProps {
  tasks: Task[]
}

const priorityColors = {
  low: "bg-chart-2/20 text-chart-2",
  medium: "bg-chart-4/20 text-chart-4",
  high: "bg-destructive/20 text-destructive",
}

export function TodayTasks({ tasks: initialTasks }: TodayTasksProps) {
  const router = useRouter()
  // Estado local para refletir a mudança instantaneamente
  const [localTasks, setLocalTasks] = useState(initialTasks)

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    // 1. Atualização Otimista: Muda na interface antes de ir ao banco
    const updatedStatus = completed ? "completed" : "pending"
    setLocalTasks(prev => 
      prev.map(t => t.id === taskId ? { ...t, status: updatedStatus } : t)
    )

    const supabase = createClient()
    const { error } = await supabase
      .from("tasks")
      .update({
        status: updatedStatus,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", taskId)
    
    if (error) {
      // Reverte se houver erro no banco
      setLocalTasks(initialTasks)
    } else {
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Tarefas Pendentes</CardTitle>
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
            <p className="text-muted-foreground mb-4">Nenhuma tarefa pendente</p>
            <Button asChild>
              <Link href="/dashboard/tasks">
                <Plus className="mr-2 h-4 w-4" />
                Criar tarefa
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {localTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Div wrapper para aumentar área de clique conforme checklist */}
                <div className="flex items-center justify-center min-w-6 min-h-6">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                    className="h-5 w-5" // Aumentado de h-4 para h-5
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.discipline && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${task.discipline.color}20`,
                          color: task.discipline.color,
                        }}
                      >
                        {task.discipline.icon} {task.discipline.name}
                      </span>
                    )}
                    <Badge variant="secondary" className={priorityColors[task.priority]}>
                      {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
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