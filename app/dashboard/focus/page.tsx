'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X, Play, Pause, RotateCcw, Coffee, Target, Trophy } from 'lucide-react'
import type { PomodoroMode } from '@/types/database'
import { toast } from 'sonner'

const MODES = {
  '25/5': { work: 25 * 60, break: 5 * 60 },
  '50/10': { work: 50 * 60, break: 10 * 60 },
}

export default function FocusModePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [mode, setMode] = useState<PomodoroMode>(
    (searchParams.get('mode') as PomodoroMode) || '25/5'
  )
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [timeLeft, setTimeLeft] = useState(MODES[mode].work)
  const [completedCycles, setCompletedCycles] = useState(0)

  const startTimeRef = useRef<Date | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isSavingRef = useRef(false)

  // Função para sair da página e do Fullscreen com segurança
  const handleExit = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
    router.push('/dashboard/pomodoro')
  }, [router])

  // Monitora a saída do Fullscreen (F11, ESC ou X do Chrome)
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Se o usuário saiu do modo tela cheia do navegador, voltamos para a dashboard
      if (!document.fullscreenElement) {
        router.push('/dashboard/pomodoro')
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    // Tenta entrar em Fullscreen ao carregar
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        console.log('Ação do usuário necessária para tela cheia')
      })
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [router])

  // --- Lógica de Sincronização (Mantida da versão anterior) ---
  const syncFromLocalStorage = useCallback(() => {
    const savedEndTime = localStorage.getItem('pomodoro_end_time')
    const savedIsRunning = localStorage.getItem('pomodoro_running') === 'true'
    const savedIsBreak = localStorage.getItem('pomodoro_is_break') === 'true'
    const savedMode = localStorage.getItem('pomodoro_mode') as PomodoroMode

    if (savedMode) setMode(savedMode)
    if (savedIsBreak) setIsBreak(true)

    if (savedIsRunning && savedEndTime) {
      const end = parseInt(savedEndTime)
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((end - now) / 1000))

      if (remaining > 0) {
        setTimeLeft(remaining)
        setIsRunning(true)
        const startActual = localStorage.getItem('pomodoro_start_actual')
        if (startActual) startTimeRef.current = new Date(parseInt(startActual))
      }
    }
  }, [])

  useEffect(() => {
    audioRef.current = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleB0MLKfa+tq0QwYck83+4MI/Hzyk3v73tkgFFKnT/OO2SzgWudj/5LNLMyfH6Ofvnj4dKZre8OWgS0YVn8f/76w9Ei2k3v/ooEsEI6fX/OytQQ0krdj/8KIxKI3B/O+jJhOezf/vpSIVpt3/9aETJq/d//CeEy+s1v/xmRkyqdf/8ZYVO6bR/++SDjyn0P/0kAo/pcz/9YsJQaLI//WHBT+jw//2hQM/o77/+IIBP6K5//h/AD+htf/5fAA/obH/+XkAPqGt//l3AD6gqv/5dQA+oKf/+nMAP6Ck//pxAECgof/6cABBn5//+24AQZ+d//tsAEKem//7agBCnpn/+2gAQ56X//tmAESdlf/7ZQBEnZT/+2QARZ2S//tiAEack//7YQBGnJH/+2AARpuQ//teAEebj//7XQBHm47/+1wASJqM//taAEiajP/7WQBJmov/+1gASZmK//tXAEmZif/7VgBKmYj/+1UASpiH//tUAEuYhv/7UwBLl4X/+1IAS5eF//tRAEyWhP/7UABMloP/+08ATJaC//tOAE2Vgf/7TQBNlYH/+0wATpSA//tLAE6Uf//7SgBOlH//+0kAT5N+//tIAE+Tfv/7RwBQkn3/+0YAUJl9//tFAA=='
    )
    syncFromLocalStorage()
    window.addEventListener('focus', syncFromLocalStorage)
    return () => window.removeEventListener('focus', syncFromLocalStorage)
  }, [syncFromLocalStorage])

  const saveSession = useCallback(
    async (status: 'completed' | 'interrupted') => {
      if (!startTimeRef.current || isSavingRef.current) return
      isSavingRef.current = true
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return
        const now = new Date()
        const durationSeconds = Math.floor(
          (now.getTime() - startTimeRef.current.getTime()) / 1000
        )
        const minutesStudied = Math.floor(durationSeconds / 60)
        const xpGained =
          status === 'completed' ? minutesStudied * 15 : minutesStudied * 5

        await supabase.from('pomodoro_sessions').insert({
          user_id: user.id,
          mode,
          duration_seconds: durationSeconds,
          completed_cycles: status === 'completed' ? 1 : 0,
          status,
          started_at: startTimeRef.current.toISOString(),
          ended_at: now.toISOString(),
        })

        if (minutesStudied > 0) {
          await supabase.rpc('increment_study_stats', {
            user_id: user.id,
            inc_xp: xpGained,
            inc_minutes: minutesStudied,
          })
        }
      } finally {
        startTimeRef.current = null
        isSavingRef.current = false
        localStorage.removeItem('pomodoro_running')
        localStorage.removeItem('pomodoro_end_time')
      }
    },
    [mode, supabase]
  )

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (isRunning && timeLeft === 0) {
      if (audioRef.current) audioRef.current.play().catch(() => {})
      if (!isBreak) {
        saveSession('completed')
        setCompletedCycles(prev => prev + 1)
        setIsBreak(true)
        const breakTime = MODES[mode].break
        setTimeLeft(breakTime)
        localStorage.setItem(
          'pomodoro_end_time',
          (Date.now() + breakTime * 1000).toString()
        )
        localStorage.setItem('pomodoro_is_break', 'true')
      } else {
        setIsBreak(false)
        setTimeLeft(MODES[mode].work)
        setIsRunning(false)
        localStorage.removeItem('pomodoro_running')
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, isBreak, mode, saveSession])

  const handleStart = () => {
    const now = Date.now()
    const endTime = now + timeLeft * 1000
    if (!isRunning && !isBreak) {
      startTimeRef.current = new Date()
      localStorage.setItem('pomodoro_start_actual', now.toString())
    }
    setIsRunning(true)
    localStorage.setItem('pomodoro_running', 'true')
    localStorage.setItem('pomodoro_end_time', endTime.toString())
    localStorage.setItem('pomodoro_mode', mode)
    localStorage.setItem('pomodoro_is_break', isBreak.toString())
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = isBreak
    ? ((MODES[mode].break - timeLeft) / MODES[mode].break) * 100
    : ((MODES[mode].work - timeLeft) / MODES[mode].work) * 100

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center transition-colors duration-500 ${isBreak ? 'bg-emerald-500/10' : 'bg-background'}`}
    >
      {/* Botão X da Esquerda (Print 2) */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4"
        onClick={handleExit}
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          {isBreak ? (
            <Coffee className="h-6 w-6 text-emerald-500" />
          ) : (
            <Target className="h-6 w-6 text-primary" />
          )}
          <span className="text-lg font-medium">
            {isBreak ? 'Descanso' : 'Foco'}
          </span>
        </div>

        <div className="relative mb-12 flex items-center justify-center">
          <svg className="w-80 h-80 transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 140}
              strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
              className={isBreak ? 'text-emerald-500' : 'text-primary'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-7xl font-bold font-mono tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className="text-muted-foreground mt-2">
              {completedCycles} ciclos concluídos
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={isRunning ? () => setIsRunning(false) : handleStart}
            className="h-14 px-8"
          >
            {isRunning ? (
              <Pause className="mr-2 h-5 w-5" />
            ) : (
              <Play className="mr-2 h-5 w-5" />
            )}
            {isRunning ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setTimeLeft(MODES[mode].work)}
            className="h-14 px-8"
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Reiniciar
          </Button>
        </div>
      </div>
    </div>
  )
}
