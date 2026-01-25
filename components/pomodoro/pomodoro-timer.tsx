"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Task, Discipline, PomodoroMode } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Maximize2, Coffee, Target, Volume2, VolumeX, Trophy, Minimize2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface PomodoroTimerProps {
  defaultMode: PomodoroMode
  tasks: Task[]
  disciplines: Discipline[]
  initialTask: Task | null
  isFocusPage?: boolean
}

const MODES = {
  "25/5": { work: 25 * 60, break: 5 * 60 },
  "50/10": { work: 50 * 60, break: 10 * 60 },
}

export function PomodoroTimer({ defaultMode, tasks, disciplines, initialTask, isFocusPage = false }: PomodoroTimerProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [mode, setMode] = useState<PomodoroMode>(defaultMode)
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTask?.id || "")
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [timeLeft, setTimeLeft] = useState(MODES[defaultMode].work)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const startTimeRef = useRef<Date | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isSavingRef = useRef(false)

  // 1. INICIALIZAÇÃO DO ÁUDIO
  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleB0MLKfa+tq0QwYck83+4MI/Hzyk3v73tkgFFKnT/OO2SzgWudj/5LNLMyfH6Ofvnj4dKZre8OWgS0YVn8f/76w9Ei2k3v/ooEsEI6fX/OytQQ0krdj/8KIxKI3B/O+jJhOezf/vpSIVpt3/9aETJq/d//CeEy+s1v/xmRkyqdf/8ZYVO6bR/++SDjyn0P/0kAo/pcz/9YsJQaLI//WHBT+jw//2hQM/o77/+IIBP6K5//h/AD+htf/5fAA/obH/+XkAPqGt//l3AD6gqv/5dQA+oKf/+nMAP6Ck//pxAECgof/6cABBn5//+24AQZ+d//tsAEKem//7agBCnpn/+2gAQ56X//tmAESdlf/7ZQBEnZT/+2QARZ2S//tiAEack//7YQBGnJH/+2AARpuQ//teAEebj//7XQBHm47/+1wASJqM//taAEiajP/7WQBJmov/+1gASZmK//tXAEmZif/7VgBKmYj/+1UASpiH//tUAEuYhv/7UwBLl4X/+1IAS5eF//tRAEyWhP/7UABMloP/+08ATJaC//tOAE2Vgf/7TQBNlYH/+0wATpSA//tLAE6Uf//7SgBOlH//+0kAT5N+//tIAE+Tfv/7RwBQkn3/+0YAUJl9//tFAA==")
  }, [])

  const playSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [soundEnabled])

  // 2. SINCRONIZAÇÃO MELHORADA
  const syncTimer = useCallback(() => {
    const savedEndTime = localStorage.getItem("pomodoro_end_time")
    const savedIsRunning = localStorage.getItem("pomodoro_running") === "true"
    const savedIsBreak = localStorage.getItem("pomodoro_is_break") === "true"
    const savedMode = localStorage.getItem("pomodoro_mode") as PomodoroMode
    const savedTaskId = localStorage.getItem("pomodoro_task_id")

    if (savedMode) setMode(savedMode)
    if (savedIsBreak) setIsBreak(true)
    
    // Valida se a tarefa salva ainda existe na lista atual de tarefas
    if (savedTaskId && savedTaskId !== "none") {
      const taskExists = tasks.some(t => t.id === savedTaskId)
      if (taskExists) {
        setSelectedTaskId(savedTaskId)
      } else {
        setSelectedTaskId("")
        localStorage.removeItem("pomodoro_task_id")
      }
    }

    if (savedIsRunning && savedEndTime) {
      const end = parseInt(savedEndTime)
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((end - now) / 1000))

      if (remaining > 0) {
        setTimeLeft(remaining)
        setIsRunning(true)
        const startActual = localStorage.getItem("pomodoro_start_actual")
        if (startActual) startTimeRef.current = new Date(parseInt(startActual))
      } else {
        setIsRunning(false)
        setTimeLeft(0)
      }
    } else if (!savedIsRunning) {
        const currentMode = savedMode || defaultMode
        setTimeLeft(savedIsBreak ? MODES[currentMode].break : MODES[currentMode].work)
    }
  }, [defaultMode, tasks])

  useEffect(() => {
    syncTimer()
    window.addEventListener('focus', syncTimer)
    return () => window.removeEventListener('focus', syncTimer)
  }, [syncTimer])

  // 3. SALVAMENTO DE SESSÃO
  const saveSession = useCallback(async (status: "completed" | "interrupted") => {
    if (!startTimeRef.current || isSavingRef.current) return
    isSavingRef.current = true

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const durationSeconds = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000)
      const minutesStudied = Math.floor(durationSeconds / 60)
      
      const xpGained = status === "completed" ? (minutesStudied * 15) : (minutesStudied * 5)

      await supabase.from("pomodoro_sessions").insert({
        user_id: user.id,
        task_id: (selectedTaskId && selectedTaskId !== "none") ? selectedTaskId : null,
        discipline_id: tasks.find(t => t.id === selectedTaskId)?.discipline_id || null,
        mode,
        duration_seconds: durationSeconds,
        completed_cycles: status === "completed" ? 1 : 0,
        status,
        started_at: startTimeRef.current.toISOString(),
        ended_at: now.toISOString(),
      })

      if (minutesStudied > 0) {
        await supabase.rpc('increment_study_stats', { 
          user_id: user.id, 
          inc_xp: xpGained, 
          inc_minutes: minutesStudied 
        })
        
        if (status === "completed") {
          toast.success(`Ciclo concluído! +${xpGained} XP.`, { icon: <Trophy className="text-yellow-500" /> })
        }
      }
    } finally {
      startTimeRef.current = null
      isSavingRef.current = false
      localStorage.removeItem("pomodoro_running")
      localStorage.removeItem("pomodoro_end_time")
    }
  }, [selectedTaskId, mode, supabase, tasks])

  // 4. MOTOR DO TIMER
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
        const breakTime = MODES[mode].break
        setTimeLeft(breakTime)
        localStorage.setItem("pomodoro_end_time", (Date.now() + breakTime * 1000).toString())
        localStorage.setItem("pomodoro_is_break", "true")
      } else {
        setIsBreak(false)
        setTimeLeft(MODES[mode].work)
        setIsRunning(false)
        localStorage.removeItem("pomodoro_running")
        localStorage.removeItem("pomodoro_is_break")
      }
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, isBreak, mode, playSound, saveSession])

  const handleStart = () => {
    const now = Date.now()
    const endTime = now + (timeLeft * 1000)
    
    if (!isRunning && !isBreak) {
      startTimeRef.current = new Date()
      localStorage.setItem("pomodoro_start_actual", now.toString())
    }
    
    setIsRunning(true)
    localStorage.setItem("pomodoro_running", "true")
    localStorage.setItem("pomodoro_end_time", endTime.toString())
    localStorage.setItem("pomodoro_mode", mode)
    localStorage.setItem("pomodoro_is_break", isBreak.toString())
    localStorage.setItem("pomodoro_task_id", selectedTaskId)
  }

  const handlePause = () => {
    setIsRunning(false)
    localStorage.setItem("pomodoro_running", "false")
    localStorage.removeItem("pomodoro_end_time")
  }

  const handleReset = () => {
    if (isRunning && startTimeRef.current) {
      saveSession("interrupted")
    }
    setIsRunning(false)
    setIsBreak(false)
    setTimeLeft(MODES[mode].work)
    localStorage.clear()
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
    <div className={`${isFocusPage ? "fixed inset-0 z-50 bg-background flex items-center justify-center p-4" : "max-w-2xl mx-auto space-y-6 px-2"}`}>
      <Card className={isFocusPage ? "w-full max-w-3xl border-none shadow-none bg-transparent" : ""}>
        <CardContent className="pt-6">
          {!isFocusPage && (
             <div className="text-center mb-6">
                <h1 className="text-xl font-bold">Pomodoro Timer</h1>
                <p className="text-sm text-muted-foreground">{isBreak ? "Hora do descanso!" : "Foque nos estudos."}</p>
             </div>
          )}

          <div className="flex justify-center gap-4 mb-8">
            <Select 
              value={mode} 
              onValueChange={(v) => { 
                const newMode = v as PomodoroMode;
                setMode(newMode); 
                setTimeLeft(MODES[newMode].work);
                localStorage.setItem("pomodoro_mode", newMode);
              }} 
              disabled={isRunning}
            >
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="25/5">25/5 min</SelectItem>
                <SelectItem value="50/10">50/10 min</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>

          <div className="relative flex items-center justify-center mb-8">
            <div className={`relative ${isFocusPage ? "w-72 h-72 sm:w-96 sm:h-96" : "w-56 h-56 sm:w-64 sm:h-64"}`}>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                <circle
                  cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="none"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  className={isBreak ? "text-emerald-500" : "text-primary"}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`${isFocusPage ? "text-6xl sm:text-8xl" : "text-4xl sm:text-5xl"} font-bold font-mono tracking-tighter tabular-nums`}>
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  {isBreak ? <><Coffee className="h-4 w-4" /> Descanso</> : <><Target className="h-4 w-4" /> Foco</>}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            {isRunning ? (
              <Button size="lg" variant="outline" onClick={handlePause} className="min-w-35">
                <Pause className="mr-2 h-5 w-5" /> Pausar
              </Button>
            ) : (
              <Button size="lg" onClick={handleStart} className="min-w-35">
                <Play className="mr-2 h-5 w-5" /> {timeLeft === MODES[mode].work && !isBreak ? "Iniciar" : "Continuar"}
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={handleReset} className="min-w-35">
              <RotateCcw className="mr-2 h-5 w-5" /> Reiniciar
            </Button>
            
            <Button size="lg" variant="secondary" asChild className="min-w-35">
              <Link href={isFocusPage ? "/dashboard/pomodoro" : "/dashboard/focus"}>
                {isFocusPage ? <><Minimize2 className="mr-2 h-5 w-5" /> Sair do Foco</> : <><Maximize2 className="mr-2 h-5 w-5" /> Modo Foco</>}
              </Link>
            </Button>
          </div>

          {!isFocusPage && (
            <div className="border-t pt-6">
              <Select 
                value={selectedTaskId || "none"} 
                onValueChange={(v) => {
                  setSelectedTaskId(v === "none" ? "" : v);
                  localStorage.setItem("pomodoro_task_id", v);
                }} 
                disabled={isRunning}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tarefa vinculada..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma tarefa</SelectItem>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}