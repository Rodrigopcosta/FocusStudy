'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
import FingerprintJS from '@fingerprintjs/fingerprintjs'

interface Subject {
  id: string
  name: string
  level: string | null
}

const STRIPE_PRICES = {
  monthly_trial: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_TRIAL_PRICE_ID,
  yearly_trial: process.env.NEXT_PUBLIC_STRIPE_YEARLY_TRIAL_PRICE_ID,
  monthly_direct: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_DIRECT_PRICE_ID,
  yearly_direct: process.env.NEXT_PUBLIC_STRIPE_YEARLY_DIRECT_PRICE_ID,
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

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showTutorial, setShowTutorial] = useState(true)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [hoursPerDay, setHoursPerDay] = useState('2')
  const [cpf, setCpf] = useState('')
  const [isTrialEligible, setIsTrialEligible] = useState(true)
  const [isValidatingCpf, setIsValidatingCpf] = useState(false)
  const [cpfHash, setCpfHash] = useState<string | null>(null)
  const [lastValidatedCpf, setLastValidatedCpf] = useState<string>('')
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [cpfAttempts, setCpfAttempts] = useState(0)
  const MAX_CPF_ATTEMPTS = 3

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Direito Constitucional', level: 'medio' },
    { id: '2', name: 'Língua Portuguesa', level: 'medio' },
    { id: '3', name: 'Raciocínio Lógico', level: 'medio' },
    { id: '4', name: 'Direito Administrativo', level: 'medio' },
  ])

  const router = useRouter()
  const supabase = createClient()
  const totalSteps = 4
  const abortControllerRef = useRef<AbortController | null>(null)

  // 1. Inicializa o Fingerprint e vincula ao perfil
  useEffect(() => {
    const initialize = async () => {
      try {
        const fp = await FingerprintJS.load()
        const result = await fp.get()
        const id = result.visitorId
        setDeviceId(id)
        
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        // Verifica se onboarding já foi completado
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()

        if (profile?.onboarding_completed) {
          router.push('/dashboard')
          return
        }

        await supabase
          .from('profiles')
          .update({ device_id: id })
          .eq('id', session.user.id)

        setIsCheckingAuth(false)
      } catch (error) {
        console.error("FJS Error:", error)
        toast.error("Erro ao identificar dispositivo.")
      }
    }
    initialize()
  }, [router, supabase])

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      setCpf(value)
    }
  }

  const validateCPF = (cpfValue: string) => {
    const cleanCpf = cpfValue.replace(/\D/g, '')
    if (cleanCpf.length !== 11 || !!cleanCpf.match(/(\d)\1{10}/)) return false
    let sum = 0, rest
    for (let i = 1; i <= 9; i++) sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i)
    rest = (sum * 10) % 11
    if ((rest === 10) || (rest === 11)) rest = 0
    if (rest !== parseInt(cleanCpf.substring(9, 10))) return false
    sum = 0
    for (let i = 1; i <= 10; i++) sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i)
    rest = (sum * 10) % 11
    if ((rest === 10) || (rest === 11)) rest = 0
    if (rest !== parseInt(cleanCpf.substring(10, 11))) return false
    return true
  }

  // 2. Valida Elegibilidade (CPF + Dispositivo)
  const checkEligibility = useCallback(async (cleanCpf: string) => {
    if (!deviceId || cleanCpf.length !== 11 || cleanCpf === lastValidatedCpf) return cpfHash
    
    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()

    setIsValidatingCpf(true)
    try {
      const response = await fetch('/api/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cleanCpf, deviceId }),
        signal: abortControllerRef.current.signal
      })
      
      const data = await response.json()
      
      // Bloqueia se o servidor retornar que o dispositivo já foi usado
      setIsTrialEligible(data.eligible)
      setLastValidatedCpf(cleanCpf)
      
      if (data.hash) {
        setCpfHash(data.hash)
        setCpfAttempts(prev => prev + 1)
        return data.hash
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') console.error("Erro na elegibilidade.")
    } finally {
      setIsValidatingCpf(false)
    }
    return null
  }, [deviceId, lastValidatedCpf, cpfHash])

  useEffect(() => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length === 11 && deviceId && validateCPF(cleanCpf)) {
        checkEligibility(cleanCpf)
    }
  }, [cpf, deviceId, checkEligibility])

  const finalizeProfileInDatabase = async (activeHash: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error('Sessão expirada.')

    const { error } = await supabase
      .from('profiles')
      .update({
        cpf_hash: activeHash,
        device_id: deviceId,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    if (error) {
      if (error.code === '23505') throw new Error('Este CPF já está vinculado a outra conta.')
      throw error
    }
    return true
  }

  const handleSubscription = async () => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (!deviceId) return toast.error("Erro de identificação do dispositivo.")

    setIsRedirecting(true)
    try {
      let finalHash = cpfHash
      
      // Se AINDA não tem hash após digitação e validação automática, tenta uma última vez
      // MAS SÓ se o CPF foi alterado desde a última validação
      if (!finalHash && cleanCpf !== lastValidatedCpf) {
        if (!validateCPF(cleanCpf)) {
          toast.error("CPF inválido.")
          setIsRedirecting(false)
          return
        }
        finalHash = await checkEligibility(cleanCpf)
      }

      // Se não tem hash e NÃO é elegível para trial, gera um hash genérico
      // (plano pago não precisa de validação de elegibilidade tão rígida)
      if (!finalHash && !isTrialEligible) {
        // Faz uma chamada rápida pro servidor só pra gerar o hash
        const hashResponse = await fetch('/api/check-eligibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf: cleanCpf, deviceId }),
        }).catch(() => null)
        
        if (hashResponse?.ok) {
          const data = await hashResponse.json()
          finalHash = data.hash
        }
      }

      // Se não tem hash e ainda é elegível, erro
      if (!finalHash && isTrialEligible) {
        toast.error("Validação pendente. Tente novamente.")
        setIsRedirecting(false)
        return
      }

      // Se tem hash, finaliza no banco
      if (finalHash) {
        await finalizeProfileInDatabase(finalHash)
      }

      // Seleciona o priceId baseado em elegibilidade
      const priceId = isTrialEligible 
        ? (billingCycle === 'monthly' ? STRIPE_PRICES.monthly_trial : STRIPE_PRICES.yearly_trial)
        : (billingCycle === 'monthly' ? STRIPE_PRICES.monthly_direct : STRIPE_PRICES.yearly_direct)

      if (!priceId) {
        toast.error("Configuração de preço não encontrada.")
        setIsRedirecting(false)
        return
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            priceId,
            cpf: cleanCpf, 
            deviceId,
        }),
      })
      
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Erro ao gerar checkout.")
      }
    } catch (error: any) {
      console.error("Erro na assinatura:", error)
      toast.error(error.message || "Erro ao processar assinatura")
      setIsRedirecting(false)
    }
  }

  const handleSkipSubscription = async () => {
    // Usuário opta por acessar com plano gratuito
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          plan_type: 'free',
          updated_at: new Date().toISOString(),
        })
        .eq('id', session?.user.id)
      
      toast.success("Bem-vindo ao FocusStudy! Acesso gratuito ativado.")
      router.push('/dashboard')
    } catch (error: any) {
      toast.error("Erro ao processar: " + error.message)
    }
  }

  const saveOnboardingData = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { error } = await supabase
        .from('profiles')
        .update({
          study_days: selectedDays,
          hours_per_day: parseInt(hoursPerDay),
          subject_levels: subjects,
          show_tutorial: showTutorial,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session?.user.id)
      if (error) throw error
      setStep(3)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

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
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => setSelectedDays(prev => prev.includes(day.value) ? prev.filter(d => d !== day.value) : [...prev, day.value])}
                        className={`h-10 w-10 rounded-full border text-xs font-bold transition-all cursor-pointer ${selectedDays.includes(day.value) ? 'bg-primary text-primary-foreground border-primary shadow-md scale-110' : 'bg-background text-muted-foreground hover:border-primary/50 border-input'}`}
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
                <Button onClick={() => setStep(2)} disabled={selectedDays.length === 0} className="w-full h-11 font-semibold cursor-pointer">
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
                <div className="space-y-4">
                  {subjects.map(sub => (
                    <div key={sub.id} className="p-3 border border-input rounded-lg space-y-2 bg-muted/20">
                      <Label className="text-sm font-bold">{sub.name}</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['facil', 'medio', 'dificil'].map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSubjects(prev => prev.map(s => s.id === sub.id ? {...s, level: lvl} : s))}
                            className={`py-1.5 text-[10px] uppercase font-bold rounded border transition-all cursor-pointer ${sub.level === lvl ? 'bg-primary/20 border-primary text-primary shadow-sm' : 'bg-background hover:bg-muted/50 border-input text-muted-foreground'}`}
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
                    <Checkbox id="tutorial" checked={showTutorial} onCheckedChange={() => { }} className="cursor-pointer" />
                    <div className="grid gap-1.5 leading-none cursor-pointer">
                      <Label className="text-sm font-bold cursor-pointer">Ativar tutorial guiado</Label>
                      <p className="text-xs text-muted-foreground">Dicas visuais na dashboard.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 cursor-pointer">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <Button onClick={saveOnboardingData} disabled={isLoading} className="flex-2 font-semibold cursor-pointer">
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
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 cursor-pointer">Voltar</Button>
                  <Button onClick={() => setStep(4)} className="flex-2 font-semibold bg-primary cursor-pointer text-primary-foreground">
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
                  <Lock className={`h-7 w-7 ${isTrialEligible ? 'text-amber-600' : 'text-primary'}`} />
                </div>
                <CardTitle className={`text-2xl font-bold ${isTrialEligible ? 'text-amber-600' : 'text-primary'}`}>
                  {isTrialEligible ? 'Ciclo Inteligente' : 'Acesso Premium'}
                </CardTitle>
                <CardDescription>
                  {isTrialEligible ? 'Valide seu documento para o teste gratuito' : 'Assine agora para liberar acesso total à inteligência.'}
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
                    onChange={handleCpfChange}
                    disabled={cpfAttempts >= MAX_CPF_ATTEMPTS}
                    className={`w-full h-11 rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary font-mono outline-none ${!isTrialEligible ? 'border-amber-500 border-2 bg-amber-500/5' : 'border-input'} ${cpfAttempts >= MAX_CPF_ATTEMPTS ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <div className="text-[10px] text-muted-foreground">
                    Tentativas: {cpfAttempts}/{MAX_CPF_ATTEMPTS}
                  </div>
                  {!isTrialEligible && (
                    <div className="flex items-center gap-1.5 text-amber-700 text-[10px] font-bold uppercase p-2 bg-amber-100 rounded mt-1 border border-amber-200">
                      <AlertCircle className="h-3 w-3" /> Benefício de teste já utilizado neste dispositivo.
                    </div>
                  )}
                  {cpfAttempts >= MAX_CPF_ATTEMPTS && (
                    <div className="flex items-center gap-1.5 text-red-700 text-[10px] font-bold uppercase p-2 bg-red-100 rounded mt-1 border border-red-200">
                      <AlertCircle className="h-3 w-3" /> Limite de tentativas atingido. Acesse como plano gratuito.
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

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSubscription}
                    disabled={isRedirecting || !cpf || isValidatingCpf || cpf.replace(/\D/g, '').length < 11 || !deviceId || cpfAttempts >= MAX_CPF_ATTEMPTS}
                    className={`w-full h-12 text-base font-bold shadow-lg transition-all cursor-pointer ${isTrialEligible ? 'bg-amber-600 hover:bg-amber-700 shadow-orange-500/20 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                  >
                    {isRedirecting ? <Loader2 className="h-5 w-5 animate-spin" /> : isTrialEligible ? 'Ativar 7 Dias Grátis' : 'Assinar Plano Premium'}
                  </Button>
                  
                  <Button 
                    onClick={handleSkipSubscription}
                    variant="outline"
                    className="w-full cursor-pointer"
                  >
                    Usar Plano Gratuito
                  </Button>
                </div>

                <Button variant="ghost" onClick={() => setStep(3)} className="w-full cursor-pointer">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
              </CardContent>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}