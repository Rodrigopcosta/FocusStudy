// app/actions/study-stats.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateStudyStats(secondsSpent: number, isPomodoroComplete: boolean = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Não autenticado" }

  const today = new Date().toISOString().split("T")[0]

  const { data: existingStats } = await supabase
    .from("study_stats")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle()

  if (existingStats) {
    const { error } = await supabase
      .from("study_stats")
      .update({
        // Somamos os segundos convertidos para minutos (ex: 30s = 0.5min)
        // Ou você pode alterar sua coluna no banco para 'total_seconds' se preferir
        total_minutes: existingStats.total_minutes + (secondsSpent / 60),
        pomodoros_completed: isPomodoroComplete 
          ? existingStats.pomodoros_completed + 1 
          : existingStats.pomodoros_completed
      })
      .eq("id", existingStats.id)
    
    if (error) throw error
  } else {
    const { error } = await supabase
      .from("study_stats")
      .insert({
        user_id: user.id,
        date: today,
        total_minutes: secondsSpent / 60,
        pomodoros_completed: isPomodoroComplete ? 1 : 0,
        tasks_completed: 0
      })
    
    if (error) throw error
  }

  revalidatePath("/dashboard")
}