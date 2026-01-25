"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserStats } from "@/components/gamification/user-stats"
import { BadgeCard } from "@/components/gamification/badge-card"
import { DailyMissions } from "@/components/gamification/daily-missions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Flame, Zap, Loader2 } from "lucide-react"

// Lista Mestra de Definições de Insígnias
const BADGES_MASTER = [
  { id: 'primeiro-passo', name: 'Primeiro Passo', description: 'Criou sua primeira tarefa', icon: '🎯', category: 'consistency', target: 1 },
  { id: 'semana-ouro', name: 'Semana de Ouro', description: '7 dias de ofensiva seguidos', icon: '🔥', category: 'consistency', target: 7 },
  { id: 'inabalavel', name: 'Inabalável', description: '30 dias de ofensiva sem falhar', icon: '💎', category: 'consistency', target: 30 },
  { id: 'lenda-concurso', name: 'Lenda do Concurso', description: '1.000 horas líquidas de estudo', icon: '🏆', category: 'consistency', target: 1000 },
  { id: 'nota-inicial', name: 'Nota Inicial', description: 'Escreveu seu primeiro resumo', icon: '📝', category: 'discipline', target: 1 },
  { id: 'estudioso', name: 'Estudioso', description: 'Concluiu 20 resumos', icon: '📚', category: 'discipline', target: 20 },
  { id: 'mestre-tempo', name: 'Mestre do Tempo', description: '100 horas líquidas de estudo', icon: '⌛', category: 'discipline', target: 100 },
  { id: 'doutrinador', name: 'Doutrinador', description: 'Criou 500 resumos detalhados', icon: '📜', category: 'discipline', target: 500 },
  { id: 'timer-ligado', name: 'Timer Ligado', description: 'Completou o primeiro Pomodoro', icon: '🍅', category: 'speed', target: 1 },
  { id: 'flash-hunter', name: 'Flash Hunter', description: 'Respondeu 50 Flashcards', icon: '⚡', category: 'speed', target: 50 },
  { id: 'sniper-questoes', name: 'Sniper de Questões', description: '90% de acerto em Flashcards', icon: '🏹', category: 'speed', target: 90 },
  { id: 'cerebro-silicio', name: 'Cérebro de Silício', description: '10.000 Flashcards revisados', icon: '🧠', category: 'speed', target: 10000 },
]

export default function JornadaPage() {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({ 
    xp: 0, 
    level: 1, 
    streak: 0, 
    completedTasks: 0 
  })
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadJornadaData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Buscas paralelas para otimizar o carregamento
        const [profileRes, badgesRes, tasksRes] = await Promise.all([
          supabase.from('profiles').select('xp, level, streak_current').eq('id', user.id).maybeSingle(),
          supabase.from('user_badges').select('badge_id').eq('user_id', user.id),
          supabase.from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'completed')
        ])

        setUserData({
          xp: profileRes.data?.xp ?? 0,
          level: profileRes.data?.level ?? 1,
          streak: profileRes.data?.streak_current ?? 0,
          completedTasks: tasksRes.count ?? 0
        })

        const badgeIds = (badgesRes.data as { badge_id: string }[] | null)?.map(b => b.badge_id) || []
        setUnlockedBadges(badgeIds)

      } catch (error) {
        console.error("Erro ao carregar jornada:", error)
      } finally {
        setLoading(false)
      }
    }

    loadJornadaData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Lógica de XP
  const xpPerLevel = 1000
  const xpCurrentLevel = userData.xp % xpPerLevel
  const xpRemaining = Math.max(0, xpPerLevel - xpCurrentLevel)

  const renderBadgeGrid = (category?: string) => {
    const filtered = category 
      ? BADGES_MASTER.filter(b => b.category === category)
      : BADGES_MASTER

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filtered.map(badge => {
          const isUnlocked = unlockedBadges.includes(badge.id)
          return (
            <BadgeCard 
              key={badge.id} 
              badge={{
                ...badge,
                unlockedAt: isUnlocked ? 'Conquistado' : undefined,
                current: isUnlocked ? badge.target : 0 
              }} 
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-400 mx-auto animate-in fade-in duration-500">
      
      {/* Header da Jornada */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-5 md:p-8 rounded-3xl border shadow-sm border-primary/10">
        <div className="space-y-1 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-foreground italic">Jornada</h1>
          <p className="text-sm md:text-muted-foreground font-medium italic">"A constância vence a inteligência."</p>
        </div>
        
        <div className="flex items-center justify-between lg:justify-end gap-4 bg-primary/5 px-4 py-3 rounded-2xl border border-primary/20">
          <div className="text-left lg:text-right">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Nível {userData.level}</p>
            <p className="font-black text-lg md:text-2xl text-primary leading-none">
               {xpRemaining} XP para o Nível {userData.level + 1}
            </p>
          </div>
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Trophy className="text-primary-foreground h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <UserStats 
            xp={userData.xp} 
            streak={userData.streak} 
            completedTasks={userData.completedTasks} 
          />

          <div className="bg-card p-4 md:p-6 rounded-3xl border border-border/60 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b pb-4">
              <Medal className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">Galeria de Insígnias</h2>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-2 md:flex bg-secondary/30 p-1 mb-6 gap-1 h-auto md:w-auto">
                <TabsTrigger value="all" className="font-bold py-2 md:px-6">Todas</TabsTrigger>
                <TabsTrigger value="consistency" className="font-bold py-2 md:px-6 data-[state=active]:text-orange-500 text-xs">Foco</TabsTrigger>
                <TabsTrigger value="discipline" className="font-bold py-2 md:px-6 data-[state=active]:text-blue-500 text-xs">Estudo</TabsTrigger>
                <TabsTrigger value="speed" className="font-bold py-2 md:px-6 data-[state=active]:text-purple-500 text-xs">Performance</TabsTrigger>
              </TabsList>
              <TabsContent value="all">{renderBadgeGrid()}</TabsContent>
              <TabsContent value="consistency">{renderBadgeGrid('consistency')}</TabsContent>
              <TabsContent value="discipline">{renderBadgeGrid('discipline')}</TabsContent>
              <TabsContent value="speed">{renderBadgeGrid('speed')}</TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Barra Lateral */}
        <div className="lg:col-span-4 space-y-6">
          <DailyMissions progress={{ tasks: userData.completedTasks }} />
          
          <div className={`bg-linear-to-br border-2 p-6 md:p-8 rounded-3xl relative overflow-hidden group transition-all duration-500 ${
            userData.streak > 0 
              ? 'from-orange-500/10 via-background to-orange-500/5 border-orange-500/20' 
              : 'from-primary/10 via-background to-secondary/10 border-primary/10'
          }`}>
            <Zap className={`absolute -right-2 -bottom-2 h-20 w-20 opacity-5 -rotate-12 transition-transform ${
              userData.streak > 0 ? 'text-orange-500' : 'text-primary'
            }`} />
            
            <h3 className="font-black text-lg md:text-xl text-foreground uppercase tracking-tight mb-4">
              {userData.streak > 0 ? "🔥 Ofensiva Ativa!" : "💡 Dica de Mestre"}
            </h3>

            <div className="space-y-4 relative z-10">
               <div className="flex gap-3">
                 <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                   userData.streak > 0 ? 'bg-orange-500/20' : 'bg-primary/20'
                 }`}>
                   <Flame className={`h-3 w-3 ${userData.streak > 0 ? 'text-orange-500' : 'text-primary'}`} />
                 </div>
                 <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                   {userData.streak > 0 
                    ? `Incrível! Você está há ${userData.streak} dias focado. Continue assim para multiplicar seu bônus de XP!`
                    : `Complete sua primeira tarefa do dia para iniciar sua ofensiva e ganhar bônus de XP!`
                   }
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}