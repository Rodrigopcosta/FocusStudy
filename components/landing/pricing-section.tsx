'use client'

import { useState } from 'react'
import {
  Check,
  Zap,
  ShieldCheck,
  Rocket,
  Crown,
  CalendarDays,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Starter',
    price: 'Grátis',
    description: 'Construa sua base e mantenha o ritmo de estudos.',
    features: [
      'Tarefas e Cronograma',
      'Anotações Ilimitadas',
      'Timer Pomodoro Profissional',
      'Gestão de Disciplinas',
      'Gamificação (Missões + Ofensivas)',
      'Acesso ao Blog de Editais',
    ],
    button: 'Começar Agora',
    priceId: null,
    highlight: false,
  },
  {
    name: 'Ultimate',
    price: 'R$ 297',
    period: '/ano',
    economy: 'Economize R$ 181 anualmente',
    description: 'O arsenal completo para quem não quer perder tempo.',
    features: [
      'Tudo do Plano Starter',
      'Facilitador de Editais com IA',
      'Guia de Estudo Personalizado',
      'Flashcards Automáticos (IA)',
      'Resumo de Textos com IA',
      'Ranking Global + Insígnias',
      'Relatórios em PDF',
    ],
    button: 'Assinar com 7 Dias Grátis',
    priceId: 'price_SEU_ID_ANUAL',
    highlight: true,
    badge: 'Melhor Custo-Benefício',
  },
  {
    name: 'Mensal',
    price: 'R$ 39,90',
    period: '/mês',
    description: 'Flexibilidade total para turbinar sua aprovação.',
    features: [
      'Tudo do Plano Starter',
      'Facilitador de Editais com IA',
      'Flashcards Automáticos (IA)',
      'Resumo de Textos com IA',
      'Ranking Global de Elite',
      'Gráficos de Progresso Avançados',
    ],
    button: 'Assinar com 7 Dias Grátis',
    priceId: 'price_SEU_ID_MENSAL',
    highlight: false,
  },
]

export function PricingSection() {
  const router = useRouter()
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  const handleAction = async (priceId: string | null) => {
    if (!priceId) {
      router.push('/register')
      return
    }

    setLoadingPriceId(priceId)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (response.status === 401) {
        router.push('/register')
        return
      }

      const data = await response.json()
      if (data.url) window.location.href = data.url
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoadingPriceId(null)
    }
  }

  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden text-foreground">
      {/* Glow de fundo otimizado */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.03)_0,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl md:text-7xl font-extrabold italic uppercase tracking-tighter leading-tight">
            Alcance seus objetivos{' '}
            <span className="text-primary">
              com um cronograma que se adapta ao seu ritmo com IA
            </span>
          </h2>
          <p className="text-muted-foreground font-bold uppercase italic tracking-[0.2em] text-xs md:text-sm">
            A estrutura profissional que sua aprovação exige.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col p-10 rounded-[2.5rem] border-2 transition-all duration-200 will-change-transform',
                plan.highlight
                  ? 'border-primary bg-card shadow-xl z-20 lg:scale-105'
                  : 'border-border/50 bg-card/80 hover:border-primary/30'
              )}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase px-6 py-2 rounded-full shadow-lg whitespace-nowrap tracking-widest">
                  {plan.badge}
                </div>
              )}

              <div className="mb-10 text-left">
                <div className="flex items-center gap-3 mb-4 text-primary">
                  {plan.name === 'Starter' && <Rocket className="h-7 w-7" />}
                  {plan.name === 'Ultimate' && <Crown className="h-7 w-7" />}
                  {plan.name === 'Mensal' && <Target className="h-7 w-7" />}
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                    {plan.name}
                  </h3>
                </div>

                <div className="flex items-baseline gap-1 text-foreground">
                  <span className="text-5xl md:text-6xl font-black tracking-tighter">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground font-black italic text-lg">
                      {plan.period}
                    </span>
                  )}
                </div>

                {plan.economy && (
                  <div className="mt-2 inline-block bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg">
                    <p className="text-green-500 text-[10px] font-black uppercase italic">
                      {plan.economy}
                    </p>
                  </div>
                )}

                <p className="text-sm text-muted-foreground mt-6 font-bold uppercase italic leading-relaxed opacity-70">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-center gap-4">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" strokeWidth={4} />
                    </div>
                    <span className="text-[11px] md:text-xs font-black uppercase italic text-foreground/80 tracking-tight">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => handleAction(plan.priceId)}
                  disabled={
                    plan.priceId ? loadingPriceId === plan.priceId : false
                  }
                  className={cn(
                    'relative w-full h-20 rounded-2xl font-black italic uppercase text-lg overflow-hidden transition-transform duration-200 active:scale-95 group/btn cursor-pointer!',
                    plan.highlight
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  )}
                >
                  {/* Shimmer Otimizado: sem tag de estilo, usando transição de opacidade/transform via Tailwind */}
                  <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none will-change-transform" />

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {plan.priceId && loadingPriceId === plan.priceId ? (
                      <>
                        <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        PROCESSANDO...
                      </>
                    ) : (
                      plan.button
                    )}
                  </span>
                </Button>

                {plan.name !== 'Starter' && (
                  <p className="text-[10px] text-center font-black text-primary tracking-[0.2em] uppercase">
                    7 DIAS DE TESTE TOTALMENTE GRÁTIS
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Badges de confiança finais */}
        <div className="mt-20 flex flex-wrap justify-center gap-10 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-3 text-[11px] font-black uppercase italic tracking-widest">
            <ShieldCheck className="h-5 w-5 text-primary" /> Pagamento 100%
            Seguro via Stripe
          </div>
          <div className="flex items-center gap-3 text-[11px] font-black uppercase italic tracking-widest">
            <CalendarDays className="h-5 w-5 text-primary" /> Liberação Digital
            Imediata
          </div>
          <div className="flex items-center gap-3 text-[11px] font-black uppercase italic tracking-widest">
            <Zap className="h-5 w-5 text-primary" /> Cancele quando quiser
          </div>
        </div>
      </div>
    </section>
  )
}
