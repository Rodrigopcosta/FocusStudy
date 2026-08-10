'use client'

import { useState, useRef } from 'react'
import { 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Loader2, 
  Clock, 
  Download,
  Upload,
  FileCheck,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface Discipline {
  name: string
  topics: string[]
}

interface Task {
  discipline: string
  topic: string
  estimatedMinutes: number
}

interface ScheduleWeek {
  week: number
  focus: string
  tasks: Task[]
}

interface Flashcard {
  discipline: string
  front: string
  back: string
}

interface StudyPlan {
  title: string
  disciplines: Discipline[]
  schedule: ScheduleWeek[]
  flashcards: Flashcard[]
}

export default function StudyPlanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [weeksAvailable, setWeeksAvailable] = useState(4)
  const [hoursPerDay, setHoursPerDay] = useState(2)

  // Request & Data states
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [activeTab, setActiveTab] = useState<'schedule' | 'disciplines' | 'flashcards'>('schedule')
  const [activeWeek, setActiveWeek] = useState(1)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Apenas arquivos PDF são permitidos.')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        toast.error('Apenas arquivos PDF são permitidos.')
        return
      }
      setFile(droppedFile)
    }
  }

  const handleGeneratePlan = async () => {
    if (!file) {
      toast.error('Por favor, envie o arquivo PDF do edital.')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('weeksAvailable', weeksAvailable.toString())
      formData.append('hoursPerDay', hoursPerDay.toString())

      const response = await fetch('/api/ai/generate-study-plan', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao gerar o plano de estudos.')
      }

      setPlan(data)
      setActiveWeek(1)
      toast.success('Plano de estudos gerado com sucesso!')
    } catch (error: any) {
      toast.error('Erro no processamento', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8 print:p-0 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-primary text-sm font-semibold tracking-wider uppercase">
            <Sparkles className="w-4 h-4" /> Inteligência Artificial
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-foreground">Plano de Estudos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Faça upload do PDF do edital para gerar um cronograma semanal completo com flashcards.
          </p>
        </div>

        {plan && (
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-3 rounded-xl transition"
          >
            <Download className="w-5 h-5" />
            Exportar como PDF
          </button>
        )}
      </div>

      {/* Input Form Section */}
      {!plan && (
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 space-y-6 max-w-4xl mx-auto shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" /> Upload do PDF do Edital
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:border-primary/50 bg-background'
                }`}
              >
                <div className="p-3 bg-muted rounded-full mb-2">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Clique para selecionar ou arraste o PDF aqui
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Apenas arquivos no formato PDF
                </p>
              </div>
            ) : (
              <div className="bg-background border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-md">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Semanas de Preparação
              </label>
              <select
                value={weeksAvailable}
                onChange={(e) => setWeeksAvailable(Number(e.target.value))}
                className="w-full bg-background border border-input rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {[2, 4, 6, 8, 12, 16].map((w) => (
                  <option key={w} value={w}>{w} semanas</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Horas Diárias de Estudo
              </label>
              <select
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full bg-background border border-input rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {[1, 2, 3, 4, 6, 8].map((h) => (
                  <option key={h} value={h}>{h} horas / dia</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={loading || !file}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Lendo PDF e gerando plano de estudos...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar Plano de Estudos
              </>
            )}
          </button>
        </div>
      )}

      {/* Plan Dashboard View */}
      {plan && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm print:border-none print:p-0">
            <div>
              <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full print:hidden">
                Plano Personalizado
              </span>
              <h2 className="text-2xl font-bold mt-2 text-foreground">{plan.title}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {plan.schedule.length} semanas • {plan.disciplines.length} disciplinas • {plan.flashcards.length} flashcards gerados
              </p>
            </div>

            <button
              onClick={() => {
                setPlan(null)
                setFile(null)
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline transition print:hidden"
            >
              Enviar outro edital
            </button>
          </div>

          <div className="flex items-center gap-2 border-b border-border pb-3 print:hidden">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'schedule'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="w-4 h-4" /> Cronograma Semanal
            </button>
            <button
              onClick={() => setActiveTab('disciplines')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'disciplines'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Disciplinas ({plan.disciplines.length})
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'flashcards'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-4 h-4" /> Flashcards ({plan.flashcards.length})
            </button>
          </div>

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2 print:hidden">
                {plan.schedule.map((s: ScheduleWeek) => (
                  <button
                    key={s.week}
                    onClick={() => setActiveWeek(s.week)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      activeWeek === s.week
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Semana {s.week}
                  </button>
                ))}
              </div>

              {plan.schedule
                .filter((s: ScheduleWeek) => activeWeek === s.week)
                .map((weekData: ScheduleWeek) => (
                  <div key={weekData.week} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm print:border-zinc-300 print:mb-6">
                    <div className="border-b border-border pb-3">
                      <span className="text-xs text-primary uppercase tracking-wide font-bold">Foco Semanal</span>
                      <h3 className="text-lg font-semibold text-foreground mt-1">{weekData.focus}</h3>
                    </div>

                    <div className="space-y-3">
                      {weekData.tasks.map((task: Task, i: number) => (
                        <div
                          key={i}
                          className="bg-background border border-border rounded-xl p-4 flex items-center justify-between gap-4 print:border-zinc-200"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <span className="text-xs font-semibold text-primary">{task.discipline}</span>
                              <p className="text-sm text-foreground font-medium">{task.topic}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.estimatedMinutes} min
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'disciplines' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.disciplines.map((disc: Discipline, idx: number) => (
                <div key={idx} className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-sm print:border-zinc-300">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <BookOpen className="w-5 h-5" />
                    <h3 className="text-lg text-foreground">{disc.name}</h3>
                  </div>
                  <ul className="space-y-2 pt-2 border-t border-border">
                    {disc.topics.map((t: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.flashcards.map((card: Flashcard, idx: number) => (
                <div key={idx} className="bg-card border border-border rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-sm print:border-zinc-300">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                      {card.discipline}
                    </span>
                    <p className="text-sm text-foreground font-medium pt-1">{card.front}</p>
                  </div>
                  <div className="bg-background border border-border rounded-xl p-3 mt-3">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Resposta</span>
                    <p className="text-xs text-foreground/90">{card.back}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}