'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
// Tentei usar o helper antigo, mas se der erro, use o pacote básico:
import { createClient } from "@supabase/supabase-js" 
import { Button } from "@/components/ui/button"
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
} from "lucide-react"

// Se você tiver um arquivo lib/supabase.ts, pode importar de lá. 
// Caso contrário, usamos variáveis de ambiente aqui para o cliente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function LandingPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)

  // Verifica se o usuário já está logado para redirecionar ao Dashboard
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
        console.error("Erro ao verificar sessão:", error)
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  // Enquanto verifica a sessão, mostramos uma tela limpa ou um loader leve
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">FocusStudy</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/faq">FAQ</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Organize seus estudos de forma inteligente
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance max-w-4xl mx-auto mb-6">
            Sua aprovação começa com <span className="text-primary">organização</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Planeje seus estudos, faça anotações estruturadas e use a técnica Pomodoro para maximizar seu foco e
            produtividade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/register">
                Começar Gratuitamente
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Já tenho uma conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Tudo que você precisa para estudar melhor</h2>
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para transformar seus estudos?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Junte-se a milhares de estudantes que já estão usando o FocusStudy para alcançar seus objetivos.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Criar Conta Gratuita</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">FocusStudy</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link href="/faq" className="hover:text-foreground flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Link>
              <Link href="/terms" className="hover:text-foreground flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Termos de Uso
              </Link>
              <Link href="/privacy" className="hover:text-foreground flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Política de Privacidade
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">2026 FocusStudy. Todos os direitos reservados.</p>
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
    <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}