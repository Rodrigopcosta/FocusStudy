"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Discipline, Task } from "@/types/database"
import { Timer, Play } from "lucide-react"

interface QuickPomodoroProps {
  disciplines: Discipline[]
  tasks: Task[]
}

export function QuickPomodoro({ disciplines, tasks }: QuickPomodoroProps) {
  const topTask = tasks[0]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Iniciar Pomodoro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Timer className="h-10 w-10 text-primary" />
          </div>
          {topTask ? (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Próxima tarefa:</p>
              <p className="font-medium">{topTask.title}</p>
            </div>
          ) : (
            <p className="text-muted-foreground mb-4">Foque nos seus estudos com a técnica Pomodoro</p>
          )}
          <Button asChild size="lg" className="gap-2">
            <Link href={topTask ? `/dashboard/pomodoro?task=${topTask.id}` : "/dashboard/pomodoro"}>
              <Play className="h-4 w-4" />
              Iniciar Sessão
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
