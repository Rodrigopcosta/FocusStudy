'use client' // Essencial para resolver o erro 'client-only' e permitir styled-jsx

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Target, ArrowLeft, ShieldCheck, Scale } from 'lucide-react'
import { Footer } from '@/components/landing/footer'

export default function TermsPage() {
  const lastUpdate = '25 de Janeiro de 2026'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-3 transition-transform">
              <Target className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
            </div>
            <span className="font-black text-lg md:text-xl tracking-tighter italic uppercase">
              FocusStudy
            </span>
          </Link>
          <Button
            variant="ghost"
            asChild
            className="font-bold uppercase italic text-[10px] md:text-xs tracking-widest h-9 md:h-10"
          >
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12 border-b border-border/40 pb-6 md:pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3 md:mb-4">
              <Scale className="h-3 w-3 text-primary" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary">
                Documento Jurídico
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              Termos de <span className="text-primary">Uso</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-bold uppercase italic text-[8px] md:text-[10px] tracking-[0.2em]">
            Última atualização: {lastUpdate}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 md:space-y-12">
          <section className="bg-card/50 p-6 md:p-8 rounded-3xl md:rounded-4xl border border-border/40">
            <h2 className="text-lg md:text-xl font-black uppercase italic mb-3 md:mb-4 flex items-center gap-2">
              <ShieldCheck className="text-primary h-4 w-4 md:h-5 md:w-5" /> 1.
              Aceitação do Contrato
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed italic">
              Ao criar uma conta no <strong>FocusStudy</strong>, você celebra um
              contrato vinculativo com a plataforma. O uso dos serviços, sejam
              eles gratuitos ou pagos, implica na aceitação plena e sem reservas
              de todas as cláusulas aqui expostas. Caso discorde de qualquer
              ponto, a interrupção do uso é obrigatória.
            </p>
          </section>

          <section className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic border-l-4 border-primary pl-3 md:pl-4">
              2. Planos, Pagamentos e Renovação
            </h2>
            <div className="grid gap-4 md:gap-6">
              <div className="space-y-1">
                <h3 className="font-bold text-foreground uppercase italic text-[11px] md:text-sm">
                  2.1. Natureza da Assinatura
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm italic leading-relaxed">
                  O FocusStudy opera sob o modelo de{' '}
                  <strong>SaaS (Software as a Service)</strong> por assinatura.
                  O acesso aos planos Professional e Ultimate é concedido
                  mediante pagamento antecipado e recorrente.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground uppercase italic text-[11px] md:text-sm">
                  2.2. Renovação Automática
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm italic leading-relaxed">
                  Para sua conveniência, as assinaturas são renovadas
                  automaticamente ao final de cada período (mensal ou anual),
                  utilizando o mesmo método de pagamento, a menos que o
                  cancelamento seja solicitado pelo usuário através do painel de
                  configurações.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground uppercase italic text-[11px] md:text-sm">
                  2.3. Direito de Arrependimento
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm italic leading-relaxed">
                  Em conformidade com o Art. 49 do Código de Defesa do
                  Consumidor (CDC), o usuário possui o prazo de{' '}
                  <strong>7 (sete) dias</strong> após a primeira contratação
                  para solicitar o estorno integral dos valores pagos, sem
                  necessidade de justificativa.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic border-l-4 border-primary pl-3 md:pl-4">
              3. Teste Gratuito (Trial)
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed italic">
              O plano <strong>Professional</strong> pode oferecer um período de
              teste de 7 dias. Durante este período, o usuário terá acesso às
              funcionalidades premium. Caso o cancelamento não ocorra antes do
              término do 7º dia, a cobrança do plano mensal será processada
              automaticamente. É de inteira responsabilidade do usuário
              gerenciar o prazo do trial.
            </p>
          </section>

          <section className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic border-l-4 border-primary pl-3 md:pl-4">
              4. Inteligência Artificial e Limitações
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed italic">
              O FocusStudy utiliza algoritmos de IA para gerar resumos e ciclos
              de estudo. Embora busquemos a máxima precisão, não garantimos a
              infalibilidade dos conteúdos gerados. A plataforma é uma{' '}
              <strong>ferramenta de meio</strong>, e não de fim: a aprovação em
              concursos depende exclusivamente do desempenho individual do
              aluno.
            </p>
          </section>

          <section className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic border-l-4 border-primary pl-3 md:pl-4">
              5. Propriedade Intelectual
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed italic">
              Todo o código, design, marcas e metodologias presentes no
              FocusStudy são de propriedade exclusiva da plataforma. A
              engenharia reversa, cópia ou exploração comercial não autorizada
              do software resultará em sanções civis e criminais.
            </p>
          </section>

          <section className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic border-l-4 border-primary pl-3 md:pl-4">
              6. Limitação de Responsabilidade
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed italic bg-secondary/30 p-4 md:p-6 rounded-2xl md:rounded-3xl">
              Em nenhuma hipótese o FocusStudy será responsável por lucros
              cessantes, perda de dados ou a não aprovação do usuário em exames
              e concursos públicos. A plataforma é fornecida "como está",
              sujeita a manutenções preventivas e atualizações.
            </p>
          </section>

          <section className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic border-l-4 border-primary pl-3 md:pl-4">
              7. Foro e Legislação
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed italic">
              Estes termos são regidos pelas leis da República Federativa do
              Brasil. Fica eleito o Foro da Comarca do usuário para dirimir
              quaisquer controvérsias oriundas deste contrato, em observância ao
              Código de Defesa do Consumidor.
            </p>
          </section>

          <footer className="pt-8 md:pt-12 mt-8 md:mt-12 border-t border-border/40 text-center space-y-3">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
              Dúvidas Jurídicas? Entre em contato:
            </p>
            <p className="text-primary font-black italic uppercase tracking-tighter text-lg md:text-xl">
              legal@focusstudy.com.br
            </p>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  )
}
