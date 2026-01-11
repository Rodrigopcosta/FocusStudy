"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { X, Play, Pause, RotateCcw, Coffee, Target } from "lucide-react"
import type { PomodoroMode } from "@/types/database"

const MODES = {
  "25/5": { work: 25 * 60, break: 5 * 60 },
  "50/10": { work: 50 * 60, break: 10 * 60 },
}

export default function FocusModePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = (searchParams.get("mode") as PomodoroMode) || "25/5"

  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [timeLeft, setTimeLeft] = useState(MODES[mode].work)
  const [completedCycles, setCompletedCycles] = useState(0)
  const startTimeRef = useRef<Date | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleB0MLKfa+tq0QwYck83+4MI/Hzyk3v73tkgFFKnT/OO2SzgWudj/5LNLMyfH6Ofvnj4dKZre8OWgS0YVn8f/76w9Ei2k3v/ooEsEI6fX/OytQQ0krdj/8KIxKI3B/O+jJhOezf/vpSIVpt3/9aETJq/d//CeEy+s1v/xmRkyqdf/8ZYVO6bR/++SDjyn0P/0kAo/pcz/9YsJQaLI//WHBT+jw//2hQM/o77/+IIBP6K5//h/AD+htf/5fAA/obH/+XkAPqGt//l3AD6gqv/5dQA+oKf/+nMAP6Ck//pxAECgof/6cABBn5//+24AQZ+d//tsAEKem//7agBCnpn/+2gAQ56X//tmAESdlf/7ZQBEnZT/+2QARZ2S//tiAEack//7YQBGnJH/+2AARpuQ//teAEebj//7XQBHm47/+1wASJqM//taAEiajP/7WQBJmov/+1gASZmK//tXAEmZif/7VgBKmYj/+1UASpiH//tUAEuYhv/7UwBLl4X/+1IAS5eF//tRAEyWhP/7UABMloP/+08ATJaC//tOAE2Vgf/7TQBNlYH/+0wATpSA//tLAE6Uf//7SgBOlH//+0kAT5N+//tIAE+Tfv/7RwBQkn3/+0YAUJl9//tFAA==",
    )

    // Enter fullscreen on mount
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }

    return () => {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [])

  const saveSession = useCallback(
    async (status: "completed" | "interrupted") => {
      if (!startTimeRef.current) return

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const durationSeconds = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000)

      await supabase.from("pomodoro_sessions").insert({
        user_id: user.id,
        mode,
        duration_seconds: durationSeconds,
        completed_cycles: status === "completed" ? 1 : 0,
        status,
        started_at: startTimeRef.current.toISOString(),
        ended_at: new Date().toISOString(),
      })

      const today = new Date().toISOString().split("T")[0]
      const { data: existingStats } = await supabase
        .from("study_stats")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single()

      if (existingStats) {
        await supabase
          .from("study_stats")
          .update({
            total_minutes: existingStats.total_minutes + Math.floor(durationSeconds / 60),
            pomodoros_completed:
              status === "completed" ? existingStats.pomodoros_completed + 1 : existingStats.pomodoros_completed,
          })
          .eq("id", existingStats.id)
      } else {
        await supabase.from("study_stats").insert({
          user_id: user.id,
          date: today,
          total_minutes: Math.floor(durationSeconds / 60),
          pomodoros_completed: status === "completed" ? 1 : 0,
        })
      }

      startTimeRef.current = null
    },
    [mode],
  )

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (isRunning && timeLeft === 0) {
      playSound()
      if (!isBreak) {
        saveSession("completed")
        setCompletedCycles((prev) => prev + 1)
        setIsBreak(true)
        setTimeLeft(MODES[mode].break)
      } else {
        setIsBreak(false)
        setTimeLeft(MODES[mode].work)
        setIsRunning(false)
      }
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, isBreak, mode, playSound, saveSession])

  const handleStart = () => {
    if (!isRunning && !isBreak) {
      startTimeRef.current = new Date()
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    if (isRunning && startTimeRef.current) {
      saveSession("interrupted")
    }
    setIsRunning(false)
    setIsBreak(false)
    setTimeLeft(MODES[mode].work)
  }

  const handleExit = () => {
    if (isRunning && startTimeRef.current) {
      saveSession("interrupted")
    }
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
    router.push("/dashboard/pomodoro")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = isBreak
    ? ((MODES[mode].break - timeLeft) / MODES[mode].break) * 100
    : ((MODES[mode].work - timeLeft) / MODES[mode].work) * 100

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-colors duration-500 ${
        isBreak ? "bg-chart-2/10" : "bg-background"
      }`}
    >
      <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={handleExit}>
        <X className="h-6 w-6" />
      </Button>

      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          {isBreak ? <Coffee className="h-6 w-6 text-chart-2" /> : <Target className="h-6 w-6 text-primary" />}
          <span className="text-lg font-medium">{isBreak ? "Descanso" : "Foco"}</span>
        </div>

        <div className="relative mb-12">
          <svg className="w-80 h-80 transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="150"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="160"
              cy="160"
              r="150"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 150}
              strokeDashoffset={2 * Math.PI * 150 * (1 - progress / 100)}
              className={isBreak ? "text-chart-2" : "text-primary"}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-7xl font-bold font-mono">{formatTime(timeLeft)}</span>
            <span className="text-muted-foreground mt-2">{completedCycles} ciclos</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          {isRunning ? (
            <Button size="lg" variant="outline" onClick={handlePause}>
              <Pause className="mr-2 h-5 w-5" />
              Pausar
            </Button>
          ) : (
            <Button size="lg" onClick={handleStart}>
              <Play className="mr-2 h-5 w-5" />
              {timeLeft === MODES[mode].work && !isBreak ? "Iniciar" : "Continuar"}
            </Button>
          )}
          <Button size="lg" variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-5 w-5" />
            Reiniciar
          </Button>
        </div>
      </div>
    </div>
  )
}
