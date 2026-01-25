"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export function BadgeCard({ badge }: { badge: any }) {
  const isUnlocked = !!badge.unlockedAt;
  const progressPercent = Math.min((badge.current / badge.target) * 100, 100);

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 border-2",
      isUnlocked ? "border-primary/40 bg-primary/5 shadow-md" : "opacity-70 grayscale bg-secondary/10 border-transparent"
    )}>
      <div className="p-5 flex flex-col items-center text-center space-y-3">
        {/* Ícone ou Cadeado */}
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2 shadow-inner",
          isUnlocked ? "bg-primary/20" : "bg-secondary text-muted-foreground"
        )}>
          {isUnlocked ? badge.icon : <Lock className="h-6 w-6" />}
        </div>
        
        <div>
          <h3 className="font-bold text-sm text-foreground">{badge.name}</h3>
          <p className="text-[10px] text-muted-foreground leading-tight mt-1">
            {badge.description}
          </p>
        </div>

        {/* Barra de progresso para as trancadas */}
        {!isUnlocked && (
          <div className="w-full space-y-1 mt-2">
            <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground">
              <span>{badge.current}/{badge.target}</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {isUnlocked && (
          <div className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
            Conquistado
          </div>
        )}
      </div>
    </Card>
  )
}