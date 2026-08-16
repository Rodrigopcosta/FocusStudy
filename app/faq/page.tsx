'use client'

import * as React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Target,
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Footer } from '@/components/landing/footer'

const faqs = [
  {
    category: 'PLANOS E ACESSO',
    question: 'Quais planos estão disponíveis?',
    answer:
      'O FocusStudy oferece três planos: Gratuito, com acesso às funcionalidades básicas; Mensal, com acesso completo cobrado mensalmente; e Anual, com acesso completo com desconto de 20% em relação ao plano mensal.',
  },
  {
    category: 'PAGAMENTO',
    question: 'Quais as formas de pagamento disponíveis?',
    answer:
      'Aceitamos exclusivamente Cartão de Crédito via Stripe. A renovação é automática ao final de cada período, garantindo a continuidade do seu acesso e do seu histórico de estudos.',
  },
  {
    category: 'INTELIGÊNCIA ARTIFICIAL',
    question: 'O uso da IA é ilimitado no plano pago?',
    answer:
      'Não. Para proteger a plataforma de usos abusivos e garantir a qualidade para todos, aplicamos limites: até 3 gerações de rotina de estudos por mês a partir de editais em PDF, além de créditos mensais para resumos e flashcards. Esses limites são generosos e suficientes para uma rotina intensa de estudos.',
  },
  {
    category: 'METODOLOGIA',
    question: 'Como a IA utiliza meu histórico de 50 tópicos?',
    answer:
      'Nossa IA (OpenAI) utiliza uma janela de contexto dos seus últimos 50 tópicos para entender seu progresso e gerar respostas muito mais precisas e personalizadas. Seus dados são processados via API privada e não são compartilhados para treinamento público.',
  },
  {
    category: 'PÚBLICO-ALVO',
    question: 'O FocusStudy serve para faculdade?',
    answer:
      'Embora a estrutura permita organizar qualquer disciplina, o FocusStudy é otimizado para Concurseiros. Nossas ferramentas de IA, cronogramas e métricas foram desenhadas para quem enfrenta a alta densidade de conteúdos de editais públicos.',
  },
  {
    category: 'CANCELAMENTO',
    question: 'É difícil cancelar a assinatura?',
    answer:
      'Absolutamente não. Você tem total autonomia para cancelar a renovação com um clique no painel de Configurações. Sem chamados, sem e-mails, sem burocracia. Seu acesso continua até o fim do período já pago.',
  },
  {
    category: 'SEGURANÇA',
    question: 'Meus dados estão protegidos?',
    answer:
      'Sim. Utilizamos criptografia AES-256 e Row Level Security (RLS) via Supabase. Suas anotações são privadas: nem a nossa equipe, nem terceiros têm acesso ao conteúdo que você estuda.',
  },
]

export default function FAQPage() {
  const supabase = createClient()
  const [backHref, setBackHref] = React.useState('/')

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) setBackHref('/dashboard')
      } catch (error) {
        console.error('Erro na FAQ:', error)
      }
    }
    checkUser()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/30">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={backHref}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-3 transition-transform">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-black text-xl tracking-tighter italic uppercase">
              FocusStudy
            </span>
          </Link>
          <Button
            variant="ghost"
            asChild
            className="font-bold uppercase italic text-xs tracking-widest cursor-pointer hover:bg-primary/10"
          >
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-primary/5 border-b border-primary/10 py-16 md:py-24 text-center">
          <div className="container mx-auto px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Planos Gratuito, Mensal e Anual
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-6">
              Dúvidas <span className="text-primary">Frequentes</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-sm md:text-base leading-relaxed">
              Transparência sobre nossos planos, uso de IA e segurança. Comece
              gratuitamente e evolua para o plano Pro quando estiver pronto para
              ir além.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 max-w-4xl">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/40 bg-card/50 rounded-2xl md:rounded-3xl px-6 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-6 cursor-pointer group">
                  <div className="flex flex-col items-start text-left gap-1">
                    <span className="text-[9px] font-black text-primary tracking-[0.2em] uppercase group-hover:text-primary/80 transition-colors">
                      {faq.category}
                    </span>
                    <span className="font-bold text-sm md:text-base uppercase italic tracking-tight">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed text-sm md:text-base italic">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-4xl bg-secondary/30 border border-border/40 flex flex-col items-center text-center group">
              <MessageCircle className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-black uppercase italic text-lg mb-2">
                Apoio ao Aluno
              </h3>
              <p className="text-xs text-muted-foreground mb-6 uppercase font-bold tracking-wider italic">
                Suporte direto via e-mail
              </p>
              <a
                href="mailto:contato@focusstudy.com.br"
                className="text-primary font-black italic uppercase tracking-tighter text-lg hover:underline cursor-pointer"
              >
                contato@focusstudy.com.br
              </a>
            </div>

            <div className="p-8 rounded-4xl bg-primary/10 border border-primary/20 flex flex-col items-center text-center group">
              <Sparkles className="h-10 w-10 text-primary mb-4 group-hover:rotate-12 transition-transform" />
              <h3 className="font-black uppercase italic text-lg mb-2">
                Acesso Premium
              </h3>
              <p className="text-xs text-muted-foreground mb-6 uppercase font-bold tracking-wider italic">
                Libere seu acesso agora
              </p>
              <Button
                asChild
                className="w-full font-black uppercase italic tracking-widest py-6 rounded-xl cursor-pointer shadow-lg shadow-primary/20"
              >
                <Link href="/register">Criar Conta Grátis</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
