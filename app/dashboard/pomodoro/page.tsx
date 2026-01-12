import { createClient } from "@/lib/supabase/server"
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer"

export default async function PomodoroPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>
}) {
  // Extrai o ID da tarefa da query string
  const { task: taskId } = await searchParams

  const supabase = await createClient()

  // Obtém o usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null // Se não houver usuário logado, não renderiza nada

  // Obtém o modo Pomodoro do perfil do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("pomodoro_mode")
    .eq("id", user.id)
    .single()

  // Busca todas as tarefas pendentes do usuário
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, discipline:disciplines(*)") // Inclui dados da disciplina relacionada
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("due_date", { ascending: true }) // Mais urgentes primeiro

  // Busca todas as disciplinas do usuário
  const { data: disciplines } = await supabase
    .from("disciplines")
    .select("*")
    .eq("user_id", user.id)
    .order("name")

  // Seleciona a tarefa inicial, se passada via query param
  const selectedTask = taskId ? tasks?.find((t) => t.id === taskId) || null : null

  return (
    <PomodoroTimer
      defaultMode={profile?.pomodoro_mode || "25/5"} // Modo Pomodoro padrão se não configurado
      tasks={tasks || []}
      disciplines={disciplines || []}
      initialTask={selectedTask} // Tarefa inicial selecionada
    />
  )
}
