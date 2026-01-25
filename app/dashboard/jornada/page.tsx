"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserStats } from "@/components/gamification/user-stats"
import { BadgeCard } from "@/components/gamification/badge-card"
import { DailyMissions } from "@/components/gamification/daily-missions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Trophy, Medal, Flame, Zap, Loader2, 
  Crown, Users, LayoutDashboard 
} from "lucide-react"

// Interface para as medalhas vindo do banco
interface UserBadge {
  badge_id: string
}

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

interface RankingUser {
  id: string
  full_name: string | null
  avatar_url: string | null
  xp: number
  level: number
  streak_current: number
}

export default function JornadaPage() {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({ 
    xp: 0, 
    level: 1, 
    streak: 0, 
    completedTasks: 0,
    id: ""
  })
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])
  const [topUsers, setTopUsers] = useState<RankingUser[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadJornadaData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [profileRes, badgesRes, tasksRes, rankingRes] = await Promise.all([
          supabase.from('profiles').select('xp, level, streak_current').eq('id', user.id).maybeSingle(),
          supabase.from('user_badges').select('badge_id').eq('user_id', user.id),
          supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
          supabase.from('profiles').select('id, full_name, avatar_url, xp, level, streak_current').order('level', { ascending: false }).order('xp', { ascending: false }).limit(10)
        ])

        setUserData({
          id: user.id,
          xp: profileRes.data?.xp ?? 0,
          level: profileRes.data?.level ?? 1,
          streak: profileRes.data?.streak_current ?? 0,
          completedTasks: tasksRes.count ?? 0
        })

        // CORREÇÃO DO ERRO DE TIPO (b: UserBadge)
        const badgeIds = (badgesRes.data as UserBadge[])?.map((b: UserBadge) => b.badge_id) || []
        setUnlockedBadges(badgeIds)
        setTopUsers(rankingRes.data as RankingUser[] || [])

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

  const xpRemaining = 1000 - (userData.xp % 1000)

  const renderBadgeGrid = (category?: string) => {
    const filtered = category ? BADGES_MASTER.filter(b => b.category === category) : BADGES_MASTER
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filtered.map(badge => (
          <BadgeCard 
            key={badge.id} 
            badge={{ 
              ...badge, 
              unlockedAt: unlockedBadges.includes(badge.id) ? 'Conquistado' : undefined,
              current: unlockedBadges.includes(badge.id) ? badge.target : 0 
            }} 
          />
        ))}
      </div>
    )
  }

  return (
    // CORREÇÃO DO TAILWIND (max-w-350 em vez de max-w-[1400px])
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-350 mx-auto animate-in fade-in duration-500">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-6 md:p-8 rounded-3xl border shadow-sm border-primary/10">
        <div className="space-y-1 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-foreground italic flex items-center justify-center lg:justify-start gap-3">
            <Trophy className="h-8 w-8 text-primary" /> Jornada
          </h1>
          <p className="text-sm text-muted-foreground font-medium italic">"A constância vence a inteligência."</p>
        </div>
        
        <div className="flex items-center justify-between lg:justify-end gap-4 bg-primary/5 px-4 py-3 rounded-2xl border border-primary/20">
          <div className="text-left lg:text-right">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Nível {userData.level}</p>
            <p className="font-black text-lg text-primary leading-none">{xpRemaining} XP para o próximo nível</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="progresso" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md bg-secondary/30 mb-8">
          <TabsTrigger value="progresso" className="font-bold gap-2">
            <LayoutDashboard className="h-4 w-4" /> Meu Progresso
          </TabsTrigger>
          <TabsTrigger value="ranking" className="font-bold gap-2">
            <Users className="h-4 w-4" /> Ranking Global
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progresso" className="space-y-8 animate-in slide-in-from-left-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <UserStats xp={userData.xp} streak={userData.streak} completedTasks={userData.completedTasks} />
              
              <div className="bg-card p-6 rounded-3xl border border-border/60 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Medal className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold uppercase tracking-wider">Galeria de Insígnias</h2>
                </div>
                <Tabs defaultValue="all">
                  <TabsList className="bg-secondary/20 mb-6">
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="consistency">Foco</TabsTrigger>
                    <TabsTrigger value="discipline">Estudo</TabsTrigger>
                    <TabsTrigger value="speed">Performance</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">{renderBadgeGrid()}</TabsContent>
                  <TabsContent value="consistency">{renderBadgeGrid('consistency')}</TabsContent>
                  <TabsContent value="discipline">{renderBadgeGrid('discipline')}</TabsContent>
                  <TabsContent value="speed">{renderBadgeGrid('speed')}</TabsContent>
                </Tabs>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <DailyMissions progress={{ tasks: userData.completedTasks }} />
              <div className="bg-orange-500/10 border-2 border-orange-500/20 p-6 rounded-3xl">
                <h3 className="font-black text-orange-600 uppercase flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5" /> Ofensiva {userData.streak} Dias
                </h3>
                <p className="text-sm text-orange-600/80">Continue firme! Sua consistência é sua maior arma.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="animate-in slide-in-from-right-4 duration-300">
          <div className="bg-card rounded-3xl border shadow-xl overflow-hidden max-w-4xl mx-auto">
            <div className="p-6 bg-primary/5 border-b text-center">
              <Crown className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
              <h2 className="text-2xl font-black uppercase italic">Hall da Fama</h2>
            </div>
            <div className="divide-y divide-border/40">
              {topUsers.map((user, index) => (
                <div key={user.id} className={`flex items-center justify-between p-5 ${user.id === userData.id ? "bg-primary/10" : ""}`}>
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center font-black text-muted-foreground">{index + 1}</span>
                    <Avatar>
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{user.full_name || "Estudante"} {user.id === userData.id && "(Você)"}</p>
                      <p className="text-[10px] uppercase font-bold text-orange-500">🔥 {user.streak_current}d de ofensiva</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg">LVL {user.level}</p>
                    <p className="text-xs text-muted-foreground">{user.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}