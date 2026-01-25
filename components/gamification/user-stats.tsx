"use client"

import { Zap, Flame, CheckCircle } from "lucide-react"

interface UserStatsProps {
  xp: number
  streak: number
  completedTasks: number
}

export function UserStats({ xp, streak, completedTasks }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-card p-6 rounded-3xl border border-border/60 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">XP Total</p>
          <p className="text-2xl font-black leading-none mt-1">{xp}</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-3xl border border-border/60 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
          <Flame className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ofensiva</p>
          <p className="text-2xl font-black leading-none mt-1">{streak} dias</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-3xl border border-border/60 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <CheckCircle className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Concluídas</p>
          <p className="text-2xl font-black leading-none mt-1">{completedTasks}</p>
        </div>
      </div>
    </div>
  )
}