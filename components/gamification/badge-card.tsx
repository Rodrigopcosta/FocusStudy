"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

// Definindo a interface para garantir que não haja 'any'
interface BadgeProps {
  badge: {
    id: string
    name: string
    description: string
    icon: string
    target: number
    current: number
    unlockedAt?: string | null
  }
}

export function BadgeCard({ badge }: BadgeProps) {
  // A lógica de desbloqueio agora é 100% dependente da presença do unlockedAt no banco
  const isUnlocked = !!badge.unlockedAt;
  
  // Proteção contra divisão por zero ou valores nulos
  const currentProgress = badge.current || 0;
  const targetGoal = badge.target || 1;
  const progressPercent = Math.min((currentProgress / targetGoal) * 100, 100);

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 border-2 flex flex-col h-full",
      isUnlocked 
        ? "border-primary/40 bg-primary/5 shadow-md ring-1 ring-primary/20" 
        : "opacity-60 grayscale bg-secondary/10 border-transparent"
    )}>
      <div className="p-4 md:p-5 flex flex-col items-center text-center space-y-3 flex-1">
        
        {/* Ícone Dinâmico ou Cadeado */}
        <div className={cn(
          "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl mb-1 shadow-inner transition-transform duration-500",
          isUnlocked ? "bg-primary/20 scale-110" : "bg-secondary text-muted-foreground"
        )}>
          {isUnlocked ? badge.icon : <Lock className="h-5 w-5 md:h-6 md:w-6" />}
        </div>
        
        <div className="space-y-1">
          <h3 className="font-bold text-xs md:text-sm text-foreground leading-tight">
            {badge.name}
          </h3>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {badge.description}
          </p>
        </div>

        {/* Espaçador para manter os botões/barras alinhados ao fundo */}
        <div className="mt-auto w-full pt-2">
          {!isUnlocked ? (
            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground/70 tracking-tighter">
                <span>Progresso</span>
                <span>{currentProgress}/{targetGoal}</span>
              </div>
              <Progress value={progressPercent} className="h-1.5 bg-secondary/50" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center bg-primary/10 text-primary text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest animate-in zoom-in duration-300">
              Conquistado
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}