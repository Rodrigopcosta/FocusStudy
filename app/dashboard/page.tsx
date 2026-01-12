import { createClient } from "@/lib/supabase/server"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TodayTasks } from "@/components/dashboard/today-tasks"
import { QuickPomodoro } from "@/components/dashboard/quick-pomodoro"
import { RecentNotes } from "@/components/dashboard/recent-notes"
import { TasksChart } from "@/components/dashboard/tasks-chart"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const today = new Date().toISOString().split("T")[0]

  // Estatísticas de hoje
  const { data: todayStats } = await supabase
    .from("study_stats")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle()

  // Tarefas pendentes do usuário (limit 5)
  const { data: pendingTasks } = await supabase
    .from("tasks")
    .select("*, discipline:disciplines(*)")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("due_date", { ascending: true })
    .limit(5)

  // Todas as tarefas para calcular totais
  const { data: allTasks } = await supabase.from("tasks").select("status").eq("user_id", user.id)
  const completedTasks = allTasks?.filter((t) => t.status === "completed").length || 0
  const pendingTasksCount = allTasks?.filter((t) => t.status === "pending").length || 0

  // Notas recentes (limit 4)
  const { data: recentNotes } = await supabase
    .from("notes")
    .select("*, discipline:disciplines(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(4)

  // Disciplinas para o Quick Pomodoro
  const { data: disciplines } = await supabase.from("disciplines").select("*").eq("user_id", user.id).order("name")

  // Perfil do usuário (streak atual e melhor streak)
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_current, streak_best")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso e mantenha o foco nos estudos.</p>
      </div>

      <StatsCards
        todayMinutes={todayStats?.total_minutes || 0}
        tasksCompleted={todayStats?.tasks_completed || 0}
        pomodorosCompleted={todayStats?.pomodoros_completed || 0}
        streak={profile?.streak_current || 0}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayTasks tasks={pendingTasks || []} />
        </div>
        <TasksChart completed={completedTasks} pending={pendingTasksCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickPomodoro disciplines={disciplines || []} tasks={pendingTasks || []} />
        <RecentNotes notes={recentNotes || []} />
      </div>
    </div>
  )
}
