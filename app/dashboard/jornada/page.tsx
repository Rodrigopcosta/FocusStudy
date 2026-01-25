"use client"

import { UserStats } from "@/components/gamification/user-stats"
import { BadgeCard } from "@/components/gamification/badge-card"
import { DailyMissions } from "@/components/gamification/daily-missions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Target, Brain, Flame, Zap, Award } from "lucide-react"

const USER_DATA = {
  xp: 3850,
  streak: 12,
  completedTasks: 47,
  badges: [
    { id: '1', name: 'Primeiro Passo', description: 'Criou sua primeira tarefa', icon: '🎯', unlockedAt: '2026-01-20', category: 'consistency', target: 1, current: 1 },
    { id: '2', name: 'Timer Ligado', description: 'Completou o primeiro Pomodoro', icon: '🍅', unlockedAt: '2026-01-21', category: 'speed', target: 1, current: 1 },
    { id: '3', name: 'Nota Inicial', description: 'Escreveu seu primeiro resumo', icon: '📝', unlockedAt: '2026-01-22', category: 'discipline', target: 1, current: 1 },
    { id: '4', name: 'Semana de Ouro', description: '7 dias de ofensiva seguidos', icon: '🔥', unlockedAt: '2026-01-25', category: 'consistency', target: 7, current: 7 },
    { id: '5', name: 'Flash Hunter', description: 'Respondeu 50 Flashcards', icon: '⚡', category: 'speed', target: 50, current: 12 },
    { id: '6', name: 'Estudioso', description: 'Concluiu 20 resumos', icon: '📚', category: 'discipline', target: 20, current: 8 },
    { id: '7', name: 'Inabalável', description: '30 dias de ofensiva sem falhar', icon: '💎', category: 'consistency', target: 30, current: 12 },
    { id: '8', name: 'Mestre do Tempo', description: '100 horas líquidas de estudo', icon: '⌛', category: 'discipline', target: 100, current: 42 },
    { id: '9', name: 'Sniper de Questões', description: 'Média de 90% de acerto em Flashcards', icon: '🏹', category: 'speed', target: 90, current: 75 },
    { id: '10', name: 'Lenda do Concurso', description: '1.000 horas líquidas de estudo', icon: '🏆', category: 'consistency', target: 1000, current: 42 },
    { id: '11', name: 'Doutrinador', description: 'Criou 500 resumos detalhados', icon: '📜', category: 'discipline', target: 500, current: 8 },
    { id: '12', name: 'Cérebro de Silício', description: '10.000 Flashcards revisados', icon: '🧠', category: 'speed', target: 10000, current: 12 }
  ]
}

export default function ConquistasPage() {
  const nextLevelXP = 1000 - (USER_DATA.xp % 1000);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-400 mx-auto animate-in fade-in duration-500">
      
      {/* Header Adaptativo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-5 md:p-8 rounded-3xl border shadow-sm border-primary/10">
        <div className="space-y-1 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-foreground italic">Jornada</h1>
          <p className="text-sm md:text-muted-foreground font-medium italic">"A constância vence a inteligência."</p>
        </div>
        
        <div className="flex items-center justify-between lg:justify-end gap-4 bg-primary/5 lg:bg-primary/10 px-4 md:px-6 py-3 md:py-4 rounded-2xl border border-primary/20">
          <div className="text-left lg:text-right">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Próximo Nível</p>
            <p className="font-black text-lg md:text-2xl text-primary leading-none">-{nextLevelXP} XP</p>
          </div>
          <div className="h-10 w-10 md:h-12 md:w-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Trophy className="text-primary-foreground h-5 w-5 md:h-7 md:w-7" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Lado Esquerdo */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <UserStats 
            xp={USER_DATA.xp} 
            streak={USER_DATA.streak} 
            completedTasks={USER_DATA.completedTasks} 
          />

          <div className="bg-card p-4 md:p-6 rounded-3xl border border-border/60 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b pb-4">
              <Medal className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">Galeria de Insígnias</h2>
            </div>

            <Tabs defaultValue="all" className="w-full">
              {/* TabsList refatorado para Grid em Mobile (sem scroll lateral) */}
              <TabsList className="grid grid-cols-2 md:flex bg-secondary/30 p-1 mb-6 gap-1 h-auto md:w-auto">
                <TabsTrigger value="all" className="font-bold py-2 md:px-6">Todas</TabsTrigger>
                <TabsTrigger value="consistency" className="font-bold py-2 md:px-6 data-[state=active]:text-orange-500 text-orange-600/70">Foco</TabsTrigger>
                <TabsTrigger value="discipline" className="font-bold py-2 md:px-6 data-[state=active]:text-blue-500 text-blue-600/70">Estudo</TabsTrigger>
                <TabsTrigger value="speed" className="font-bold py-2 md:px-6 data-[state=active]:text-purple-500 text-purple-600/70">Performance</TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <TabsContent value="all" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {USER_DATA.badges.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </TabsContent>

                <TabsContent value="consistency" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {USER_DATA.badges.filter(b => b.category === 'consistency').map(badge => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </TabsContent>

                <TabsContent value="discipline" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {USER_DATA.badges.filter(b => b.category === 'discipline').map(badge => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </TabsContent>

                <TabsContent value="speed" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {USER_DATA.badges.filter(b => b.category === 'speed').map(badge => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Lado Direito */}
        <div className="lg:col-span-4 space-y-6">
          <DailyMissions />

          {/* Dica do Especialista - Estilo Card Mobile Compacto */}
          <div className="bg-linear-to-br from-primary/10 via-background to-secondary/10 border-2 border-primary/10 p-6 md:p-8 rounded-3xl relative overflow-hidden group">
            <Zap className="absolute -right-2 -bottom-2 h-20 w-20 opacity-5 -rotate-12 transition-transform group-hover:scale-110" />
            <h3 className="font-black text-lg md:text-xl text-foreground uppercase tracking-tight mb-4 flex items-center gap-2">
                Dica de Mestre
            </h3>
            <div className="space-y-4 relative z-10">
               <div className="flex gap-3">
                 <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                   <Flame className="h-3 w-3 text-primary" />
                 </div>
                 <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                   Sua ofensiva de <strong>{USER_DATA.streak} dias</strong> libera bônus de XP! Não deixe o fogo apagar.
                 </p>
               </div>
               <div className="flex gap-3">
                 <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                   <Award className="h-3 w-3 text-blue-500" />
                 </div>
                 <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                   Badge "Doutrinador" é a mais rara entre os aprovados. Continue criando resumos!
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}