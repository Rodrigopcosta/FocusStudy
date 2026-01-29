"use client"

import { useState } from "react"
import { Check, Zap, ShieldCheck, Trophy, Rocket, Briefcase, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const plans = [
  {
    name: "Starter",
    price: "R$ 0",
    priceId: null, // Plano grátis não precisa de Stripe
    description: "Recursos essenciais para organizar sua rotina de estudos.",
    features: [
      "Ciclo de Estudos Básico", 
      "Até 3 Disciplinas", 
      "Timer de Foco Standard", 
      "Relatórios de Progresso"
    ],
    button: "Começar Grátis",
    highlight: false,
    trial: false,
    icon: <Rocket className="h-5 w-5" />
  },
  {
    name: "Professional",
    price: "R$ 39,90",
    priceId: "price_SEU_ID_MENSAL_AQUI", // <--- COLOQUE O ID DO STRIPE AQUI
    description: "A experiência completa para concurseiros de alto rendimento.",
    features: [
      "Disciplinas Ilimitadas", 
      "Gerador de Resumos com IA", 
      "Sistema de Revisão Espaçada", 
      "Análise de Pontos Fracos", 
      "Ranking Global de Elite"
    ],
    button: "7 Dias Grátis",
    highlight: true,
    trial: true,
    icon: <Briefcase className="h-5 w-5" />
  },
  {
    name: "Ultimate",
    price: "R$ 297",
    priceId: "price_SEU_ID_ANUAL_AQUI", // <--- COLOQUE O ID DO STRIPE AQUI
    description: "O máximo poder de fogo com o melhor custo-benefício anual.",
    features: [
      "Tudo do Plano Professional", 
      "Créditos IA em Dobro", 
      "Cronograma Automatizado", 
      "Suporte Prioritário", 
      "Economia de R$ 181/ano"
    ],
    button: "Assinar Agora",
    highlight: false,
    trial: false,
    badge: "Mais Vantajoso",
    icon: <Crown className="h-5 w-5" />
  }
]

export function PricingSection() {
  const router = useRouter()
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  const handleSubscription = async (priceId: string | null) => {
    if (!priceId) {
      router.push("/register")
      return
    }

    setLoadingPriceId(priceId)
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Erro no checkout:", error)
    } finally {
      setLoadingPriceId(null)
    }
  }

  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            PLANOS DE <span className="text-primary">ALTO NÍVEL</span>
          </h2>
          <p className="text-muted-foreground font-bold uppercase italic tracking-[0.3em] text-[10px] md:text-xs">
            A estrutura profissional que sua aprovação exige.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`group p-10 rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-2.5 ${
                plan.highlight 
                ? "border-primary bg-card shadow-[0_40px_80px_rgba(var(--primary-rgb),0.2)] relative z-20" 
                : "border-border/40 bg-card/40 backdrop-blur-md"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 right-10 bg-green-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-xl">
                  {plan.badge}
                </div>
              )}

              {plan.highlight && (
                <div className="absolute -top-4 left-10 bg-primary text-primary-foreground text-[9px] font-black uppercase px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
                  <Trophy className="h-3 w-3" /> Plano Recomendado
                </div>
              )}

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${plan.highlight ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-secondary text-foreground'}`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                      <span className="text-muted-foreground text-[10px] font-black uppercase italic">
                        {plan.price === "R$ 0" ? "" : plan.name === "Ultimate" ? "/ano" : "/mês"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-bold uppercase italic leading-relaxed min-h-10">
                    {plan.description}
                  </p>
                </div>

                <div className="h-px bg-border/40 w-full" />

                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="mt-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 text-primary" strokeWidth={5} />
                      </div>
                      <span className="font-bold text-foreground/90 italic text-[11px] uppercase tracking-tight">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 space-y-3">
                  <Button 
                    onClick={() => handleSubscription(plan.priceId)}
                    disabled={loadingPriceId === plan.priceId}
                    className={`w-full rounded-full font-black italic uppercase h-16 text-sm transition-all duration-300 ${
                      plan.highlight 
                      ? "bg-primary hover:bg-primary/90 shadow-[0_15px_40px_rgba(var(--primary-rgb),0.3)]" 
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                    }`}
                  >
                    {loadingPriceId === plan.priceId ? "PROCESSANDO..." : plan.button}
                  </Button>
                  {plan.trial && (
                    <p className="text-[9px] text-center font-black uppercase tracking-[0.2em] text-primary animate-pulse">
                      EXPERIMENTE GRÁTIS POR 7 DIAS
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-12 pt-10 border-t border-border/40">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase italic tracking-widest opacity-40">
            <ShieldCheck className="h-5 w-5" /> Transação 100% Protegida
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase italic tracking-widest opacity-40">
            <Zap className="h-5 w-5" /> Liberação Digital Imediata
          </div>
        </div>
      </div>
    </section>
  )
}