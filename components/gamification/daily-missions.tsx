'use client'

import { Target, CheckCircle2 } from 'lucide-react'

interface DailyMissionsProps {
  progress?: {
    tasks?: number
    focus?: number // Alterado de pomodoros para focus para alinhar com a JornadaPage
    notes?: number
  }
}

export function DailyMissions({ progress }: DailyMissionsProps) {
  // Valores reais baseados no progresso passado via props, com fallback para 0
  const tasksDone = progress?.tasks || 0
  const pomodorosDone = progress?.focus || 0
  const notesDone = progress?.notes || 0

  // Definição das missões diárias
  const missions = [
    {
      title: 'Completar 3 tarefas',
      current: tasksDone,
      target: 3,
      xp: 150,
      id: 'tasks',
    },
    {
      title: '2 sessões de Pomodoro',
      current: pomodorosDone,
      target: 2,
      xp: 100,
      id: 'pomodoro',
    },
    {
      title: 'Criar 1 anotação',
      current: notesDone,
      target: 1,
      xp: 50,
      id: 'notes',
    },
  ]

  return (
    <div className="bg-card p-6 rounded-3xl border border-border/60 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold uppercase tracking-tight flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Missões Diárias
        </h3>
      </div>

      <div className="space-y-5">
        {missions.map((mission, index) => {
          const percent = Math.min(
            (mission.current / mission.target) * 100,
            100
          )
          const isComplete = mission.current >= mission.target

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <span
                    className={`text-sm font-medium transition-all ${
                      isComplete
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {mission.title}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                    isComplete
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  +{mission.xp} XP
                </span>
              </div>

              {/* Barra de Progresso */}
              <div className="relative h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ease-out ${
                    isComplete ? 'bg-green-500' : 'bg-primary'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Rodapé da Missão */}
              <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                <span className={isComplete ? 'text-green-500' : ''}>
                  {isComplete ? 'Missão Cumprida' : 'Em progresso'}
                </span>
                <span>
                  {mission.current} / {mission.target}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
