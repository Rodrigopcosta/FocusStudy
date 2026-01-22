"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Task, Discipline, PomodoroMode } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Maximize2, Coffee, Target, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"

interface PomodoroTimerProps {
  defaultMode: PomodoroMode
  tasks: Task[]
  disciplines: Discipline[]
  initialTask: Task | null
}

const MODES = {
  "25/5": { work: 25 * 60, break: 5 * 60 },
  "50/10": { work: 50 * 60, break: 10 * 60 },
}

export function PomodoroTimer({ defaultMode, tasks, disciplines, initialTask }: PomodoroTimerProps) {
  const router = useRouter()
  const [mode, setMode] = useState<PomodoroMode>(defaultMode)
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTask?.id || "")
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [timeLeft, setTimeLeft] = useState(MODES[defaultMode].work)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const startTimeRef = useRef<Date | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const selectedTask = tasks.find((t) => t.id === selectedTaskId)

  useEffect(() => {
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleB0MLKfa+tq0QwYck83+4MI/Hzyk3v73tkgFFKnT/OO2SzgWudj/5LNLMyfH6Ofvnj4dKZre8OWgS0YVn8f/76w9Ei2k3v/ooEsEI6fX/OytQQ0krdj/8KIxKI3B/O+jJhOezf/vpSIVpt3/9aETJq/d//CeEy+s1v/xmRkyqdf/8ZYVO6bR/++SDjyn0P/0kAo/pcz/9YsJQaLI//WHBT+jw//2hQM/o77/+IIBP6K5//h/AD+htf/5fAA/obH/+XkAPqGt//l3AD6gqv/5dQA+oKf/+nMAP6Ck//pxAECgof/6cABBn5//+24AQZ+d//tsAEKem//7agBCnpn/+2gAQ56X//tmAESdlf/7ZQBEnZT/+2QARZ2S//tiAEack//7YQBGnJH/+2AARpuQ//teAEebj//7XQBHm47/+1wASJqM//taAEiajP/7WQBJmov/+1gASZmK//tXAEmZif/7VgBKmYj/+1UASpiH//tUAEuYhv/7UwBLl4X/+1IAS5eF//tRAEyWhP/7UABMloP/+08ATJaC//tOAE2Vgf/7TQBNlYH/+0wATpSA//tLAE6Uf//7SgBOlH//+0kAT5N+//tIAE+Tfv/7RwBQkn3/+0YAUJl9//tFAA==",
    )
  }, [])

  const playSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [soundEnabled])

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
        task_id: selectedTaskId || null,
        discipline_id: selectedTask?.discipline_id || null,
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
    [selectedTaskId, selectedTask, mode],
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

  const handleModeChange = (newMode: PomodoroMode) => {
    if (isRunning) return
    setMode(newMode)
    setTimeLeft(MODES[newMode].work)
    setIsBreak(false)
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
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 px-2 sm:px-0">
      <div className="text-center">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Pomodoro Timer</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {isBreak ? "Hora do descanso! Relaxe um pouco." : "Foque nos seus estudos."}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Mode Selector */}
          <div className="flex justify-center gap-2 md:gap-4 mb-6 md:mb-8">
            <Select value={mode} onValueChange={(v) => handleModeChange(v as PomodoroMode)} disabled={isRunning}>
              <SelectTrigger className="w-32 md:w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25/5">25/5 min</SelectItem>
                <SelectItem value="50/10">50/10 min</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>

          {/* Timer Display - Agora totalmente responsivo */}
          <div className="relative flex items-center justify-center mb-6 md:mb-8">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  className={isBreak ? "text-chart-2" : "text-primary"}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl md:text-5xl font-bold font-mono">{formatTime(timeLeft)}</span>
                <span className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2 flex items-center gap-1">
                  {isBreak ? (
                    <>
                      <Coffee className="h-3 w-3 md:h-4 md:w-4" />
                      Descanso
                    </>
                  ) : (
                    <>
                      <Target className="h-3 w-3 md:h-4 md:w-4" />
                      Foco
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Controls - Flex-wrap para evitar quebra de layout no mobile */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-6 md:mb-8">
            {isRunning ? (
              <Button size="lg" variant="outline" onClick={handlePause} className="flex-1 sm:flex-none min-w-[120px]">
                <Pause className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Pausar
              </Button>
            ) : (
              <Button size="lg" onClick={handleStart} className="flex-1 sm:flex-none min-w-[120px]">
                <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                {timeLeft === MODES[mode].work && !isBreak ? "Iniciar" : "Continuar"}
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={handleReset} className="flex-1 sm:flex-none min-w-[120px]">
              <RotateCcw className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Reiniciar
            </Button>
            <Button size="lg" variant="ghost" asChild className="w-full sm:w-auto mt-2 sm:mt-0">
              <Link href="/dashboard/focus">
                <Maximize2 className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Modo Foco
              </Link>
            </Button>
          </div>

          {/* Task Selector */}
          <div className="border-t pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-1">
              <span className="text-sm font-medium">Tarefa vinculada</span>
              <span className="text-xs md:text-sm text-muted-foreground">{completedCycles} ciclos completos</span>
            </div>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId} disabled={isRunning}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma tarefa (opcional)..." />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    <span className="truncate">
                      {task.discipline && `${task.discipline.icon} `}
                      {task.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTask && (
              <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2">
                {selectedTask.description || "Sem descrição"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}