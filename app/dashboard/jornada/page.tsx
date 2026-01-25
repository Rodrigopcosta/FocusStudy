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
import confetti from "canvas-confetti"

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
    focusSessions: 0,
    id: ""
  })
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])
  const [topUsers, setTopUsers] = useState<RankingUser[]>([])
  const supabase = createClient()

  // Lógica de Multiplicador Visual
  const getMultiplier = (streak: number) => {
    if (streak >= 15) return { label: "2.0x", color: "text-purple-500", bg: "bg-purple-500/10" };
    if (streak >= 7) return { label: "1.5x", color: "text-orange-500", bg: "bg-orange-500/10" };
    if (streak >= 3) return { label: "1.2x", color: "text-blue-500", bg: "bg-blue-500/10" };
    return { label: "1.0x", color: "text-muted-foreground", bg: "bg-secondary/50" };
  };

  const bonus = getMultiplier(userData.streak);

  // Efeito de Confetti ao subir de nível
  useEffect(() => {
    if (!loading && userData.level > 1) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3b82f6', '#22c55e']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3b82f6', '#22c55e']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [userData.level, loading]);

  useEffect(() => {
    async function loadJornadaData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split('T')[0];

        // CORREÇÃO: A ordenação múltipla deve ser feita chamando .order() sucessivas vezes ou garantindo que as colunas existam.
        const [profileRes, badgesRes, tasksRes, rankingRes, focusRes] = await Promise.all([
          supabase.from('profiles').select('xp, level, streak_current').eq('id', user.id).maybeSingle(),
          supabase.from('user_badges').select('badge_id').eq('user_id', user.id),
          supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
          supabase.from('profiles')
            .select('id, full_name, avatar_url, xp, level, streak_current')
            .order('level', { ascending: false })
            .order('xp', { ascending: false }) // Encadeamento de ordenação correto
            .limit(10),
          supabase.from('focus_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('completed_at', today)
        ])

        setUserData({
          id: user.id,
          xp: profileRes.data?.xp ?? 0,
          level: profileRes.data?.level ?? 1,
          streak: profileRes.data?.streak_current ?? 0,
          completedTasks: tasksRes.count ?? 0,
          focusSessions: focusRes.count ?? 0
        })

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
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-350 mx-auto animate-in fade-in duration-500">
      
      {/* Header com Bônus de XP */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-6 md:p-8 rounded-3xl border shadow-sm border-primary/10">
        <div className="space-y-1 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-foreground italic flex items-center justify-center lg:justify-start gap-3">
            <Trophy className="h-8 w-8 text-primary" /> Jornada
          </h1>
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <p className="text-sm text-muted-foreground font-medium italic">"A constância vence a inteligência."</p>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border border-current/20 text-[10px] font-bold uppercase tracking-tighter ${bonus.bg} ${bonus.color}`}>
              <Zap className="h-3 w-3 fill-current" />
              Bônus {bonus.label}
            </div>
          </div>
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
              <DailyMissions progress={{ 
                tasks: userData.completedTasks, 
                focus: userData.focusSessions 
              }} />
              <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${
                userData.streak > 0 
                ? 'bg-orange-500/10 border-orange-500/20 shadow-lg shadow-orange-500/5' 
                : 'bg-secondary/20 border-border'
              }`}>
                <h3 className={`font-black uppercase flex items-center gap-2 mb-2 ${userData.streak > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  <Flame className={`h-5 w-5 ${userData.streak > 0 ? 'animate-pulse' : ''}`} /> 
                  Ofensiva {userData.streak} Dias
                </h3>
                <p className={`text-sm ${userData.streak > 0 ? 'text-orange-600/80' : 'text-muted-foreground/60'}`}>
                  {userData.streak > 0 
                    ? "Sua constância está multiplicando seu XP! Não pare agora." 
                    : "Complete uma tarefa ou pomodoro para iniciar sua sequência."}
                </p>
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
                <div key={user.id} className={`flex items-center justify-between p-5 transition-colors ${user.id === userData.id ? "bg-primary/10" : "hover:bg-secondary/5"}`}>
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center font-black text-muted-foreground">{index + 1}</span>
                    <Avatar className="border-2 border-background shadow-sm">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 font-bold">{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={`font-bold ${user.id === userData.id ? "text-primary" : ""}`}>
                        {user.full_name || "Estudante"} {user.id === userData.id && "(Você)"}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-orange-500 flex items-center gap-1">
                        <Flame className="h-3 w-3" /> {user.streak_current}d de ofensiva
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg">LVL {user.level}</p>
                    <p className="text-xs text-muted-foreground uppercase font-medium">{user.xp} XP</p>
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