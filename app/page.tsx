'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { PricingSection } from '@/components/landing/pricing-section'
import {
  ArrowRight,
  Sun,
  Moon,
  BrainCircuit,
  Target,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Focus,
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          router.replace('/dashboard')
        } else {
          setLoading(false)
        }
      } catch (error) {
        setLoading(false)
      }
    }
    checkUser()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-2xl shadow-primary/20"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 transition-colors duration-500 overflow-x-hidden">
      {/* HEADER */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
              <Target className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <span className="font-black text-xl md:text-2xl tracking-tighter italic uppercase">
              FocusStudy
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full hover:bg-primary/10"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button
              variant="ghost"
              asChild
              className="hidden sm:inline-flex font-black uppercase italic text-xs tracking-widest"
            >
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              asChild
              className="shadow-xl shadow-primary/20 font-black uppercase italic text-[10px] md:text-xs rounded-full px-5 md:px-8 h-10 md:h-11 border-2 border-primary/20"
            >
              <Link href="/register">Cadastre-se</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-16 md:pt-40 md:pb-32 overflow-hidden text-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center space-y-8 md:space-y-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-md">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary">
                  Sua aprovação é a nossa meta
                </span>
              </div>

              <div className="space-y-4 md:space-y-6">
                <h1 className="text-4xl sm:text-6xl md:text-[120px] font-black leading-[0.9] tracking-[-0.04em] md:tracking-[-0.06em] uppercase italic">
                  FOCO TOTAL
                  <br />
                  <span className="text-transparent stroke-text">
                    RESULTADO REAL.
                  </span>
                </h1>

                <p className="text-muted-foreground text-base md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed italic px-4">
                  A plataforma definitiva que blinda sua concentração enquanto
                  você domina o edital. O método de elite feito para o{' '}
                  <span className="text-foreground font-bold underline decoration-primary underline-offset-4">
                    máximo desempenho.
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-none justify-center pt-4 px-6 sm:px-0">
                <Button
                  size="lg"
                  asChild
                  className="h-16 md:h-20 px-8 md:px-12 rounded-full font-black uppercase italic text-base md:text-lg bg-primary hover:scale-105 transition-all shadow-[0_20px_60px_rgba(var(--primary-rgb),0.35)]"
                >
                  <Link href="/register" className="flex items-center gap-3">
                    Garantir minha vaga
                    <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-16 md:h-20 px-8 md:px-12 rounded-full font-black uppercase italic text-base md:text-lg border-2 hover:bg-secondary/50 backdrop-blur-sm"
                >
                  <Link href="#pricing">Conhecer o Método</Link>
                </Button>
              </div>

              {/* Trust Section */}
              <div className="pt-12 md:pt-16 flex flex-wrap justify-center gap-x-8 gap-y-6 md:gap-x-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 px-4">
                <div className="flex items-center gap-2 font-black italic uppercase text-[9px] md:text-[10px] tracking-widest">
                  <BrainCircuit className="h-4 w-4 md:h-5 md:w-5" />{' '}
                  Inteligência
                </div>
                <div className="flex items-center gap-2 font-black italic uppercase text-[9px] md:text-[10px] tracking-widest">
                  <Focus className="h-4 w-4 md:h-5 md:w-5" /> Foco
                </div>
                <div className="flex items-center gap-2 font-black italic uppercase text-[9px] md:text-[10px] tracking-widest">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5" /> Evolução
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-16 md:py-24 bg-secondary/20 border-y border-border/40 relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              <FeatureCard
                icon={TrendingUp}
                title="Consistência Pura"
                description="Monitore seu rendimento com análises precisas. Saiba exatamente onde focar para aumentar sua pontuação."
              />
              <FeatureCard
                icon={Focus}
                title="Alta Performance"
                description="Elimine distrações com ferramentas desenhadas para manter você em estado de flow por mais tempo."
              />
              <FeatureCard
                icon={CheckCircle2}
                title="Domínio do Edital"
                description="Checklist inteligente para você visualizar sua evolução e sentir a segurança de estar cobrindo tudo."
              />
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <div id="pricing" className="relative scroll-mt-20 md:scroll-mt-24">
          <PricingSection />
        </div>

        {/* FINAL CTA */}
        <section className="py-20 md:py-32 container mx-auto px-4">
          <div className="bg-primary p-10 md:p-24 rounded-[2.5rem] md:rounded-[3.5rem] text-primary-foreground text-center space-y-6 md:space-y-8 relative overflow-hidden shadow-3xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 blur-[80px] md:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <h2 className="text-3xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.95] relative z-10">
              A PROVA NÃO <br /> ESPERA POR VOCÊ.
            </h2>
            <p className="text-primary-foreground/80 font-bold uppercase italic tracking-widest text-[10px] md:text-sm relative z-10">
              Escolha a ferramenta que os aprovados utilizam.
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="h-14 md:h-16 px-8 md:px-12 rounded-full font-black uppercase italic text-base md:text-lg hover:scale-105 transition-transform relative z-10 shadow-2xl w-full sm:w-auto"
            >
              <Link href="/register">Começar agora</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/50 bg-card/50 py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2 font-black italic text-xl md:text-2xl uppercase tracking-tighter">
              <Target className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              FocusStudy
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">
              O seu foco é o nosso compromisso.
            </p>
          </div>

          <div className="flex gap-6 md:gap-10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-muted-foreground/60">
            <Link
              href="/faq"
              className="hover:text-primary transition-colors italic cursor-pointer"
            >
              FAQ
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors italic cursor-pointer"
            >
              Termos
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors italic cursor-pointer"
            >
              Privacidade
            </Link>
            <Link
              href="#"
              className="hover:text-primary transition-colors italic cursor-pointer"
            >
              Suporte
            </Link>
          </div>

          <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
            © 2026 FOCUSSTUDY // ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) {
  return (
    <div className="group p-8 md:p-10 rounded-4xl md:rounded-[2.5rem] bg-card border border-border/50 hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5">
      <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
        <Icon className="h-6 w-6 md:h-8 md:w-8 text-primary group-hover:text-primary-foreground" />
      </div>
      <h3 className="text-lg md:text-xl font-black uppercase italic mb-3 md:mb-4 tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed italic">
        {description}
      </p>
    </div>
  )
}
