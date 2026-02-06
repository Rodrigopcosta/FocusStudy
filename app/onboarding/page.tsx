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
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Subject {
  id: string
  name: string
  level: string | null
}

const STRIPE_PRICES = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
  yearly: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showTutorial, setShowTutorial] = useState(true)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [hoursPerDay, setHoursPerDay] = useState('2')
  const [cpf, setCpf] = useState('')

  // Novos estados para controle de elegibilidade de trial
  const [isTrialEligible, setIsTrialEligible] = useState(true)
  const [isValidatingCpf, setIsValidatingCpf] = useState(false)
  const [cpfHash, setCpfHash] = useState<string | null>(null) // Armazena o hash seguro

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  )
  const [isRedirecting, setIsRedirecting] = useState(false)

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Direito Constitucional', level: null },
    { id: '2', name: 'Língua Portuguesa', level: null },
    { id: '3', name: 'Raciocínio Lógico', level: null },
    { id: '4', name: 'Direito Administrativo', level: null },
  ])

  const router = useRouter()
  const supabase = createClient()
  const totalSteps = 4

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setIsCheckingAuth(false)
      }
    }
    checkUser()
  }, [router, supabase])

  // Efeito para validar o CPF assim que for digitado completamente
  useEffect(() => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length === 11) {
      checkEligibility(cleanCpf)
    } else {
      setIsTrialEligible(true)
      setCpfHash(null)
    }
  }, [cpf])

  const checkEligibility = async (cleanCpf: string) => {
    setIsValidatingCpf(true)
    try {
      const response = await fetch('/api/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cleanCpf }),
      })
      const data = await response.json()
      setIsTrialEligible(data.eligible)
      
      // Armazena o hash retornado pela API para salvamento posterior
      if (data.hash) {
        setCpfHash(data.hash)
      }

      if (!data.eligible) {
        toast.info('Identificamos que este CPF já utilizou o período de teste.')
      }
    } catch (error) {
      console.error('Erro ao validar CPF:', error)
    } finally {
      setIsValidatingCpf(false)
    }
  }

  // Função para salvar o hash no perfil e finalizar o onboarding
  const finalizeWithCpf = async (skipToDashboard = false) => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('Sessão expirada.')

      const { error } = await supabase
        .from('profiles')
        .update({
          cpf_hash: cpfHash, // Salvando apenas o hash por segurança
          onboarding_completed: true, // Garante que o status mude aqui também
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)

      if (error) throw error

      if (skipToDashboard) {
        router.push('/dashboard')
      }
      return true
    } catch (error: any) {
      toast.error('Erro ao salvar dados de segurança.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscription = async () => {
    const cleanCpf = cpf.replace(/\D/g, '')

    if (cleanCpf.length !== 11 || !cpfHash) {
      toast.error('Insira um CPF válido.')
      return
    }

    // Primeiro salvamos o hash no banco do usuário
    const saved = await finalizeWithCpf()
    if (!saved) return

    setIsRedirecting(true)
    try {
      const priceId =
        billingCycle === 'monthly'
          ? STRIPE_PRICES.monthly
          : STRIPE_PRICES.yearly

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          cpf: cleanCpf, // CPF limpo vai apenas para o Stripe
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar checkout')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      toast.error(error.message)
      setIsRedirecting(false)
    }
  }

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
    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, level } : s)))
  }

  const saveOnboardingData = async () => {
    setIsLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('Sessão expirada.')

      const { error } = await supabase
        .from('profiles')
        .update({
          study_days: selectedDays,
          hours_per_day: parseInt(hoursPerDay),
          subject_levels: subjects,
          show_tutorial: showTutorial,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)

      if (error) throw new Error(error.message)
      setStep(3) // Avança para o passo de sucesso antes do checkout
    } catch (error: any) {
      toast.error("Erro ao salvar preferências: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))
  const allSubjectsRated = subjects.every(s => s.level !== null)

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10 bg-background text-foreground transition-colors duration-500">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl tracking-tight">FocusStudy</span>
          </div>
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Passo {step} de {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </div>
        </div>

        <Card className="shadow-2xl border-muted/50 overflow-hidden bg-card">
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
                    {daysOfWeek.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`h-10 w-10 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                          selectedDays.includes(day.value)
                            ? 'bg-primary text-primary-foreground border-primary shadow-md scale-110'
                            : 'bg-background text-muted-foreground hover:border-primary/50 border-input'
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
                    onChange={e => setHoursPerDay(e.target.value)}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary cursor-pointer text-foreground outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                      <option key={h} value={h}>{h} {h === 1 ? 'hora' : 'horas'}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={nextStep} disabled={selectedDays.length === 0} className="w-full h-11 font-semibold cursor-pointer">
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
                  {subjects.map(sub => (
                    <div key={sub.id} className="p-3 border border-input rounded-lg space-y-2 bg-muted/20">
                      <Label className="text-sm font-bold">{sub.name}</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['facil', 'medio', 'dificil'].map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => updateSubjectLevel(sub.id, lvl)}
                            className={`py-1.5 text-[10px] uppercase font-bold rounded border transition-all cursor-pointer ${
                              sub.level === lvl ? 'bg-primary/20 border-primary text-primary shadow-sm' : 'bg-background hover:bg-muted/50 border-input text-muted-foreground'
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
                  <div className="flex items-start space-x-3 p-4 border border-input rounded-lg bg-muted/30 cursor-pointer" onClick={() => setShowTutorial(!showTutorial)}>
                    <Checkbox id="tutorial" checked={showTutorial} onCheckedChange={() => {}} className="cursor-pointer" />
                    <div className="grid gap-1.5 leading-none cursor-pointer">
                      <Label className="text-sm font-bold cursor-pointer">Ativar tutorial guiado</Label>
                      <p className="text-xs text-muted-foreground">Dicas visuais na dashboard.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={prevStep} className="flex-1 cursor-pointer">Voltar</Button>
                    <Button onClick={saveOnboardingData} disabled={!allSubjectsRated || isLoading} className="flex-2 font-semibold cursor-pointer">
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
                <div className="p-8 bg-primary/5 rounded-2xl border border-primary/10">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                  <p className="text-sm font-medium">Analisamos seus dados e seu ambiente de estudos está sendo preparado.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={prevStep} className="flex-1 cursor-pointer">Voltar</Button>
                  <Button onClick={nextStep} className="flex-2 font-semibold bg-primary cursor-pointer text-primary-foreground">
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
                <CardTitle className={`text-2xl font-bold ${isTrialEligible ? 'text-amber-600' : 'text-primary'}`}>
                  {isTrialEligible ? 'Ciclo Inteligente' : 'Acesso Premium'}
                </CardTitle>
                <CardDescription>
                  {isTrialEligible ? 'Valide seu documento para o teste gratuito' : 'Este documento já utilizou o teste. Assine para continuar.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex p-1 bg-muted rounded-lg">
                  <button onClick={() => setBillingCycle('monthly')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${billingCycle === 'monthly' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
                    Mensal
                  </button>
                  <button onClick={() => setBillingCycle('yearly')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${billingCycle === 'yearly' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
                    Anual <span className="text-[10px] text-green-600 font-bold">-20%</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground flex justify-between">
                    CPF do Titular
                    {isValidatingCpf && <Loader2 className="h-3 w-3 animate-spin" />}
                  </Label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    className={`w-full h-11 rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary font-mono outline-none ${!isTrialEligible ? 'border-amber-500/50 bg-amber-500/5' : 'border-input'}`}
                  />
                  {!isTrialEligible && (
                    <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-bold uppercase">
                      <AlertCircle className="h-3 w-3" /> Teste indisponível para este CPF
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className={`h-4 w-4 ${isTrialEligible ? 'text-green-500' : 'text-muted-foreground opacity-50'}`} />
                    <span className={isTrialEligible ? '' : 'line-through text-muted-foreground'}>7 dias de teste grátis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Cronograma baseado em IA</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubscription}
                  disabled={isRedirecting || !cpf || isValidatingCpf || cpf.length < 11}
                  className={`w-full h-12 text-base font-bold shadow-lg transition-all cursor-pointer ${
                    isTrialEligible ? 'bg-amber-600 hover:bg-amber-700 shadow-orange-500/20 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {isRedirecting ? <Loader2 className="h-5 w-5 animate-spin" /> : isTrialEligible ? 'Ativar 7 Dias Grátis' : 'Assinar Agora'}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => finalizeWithCpf(true)} // Salva o hash antes de ir para a dashboard
                  disabled={isLoading || !cpf || cpf.length < 11}
                  className="w-full text-muted-foreground text-xs cursor-pointer"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continuar com cronograma manual'}
                </Button>
              </CardContent>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}