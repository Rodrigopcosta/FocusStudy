import { createClient } from "@/lib/supabase/server"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TodayTasks } from "@/components/dashboard/today-tasks"
import { QuickPomodoro } from "@/components/dashboard/quick-pomodoro"
import { RecentNotes } from "@/components/dashboard/recent-notes"
import { TasksChartClient } from "@/components/dashboard/tasks-chart-client"
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner" // Novo componente que criaremos

export default async function DashboardPage() {
  
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const today = new Date().toISOString().split("T")[0]

  // PERFORMANCE: Adicionamos 'plan_type' na busca do profile
  const [statsRes, pendingTasksRes, allTasksRes, notesRes, disciplinesRes, profileRes] = await Promise.all([
    supabase.from("study_stats").select("*").eq("user_id", user.id).eq("date", today).maybeSingle(),
    supabase.from("tasks").select("*, discipline:disciplines(*)").eq("user_id", user.id).eq("status", "pending").order("due_date", { ascending: true }).limit(5),
    supabase.from("tasks").select("status").eq("user_id", user.id),
    supabase.from("notes").select("*, discipline:disciplines(*)").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(4),
    supabase.from("disciplines").select("*").eq("user_id", user.id).order("name"),
    supabase.from("profiles").select("streak_current, streak_best, plan_type").eq("id", user.id).single()
  ])

  const todayStats = statsRes.data
  const pendingTasks = pendingTasksRes.data
  const allTasks = allTasksRes.data
  const recentNotes = notesRes.data
  const disciplines = disciplinesRes.data
  const profile = profileRes.data

  const completedTasksCount = allTasks?.filter((t) => t.status === "completed").length || 0
  const pendingTasksCount = allTasks?.filter((t) => t.status === "pending").length || 0

  // Verifica se o usuário é Free para mostrar o banner
  const isFreePlan = !profile?.plan_type || profile?.plan_type === 'free'

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso e mantenha o foco nos estudos.</p>
        </div>
        
        {/* Se for Free, mostra o CTA de assinatura discretamente ou um destaque */}
        {isFreePlan && <UpgradeBanner />}
      </div>

      <StatsCards
        todayMinutes={todayStats?.total_minutes || 0}
        tasksCompleted={todayStats?.tasks_completed || 0}
        pomodorosCompleted={todayStats?.pomodoros_completed || 0}
        streak={profile?.streak_current || 0}
      />

      {/* Trava Visual: Se for Free, você pode desabilitar componentes ou colocar um overlay neles */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayTasks tasks={pendingTasks || []} />
        </div>
        <TasksChartClient completed={completedTasksCount} pending={pendingTasksCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickPomodoro disciplines={disciplines || []} tasks={pendingTasks || []} />
        <RecentNotes notes={recentNotes || []} />
      </div>
    </div>
  )
}