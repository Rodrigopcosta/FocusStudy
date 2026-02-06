'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Sparkles,
  Copy,
  Trash2,
  ChevronRight,
  Brain,
  Loader2,
  ListChecks,
  AlignLeft,
  MessageSquareQuote,
  ArrowLeft,
  Lock,
  X,
  Crown,
  Target,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input' // Importar Input para o CPF
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const MAX_CHARS = 50000
const DAILY_LIMIT = 10

export default function SummaryPage() {
  const [inputText, setInputText] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  // Estados para o Checkout
  const [cpf, setCpf] = useState('')
  const [mode, setMode] = useState<'short' | 'detailed' | 'bullets' | 'lines'>(
    'bullets'
  )
  const [planType, setPlanType] = useState<
    'free' | 'pro' | 'ultimate' | 'premium'
  >('free')
  const [usageCount, setUsageCount] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_type')
      .eq('id', session.user.id)
      .single()

    setPlanType(profile?.plan_type || 'free')

    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('summaries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('created_at', today)

    setUsageCount(count || 0)
  }

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    // Validação de CPF antes de chamar a API
    if (cpf.length < 11) {
      toast.error('Por favor, insira um CPF válido para continuar.')
      return
    }

    const priceId =
      plan === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID

    if (!priceId) {
      toast.error('Configuração de preço não encontrada.')
      return
    }

    setLoadingPriceId(priceId)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          cpf, // ENVIANDO O CPF OBRIGATÓRIO AGORA
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Erro ao gerar sessão de checkout')
      }
    } catch (error: any) {
      console.error('Erro no checkout:', error)
      toast.error(error.message || 'Erro ao redirecionar para o pagamento.')
    } finally {
      setLoadingPriceId(null)
    }
  }

  const handleSummarize = async () => {
    if (planType === 'free') {
      setShowUpgradeModal(true)
      return
    }

    if (!inputText.trim()) {
      toast.error('Insira um texto para resumir.')
      return
    }

    setLoading(true)
    setSummary('')

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, mode }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setSummary(data.summary)
      setUsageCount(prev => prev + 1)
      toast.success('Resumo gerado!')
    } catch (error: any) {
      toast.error('Falha ao gerar resumo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={12} /> Voltar ao Painel
            </Link>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Sparkles className="text-primary" size={32} /> Resumo Inteligente
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground font-semibold italic">
                Transforme textos longos em conhecimento puro.
              </p>
              {planType !== 'free' && (
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black border border-primary/20">
                  USO HOJE: {usageCount}/{DAILY_LIMIT}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setInputText('')
              setSummary('')
            }}
            className="rounded-xl border-2 font-black gap-2 hover:bg-destructive/10 cursor-pointer"
          >
            <Trash2 size={18} /> LIMPAR TUDO
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 px-2">
              <FileText size={14} /> Texto de Origem
            </h2>

            <Card className="border-2 border-border bg-accent/5 rounded-4xl overflow-hidden relative shadow-inner">
              <CardContent className="p-0 flex flex-col min-h-100">
                <Textarea
                  placeholder="Cole seu conteúdo aqui..."
                  className="flex-1 border-none bg-transparent resize-none p-8 text-lg font-medium focus-visible:ring-0 min-h-112.5 cursor-text"
                  value={inputText}
                  onChange={e =>
                    setInputText(e.target.value.substring(0, MAX_CHARS))
                  }
                />

                <div className="p-4 border-t border-border flex flex-wrap items-center gap-2 bg-accent/20">
                  <ModeTab
                    active={mode === 'bullets'}
                    onClick={() => setMode('bullets')}
                    icon={<ListChecks size={16} />}
                    label="Tópicos"
                  />
                  <ModeTab
                    active={mode === 'short'}
                    onClick={() => setMode('short')}
                    icon={<AlignLeft size={16} />}
                    label="Curto"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSummarize}
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl shadow-xl cursor-pointer transition-all active:scale-[0.98] group"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {planType === 'free' && (
                    <Lock size={18} className="text-primary-foreground/50" />
                  )}{' '}
                  GERAR RESUMO PREMIUM{' '}
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </section>

          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 px-2">
              <Brain size={14} /> Resultado da Síntese
            </h2>
            <Card className="border-2 border-primary/20 bg-card rounded-[2.5rem] min-h-125 flex flex-col shadow-2xl overflow-hidden relative">
              <AnimatePresence mode="wait">
                {summary ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="p-8 flex-1 text-xl font-serif leading-relaxed overflow-y-auto whitespace-pre-wrap">
                      {summary}
                    </div>
                    <div className="p-6 bg-accent/10 border-t flex gap-3">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(summary)
                          toast.success('Copiado!')
                        }}
                        variant="outline"
                        className="flex-1 rounded-xl font-black gap-2 h-12 border-2 cursor-pointer transition-all hover:bg-primary hover:text-white"
                      >
                        <Copy size={18} /> COPIAR RESUMO
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div
                    key="empty"
                    className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-20 italic"
                  >
                    <Sparkles
                      size={64}
                      className={loading ? 'animate-spin text-primary' : ''}
                    />
                    <p className="font-black uppercase tracking-widest mt-4">
                      {loading ? 'Processando IA...' : 'Aguardando seu texto'}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </Card>
          </section>
        </div>
      </div>

      {/* MODAL DE UPGRADE COM CAMPO DE CPF */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-card border-2 border-primary rounded-[3rem] shadow-2xl p-8 md:p-12 overflow-hidden"
            >
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-4 mb-8">
                <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2 animate-bounce">
                  <Crown size={32} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">
                  Assinatura FocusStudy
                </h2>
                <p className="text-muted-foreground font-bold">
                  Libere o poder total da IA e resuma até 50.000 caracteres.
                </p>
              </div>

              {/* CAMPO DE CPF OBRIGATÓRIO PARA O CHECKOUT */}
              <div className="mb-8 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <ShieldCheck size={14} /> Validação de Identidade (CPF)
                </label>
                <Input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={e =>
                    setCpf(e.target.value.replace(/\D/g, '').substring(0, 11))
                  }
                  className="h-14 rounded-xl border-2 focus:border-primary font-bold text-lg"
                />
                <p className="text-[9px] text-muted-foreground italic">
                  Necessário para processar seu trial de 7 dias com segurança.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opção Anual */}
                <div className="border-2 border-primary bg-primary/5 rounded-3xl p-6 flex flex-col items-center text-center relative group hover:bg-primary/10 transition-colors">
                  <div className="absolute -top-3 bg-primary text-primary-foreground text-[9px] font-black px-4 py-1 rounded-full tracking-tighter">
                    ECONOMIZE R$ 181
                  </div>
                  <Crown className="text-primary mb-2" />
                  <h3 className="font-black uppercase italic">
                    Ultimate Anual
                  </h3>
                  <div className="my-4">
                    <span className="text-4xl font-black italic">R$ 297</span>
                    <span className="text-sm opacity-60">/ano</span>
                  </div>
                  <Button
                    onClick={() => handleCheckout('yearly')}
                    disabled={!!loadingPriceId || cpf.length < 11}
                    className="w-full bg-primary hover:bg-primary/90 font-black cursor-pointer rounded-xl h-12 shadow-lg active:scale-95 transition-all"
                  >
                    {loadingPriceId ===
                    process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      'ASSINAR AGORA'
                    )}
                  </Button>
                </div>

                {/* Opção Mensal */}
                <div className="border-2 border-border rounded-3xl p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
                  <Target className="text-muted-foreground mb-2" />
                  <h3 className="font-black uppercase italic">Mensal Pro</h3>
                  <div className="my-4">
                    <span className="text-4xl font-black italic">R$ 39</span>
                    <span className="text-sm opacity-60">,90/mês</span>
                  </div>
                  <Button
                    onClick={() => handleCheckout('monthly')}
                    disabled={!!loadingPriceId || cpf.length < 11}
                    variant="outline"
                    className="w-full border-2 font-black cursor-pointer rounded-xl h-12 hover:bg-accent active:scale-95 transition-all"
                  >
                    {loadingPriceId ===
                    process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      'ASSINAR MENSAL'
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4 opacity-50 grayscale">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                  alt="Stripe"
                  className="h-5"
                />
                <div className="h-4 w-px bg-border" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Pagamento 100% Seguro
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ModeTab({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 cursor-pointer shadow-sm',
        active
          ? 'bg-primary border-primary text-primary-foreground'
          : 'bg-card border-border text-muted-foreground hover:bg-accent/50 hover:border-primary/30'
      )}
    >
      {icon} {label}
    </button>
  )
}
