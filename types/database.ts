export type TaskType = 'theory' | 'review' | 'questions'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'completed' | 'overdue'
export type PomodoroMode = '25/5' | '50/10'
export type Theme = 'light' | 'dark'
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_say'
export type StudyType = 'exam' | 'college'

export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  theme: Theme
  pomodoro_mode: PomodoroMode
  notifications_enabled: boolean

  // Gamificação e Ofensiva
  xp: number // Total de experiência acumulada
  level: number // Nível atual do usuário
  streak_current: number // Dias seguidos atuais
  streak_best: number // Recorde de dias seguidos
  last_study_date: string | null

  // Dados Pessoais
  birth_date: string | null
  gender: Gender | null
  terms_accepted_at: string | null
  study_type: StudyType

  created_at: string
  updated_at: string
}

export interface Discipline {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  course: string | null
  subject: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  discipline_id: string | null
  title: string
  description: string | null
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  estimated_minutes: number
  actual_minutes: number
  start_date: string | null
  due_date: string | null
  completed_at: string | null
  reminder_at: string | null
  position: number
  is_pinned: boolean
  created_at: string
  updated_at: string
  discipline?: Discipline
}

export interface Note {
  id: string
  user_id: string
  discipline_id: string | null
  title: string
  content: string
  topic: string | null
  is_important: boolean
  created_at: string
  updated_at: string
  discipline?: Discipline
  is_pinned: boolean
  color: string | null
  position: number
}

export interface PomodoroSession {
  id: string
  user_id: string
  task_id: string | null
  discipline_id: string | null
  mode: PomodoroMode
  duration_seconds: number
  completed_cycles: number
  status: 'completed' | 'interrupted'
  started_at: string
  ended_at: string | null
}

export interface StudyStats {
  id: string
  user_id: string
  date: string
  total_minutes: number
  tasks_completed: number
  pomodoros_completed: number
}

// --- NOVAS INTERFACES PARA CONQUISTAS ---

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string // ID único da medalha (ex: 'primeiro-passo')
  unlocked_at: string // Data do desbloqueio
}

export interface UserProgress {
  user_id: string
  total_tasks_completed: number
  total_pomodoros_completed: number
  total_notes_created: number
  total_flashcards_reviewed: number
  total_hours_studied: number
  updated_at: string
}
