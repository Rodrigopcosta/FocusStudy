"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Star } from "lucide-react"

const MISSIONS = [
  { id: 1, title: "Foco Total", desc: "Complete 2 sessões de Pomodoro", progress: 1, target: 2, xp: 100 },
  { id: 2, title: "Escritor", desc: "Crie 3 novas anotações", progress: 3, target: 3, xp: 150, completed: true },
  { id: 3, title: "Consistência", desc: "Conclua 5 tarefas de estudo", progress: 2, target: 5, xp: 200 },
]

export function DailyMissions() {
  return (
    <Card className="p-6 border-2 border-primary/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black uppercase tracking-tight flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          Missões Diárias
        </h3>
        <span className="text-[10px] font-bold bg-secondary px-2 py-1 rounded">RESETA EM 14h</span>
      </div>

      <div className="space-y-4">
        {MISSIONS.map((m) => (
          <div key={m.id} className={`p-3 rounded-xl border ${m.completed ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {m.completed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <p className={`text-sm font-bold ${m.completed ? 'line-through opacity-50' : ''}`}>{m.title}</p>
                  <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                </div>
              </div>
              <span className="font-black text-xs text-primary">+{m.xp} XP</span>
            </div>
            <Progress value={(m.progress / m.target) * 100} className="h-1.5" />
          </div>
        ))}
      </div>
    </Card>
  )
}