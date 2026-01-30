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
    <section className="py-20 md:py-32 px-4 bg-background relative overflow-hidden text-foreground">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.03)_0,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24 space-y-6">
          <h2 className="text-4xl sm:text-5xl min-[1150px]:text-7xl font-extrabold italic uppercase tracking-tighter leading-[0.9] min-[1150px]:leading-tight">
            Estude com <br className="min-[1150px]:hidden" />
            <span className="text-primary italic">Inteligência</span> e{' '}
            <br className="min-[1150px]:hidden" />
            Vença o Edital
          </h2>
          <p className="text-muted-foreground font-bold uppercase italic tracking-[0.15em] text-[10px] md:text-sm max-w-lg mx-auto px-4">
            A estrutura de elite que sua aprovação exige,{' '}
            <br className="hidden min-[1150px]:block" /> adaptada ao seu ritmo
            com IA.
          </p>
        </div>

        {/* CORREÇÃO CHAVE: 1 coluna como padrão. 
          3 colunas apenas acima de 1150px para evitar o aperto que você mostrou na foto (1052px).
        */}
        <div className="grid grid-cols-1 min-[1150px]:grid-cols-3 gap-8 items-stretch max-w-md min-[1150px]:max-w-none mx-auto">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col p-8 min-[1150px]:p-10 rounded-[2.5rem] border-2 transition-all duration-200 bg-card items-center text-center',
                plan.highlight
                  ? 'border-primary shadow-2xl z-20 min-[1150px]:scale-105'
                  : 'border-border/50 bg-card/80 hover:border-primary/30'
              )}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase px-6 py-2 rounded-full shadow-lg whitespace-nowrap tracking-widest z-30">
                  {plan.badge}
                </div>
              )}

              <div className="mb-8 w-full flex flex-col items-center">
                <div className="flex items-center justify-center gap-3 mb-4 text-primary">
                  {plan.name === 'Starter' && <Rocket className="h-7 w-7" />}
                  {plan.name === 'Ultimate' && <Crown className="h-7 w-7" />}
                  {plan.name === 'Mensal' && <Target className="h-7 w-7" />}
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                    {plan.name}
                  </h3>
                </div>

                {/* Preço com whitespace-nowrap para não separar R$ do valor */}
                <div className="flex items-baseline justify-center gap-1 text-foreground">
                  <span className="text-5xl min-[1150px]:text-6xl font-black tracking-tighter whitespace-nowrap">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground font-black italic text-lg lg:text-xl">
                      {plan.period}
                    </span>
                  )}
                </div>

                {plan.economy && (
                  <div className="mt-3 inline-block bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg">
                    <p className="text-green-500 text-[10px] font-black uppercase italic">
                      {plan.economy}
                    </p>
                  </div>
                )}

                <p className="text-sm text-muted-foreground mt-6 font-bold uppercase italic leading-relaxed opacity-70 max-w-70">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1 w-full">
                {plan.features.map(feature => (
                  <div
                    key={feature}
                    className="flex items-center gap-4 justify-start max-w-70 mx-auto"
                  >
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" strokeWidth={4} />
                    </div>
                    <span className="text-[11px] font-black uppercase italic text-foreground/80 tracking-tight text-left">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 w-full">
                <Button
                  onClick={() => handleAction(plan.priceId)}
                  disabled={
                    plan.priceId ? loadingPriceId === plan.priceId : false
                  }
                  className={cn(
                    'relative w-full h-16 min-[1150px]:h-20 rounded-2xl font-black italic uppercase overflow-hidden transition-all duration-200 active:scale-95 group/btn cursor-pointer',
                    /* Fonte dinâmica para nunca vazar do botão */
                    'text-[clamp(12px,4vw,18px)] min-[1150px]:text-lg px-2',
                    plan.highlight
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  )}
                >
                  <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                  <span className="relative z-10 flex items-center justify-center gap-2 text-center leading-tight">
                    {plan.priceId && loadingPriceId === plan.priceId ? (
                      <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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

        {/* Badges de confiança */}
        <div className="mt-24 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 opacity-50 px-4 text-center">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase italic tracking-widest">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" /> Pagamento
            Seguro via Stripe
          </div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase italic tracking-widest">
            <CalendarDays className="h-4 w-4 text-primary shrink-0" /> Liberação
            Imediata
          </div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase italic tracking-widest">
            <Zap className="h-4 w-4 text-primary shrink-0" /> Cancele quando
            quiser
          </div>
        </div>
      </div>
    </section>
  )
}
