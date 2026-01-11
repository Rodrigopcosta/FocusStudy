import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle2, Timer, Flame } from "lucide-react"

interface StatsCardsProps {
  todayMinutes: number
  tasksCompleted: number
  pomodorosCompleted: number
  streak: number
}

export function StatsCards({ todayMinutes, tasksCompleted, pomodorosCompleted, streak }: StatsCardsProps) {
  const hours = Math.floor(todayMinutes / 60)
  const minutes = todayMinutes % 60

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo Hoje</p>
              <p className="text-2xl font-bold">{hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-2/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tarefas Concluidas</p>
              <p className="text-2xl font-bold">{tasksCompleted}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-3/20 flex items-center justify-center">
              <Timer className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pomodoros</p>
              <p className="text-2xl font-bold">{pomodorosCompleted}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sequencia</p>
              <p className="text-2xl font-bold">{streak} dias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
