import { createClient } from "@/lib/supabase/server"
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer"

export default async function PomodoroPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>
}) {
  const { task: taskId } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [profileRes, tasksRes, disciplinesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("pomodoro_mode")
      .eq("id", user.id)
      .single(),
    supabase
      .from("tasks")
      .select("*, discipline:disciplines(*)")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("due_date", { ascending: true }),
    supabase
      .from("disciplines")
      .select("*")
      .eq("user_id", user.id)
      .order("name")
  ])

  const tasks = tasksRes.data || []
  const selectedTask = taskId ? tasks.find((t) => t.id === taskId) || null : null

  return (
    <PomodoroTimer
      defaultMode={profileRes.data?.pomodoro_mode || "25/5"}
      tasks={tasks}
      disciplines={disciplinesRes.data || []}
      initialTask={selectedTask}
    />
  )
}