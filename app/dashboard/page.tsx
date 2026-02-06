import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TodayTasks } from '@/components/dashboard/today-tasks'
import { QuickPomodoro } from '@/components/dashboard/quick-pomodoro'
import { RecentNotes } from '@/components/dashboard/recent-notes'
import { TasksChartClient } from '@/components/dashboard/tasks-chart-client'
import { CheckCircle2, PartyPopper } from 'lucide-react'

interface DashboardProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const params = await searchParams
  const isSuccess = params.success === 'true'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const [
    statsRes,
    pendingTasksRes,
    allTasksRes,
    notesRes,
    disciplinesRes,
    profileRes,
  ] = await Promise.all([
    supabase
      .from('study_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle(),
    supabase
      .from('tasks')
      .select('*, discipline:disciplines(*)')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(5),
    supabase.from('tasks').select('status').eq('user_id', user.id),
    supabase
      .from('notes')
      .select('*, discipline:disciplines(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(4),
    supabase
      .from('disciplines')
      .select('*')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('profiles')
      .select('streak_current, streak_best, plan_type')
      .eq('id', user.id)
      .single(),
  ])

  const todayStats = statsRes.data
  const pendingTasks = pendingTasksRes.data
  const allTasks = allTasksRes.data
  const recentNotes = notesRes.data
  const disciplines = disciplinesRes.data
  const profile = profileRes.data

  const completedTasksCount =
    allTasks?.filter(t => t.status === 'completed').length || 0
  const pendingTasksCount =
    allTasks?.filter(t => t.status === 'pending').length || 0

  const isFreePlan = !profile?.plan_type || profile?.plan_type === 'free'

  return (
    <div className="space-y-6">
      {/* Alerta de Sucesso Bonito */}
      {isSuccess && (
        <div className="relative overflow-hidden group rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PartyPopper className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold leading-none text-foreground flex items-center gap-2">
                Assinatura Ativada!
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </h4>
              <p className="text-sm text-muted-foreground">
                Seu período de 7 dias grátis começou. Todas as funções premium
                estão liberadas.
              </p>
            </div>
          </div>
          {/* Detalhe visual de brilho no fundo */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e mantenha o foco nos estudos.
          </p>
        </div>
      </div>

      <StatsCards
        todayMinutes={Math.floor(todayStats?.total_minutes || 0)}
        tasksCompleted={todayStats?.tasks_completed || 0}
        pomodorosCompleted={todayStats?.pomodoros_completed || 0}
        streak={profile?.streak_current || 0}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayTasks tasks={pendingTasks || []} />
        </div>
        <TasksChartClient
          completed={completedTasksCount}
          pending={pendingTasksCount}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickPomodoro
          disciplines={disciplines || []}
          tasks={pendingTasks || []}
        />
        <RecentNotes notes={recentNotes || []} />
      </div>
    </div>
  )
}
