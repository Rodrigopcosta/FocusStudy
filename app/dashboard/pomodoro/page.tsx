import { createClient } from "@/lib/supabase/server"
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer"

export default async function PomodoroPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>
}) {
  const { task: taskId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("pomodoro_mode").eq("id", user.id).single()

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, discipline:disciplines(*)")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("due_date", { ascending: true })

  const { data: disciplines } = await supabase.from("disciplines").select("*").eq("user_id", user.id).order("name")

  const selectedTask = taskId ? tasks?.find((t) => t.id === taskId) || null : null

  return (
    <PomodoroTimer
      defaultMode={profile?.pomodoro_mode || "25/5"}
      tasks={tasks || []}
      disciplines={disciplines || []}
      initialTask={selectedTask}
    />
  )
}
