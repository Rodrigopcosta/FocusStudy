"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  BookOpen,
  CheckSquare,
  Timer,
  BarChart3,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Shield,
  FileText,
  Sun,
  Moon,
} from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          router.replace("/dashboard")
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">FocusStudy</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" asChild>
                <Link href="/faq">FAQ</Link>
              </Button>
            </nav>

            <div className="h-6 w-px bg-border hidden md:block" />

            {/* Alternador de Tema */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Alternar tema</span>
            </Button>

            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="shadow-md shadow-primary/10">
              <Link href="/register">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Organize seus estudos de forma inteligente
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance max-w-4xl mx-auto mb-6 text-foreground">
              Sua aprovação começa com <span className="text-primary">organização</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
              Planeje seus estudos, faça anotações estruturadas e use a técnica Pomodoro para maximizar seu foco e
              produtividade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2 h-12 px-8 text-base shadow-xl shadow-primary/20">
                <Link href="/register">
                  Começar Gratuitamente
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link href="/login">Já tenho uma conta</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground">Tudo que você precisa para estudar melhor</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Ferramentas pensadas para concurseiros e estudantes que buscam organização e foco.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={CheckSquare}
                title="Gerenciador de Tarefas"
                description="Organize suas tarefas por disciplina, prioridade e prazo. Nunca mais perca um prazo importante."
              />
              <FeatureCard
                icon={BookOpen}
                title="Notas Estruturadas"
                description="Crie anotações com Markdown, vincule a disciplinas e encontre tudo rapidamente."
              />
              <FeatureCard
                icon={Timer}
                title="Timer Pomodoro"
                description="Estude com foco usando a técnica Pomodoro. Escolha entre modos 25/5 ou 50/10."
              />
              <FeatureCard
                icon={BarChart3}
                title="Dashboard de Progresso"
                description="Acompanhe suas horas de estudo, tarefas concluídas e mantenha sua sequência."
              />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Pronto para transformar seus estudos?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Junte-se a milhares de estudantes que já estão usando o FocusStudy para alcançar seus objetivos.
            </p>
            <Button size="lg" asChild className="h-12 px-10 shadow-lg shadow-primary/20">
              <Link href="/register">Criar Conta Gratuita</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">FocusStudy</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs text-center md:text-left">
                A plataforma definitiva para quem leva a sério o sonho da aprovação.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
              <Link href="/faq" className="hover:text-primary transition-colors flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Termos
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacidade
              </Link>
            </div>

            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>© 2026 FocusStudy.</p>
              <p>Feito para quem foca no topo.</p>
            </div>
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
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="group bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
      </div>
      <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}