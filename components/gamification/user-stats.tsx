"use client"

import { Progress } from "@/components/ui/progress"
import { Trophy, Flame, Star } from "lucide-react"

interface UserStatsProps {
  xp: number;
  streak: number;
  completedTasks: number;
}

export function UserStats({ xp, streak, completedTasks }: UserStatsProps) {
  const level = Math.floor(xp / 1000) + 1;
  const currentLevelXP = xp % 1000;
  const progress = (currentLevelXP / 1000) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Card de Ofensiva (Foguinho) */}
      <div className="bg-linear-to-br from-orange-500 to-red-600 p-4 rounded-2xl text-white shadow-lg flex items-center gap-4">
        <div className="bg-white/20 p-2 rounded-full">
          <Flame className="h-6 w-6 fill-current" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase opacity-80">Ofensiva</p>
          <p className="text-2xl font-black">{streak} Dias</p>
        </div>
      </div>

      {/* Card de Nível e XP */}
      <div className="bg-card border-2 border-primary/20 p-4 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
            <span className="font-black text-xl text-foreground">Nível {level}</span>
          </div>
          <span className="text-xs font-bold text-muted-foreground">{currentLevelXP} / 1000 XP</span>
        </div>
        <Progress value={progress} className="h-3 bg-secondary" />
      </div>

      {/* Card de Tarefas Totais */}
      <div className="bg-card border-2 border-green-500/20 p-4 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="bg-green-500/10 p-2 rounded-full text-green-600">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">Concluídas</p>
          <p className="text-2xl font-black text-foreground">{completedTasks}</p>
        </div>
      </div>
    </div>
  )
}