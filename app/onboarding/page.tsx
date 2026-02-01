'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Sparkles, 
  Clock, 
  Calendar,
  GraduationCap,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Subject {
  id: string
  name: string
  level: string | null
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showTutorial, setShowTutorial] = useState(true)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [hoursPerDay, setHoursPerDay] = useState('2')
  
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Direito Constitucional', level: null },
    { id: '2', name: 'Língua Portuguesa', level: null },
    { id: '3', name: 'Raciocínio Lógico', level: null },
    { id: '4', name: 'Direito Administrativo', level: null },
  ])

  const router = useRouter()
  const supabase = createClient()
  const totalSteps = 3

  // Proteção de Rota: Verifica se o usuário está logado ao carregar a página
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login') // Redireciona se não houver sessão
      } else {
        setIsCheckingAuth(false)
      }
    }
    checkUser()
  }, [router, supabase])

  const daysOfWeek = [
    { label: 'S', value: 'seg' },
    { label: 'T', value: 'ter' },
    { label: 'Q', value: 'qua' },
    { label: 'Q', value: 'qui' },
    { label: 'S', value: 'sex' },
    { label: 'S', value: 'sab' },
    { label: 'D', value: 'dom' },
  ]

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const updateSubjectLevel = (id: string, level: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, level } : s))
  }

  const saveOnboardingData = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.')
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          study_days: selectedDays,
          hours_per_day: parseInt(hoursPerDay),
          subject_levels: subjects,
          show_tutorial: showTutorial,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })

      if (error) throw new Error(error.message)

      setStep(3)
    } catch (error: any) {
      console.error('Erro Onboarding:', error)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, 4))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))
  const allSubjectsRated = subjects.every(s => s.level !== null)

  // Enquanto verifica a autenticação, mostra um estado de carregamento simples
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10 bg-background transition-colors duration-300">
      <div className="w-full max-w-md">
        
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">FocusStudy</span>
          </div>
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Passo {step} de {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </div>
        </div>

        <Card className="shadow-2xl border-muted/50 bg-card">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Disponibilidade
                </CardTitle>
                <CardDescription>Quando você pretende estudar?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Dias da semana</Label>
                  <div className="flex justify-between gap-1">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`h-10 w-10 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                          selectedDays.includes(day.value) 
                          ? 'bg-primary text-primary-foreground border-primary shadow-md scale-110' 
                          : 'bg-background text-muted-foreground border-muted hover:border-primary/50'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Horas por dia
                  </Label>
                  <select 
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                      <option key={h} value={h}>{h} {h === 1 ? 'hora' : 'horas'}</option>
                    ))}
                  </select>
                </div>

                <Button onClick={nextStep} disabled={selectedDays.length === 0} className="w-full h-11 text-base font-semibold mt-4 cursor-pointer">
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" /> Suas Matérias
                </CardTitle>
                <CardDescription>Qual o seu nível de conhecimento?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-75 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {subjects.map((sub) => (
                    <div key={sub.id} className="p-3 border rounded-lg space-y-2">
                      <Label className="text-sm font-bold">{sub.name}</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['facil', 'medio', 'dificil'].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => updateSubjectLevel(sub.id, lvl)}
                            className={`py-1.5 text-[10px] uppercase font-bold rounded border transition-all cursor-pointer ${
                              sub.level === lvl 
                              ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                              : 'bg-background border-muted text-muted-foreground hover:bg-muted/50'
                            }`}
                          >
                            {lvl === 'facil' ? 'Fácil' : lvl === 'medio' ? 'Médio' : 'Difícil'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 space-y-4">
                  <div 
                    className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors" 
                    onClick={() => setShowTutorial(!showTutorial)}
                  >
                    <Checkbox 
                      id="tutorial" 
                      checked={showTutorial} 
                      className="cursor-pointer mt-0.5" 
                      onCheckedChange={() => {}} 
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label className="text-sm font-bold cursor-pointer">Ativar tutorial guiado</Label>
                      <p className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                        Dicas visuais na dashboard para facilitar seu início.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={prevStep} className="flex-1 h-11 cursor-pointer">Voltar</Button>
                    <Button 
                      onClick={saveOnboardingData} 
                      disabled={!allSubjectsRated || isLoading} 
                      className="flex-2 h-11 font-semibold cursor-pointer"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Finalizar Configuração'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Tudo pronto!</CardTitle>
                <CardDescription>Seu perfil foi configurado com sucesso.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div className="p-8 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                  <p className="text-sm font-medium text-foreground">
                    Analisamos seus dados e seu ambiente de estudos está sendo preparado.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={prevStep} className="flex-1 h-11 cursor-pointer">Voltar</Button>
                  <Button onClick={nextStep} className="flex-2 h-11 font-semibold bg-linear-to-r from-primary to-primary/80 cursor-pointer">
                    Gerar Cronograma
                  </Button>
                </div>
              </CardContent>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in zoom-in duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mb-2">
                  <Lock className="h-7 w-7 text-amber-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-amber-600">Ciclo Inteligente</CardTitle>
                <CardDescription>Recurso Exclusivo Premium</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground border-l-4 border-amber-500">
                  Para gerar um cronograma baseado na sua curva de esquecimento e nível nas matérias, assine o plano Pro.
                </div>
                <Button className="w-full h-12 text-base font-bold bg-linear-to-r from-amber-500 to-orange-600 hover:scale-[1.02] transition-transform shadow-lg shadow-orange-500/20 cursor-pointer">
                  Assinar Agora
                </Button>
                <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full text-muted-foreground text-xs hover:text-foreground cursor-pointer">
                  Continuar com cronograma manual
                </Button>
              </CardContent>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}