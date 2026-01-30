'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Target, ArrowLeft, Lock, Fingerprint, EyeOff } from 'lucide-react'

export default function PrivacyPage() {
  const lastUpdate = '25 de Janeiro de 2026'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
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
            className="font-bold uppercase italic text-xs tracking-widest"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12 border-b border-border/40 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Lock className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Conformidade LGPD
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              Política de <span className="text-primary">Privacidade</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-bold uppercase italic text-[8px] md:text-[10px] tracking-[0.2em]">
            Última atualização: {lastUpdate}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 md:space-y-12">
          <section className="bg-card/50 p-6 md:p-8 rounded-4xl md:rounded-4xl border border-border/40">
            <h2 className="text-lg md:text-xl font-black uppercase italic mb-4 flex items-center gap-2">
              <Fingerprint className="text-primary h-5 w-5" /> 1. Compromisso
              com a Transparência
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              O <strong>FocusStudy</strong> (doravante "Plataforma") entende que
              seus dados de estudo são parte da sua propriedade intelectual e
              privacidade. Esta Política detalha como tratamos suas informações
              em estrita observância à Lei Geral de Proteção de Dados (Lei nº
              13.709/18).
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic border-l-4 border-primary pl-4">
              2. Coleta de Dados e Finalidade
            </h2>
            <div className="grid gap-6">
              <div className="space-y-2">
                <h3 className="font-bold text-foreground uppercase italic text-sm">
                  2.1. Dados de Identificação
                </h3>
                <p className="text-muted-foreground text-sm italic">
                  E-mail e informações de perfil técnico para criação de conta e
                  autenticação via Supabase Auth.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-foreground uppercase italic text-sm">
                  2.2. Dados de Pagamento (Stripe)
                </h3>
                <p className="text-muted-foreground text-sm italic">
                  O FocusStudy <strong>não armazena</strong> dados de cartão de
                  crédito em seus servidores. Todas as transações são
                  processadas pelo Stripe, que possui certificação PCI-DSS Nível
                  1. Coletamos apenas o status do pagamento para liberação dos
                  recursos Premium.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-foreground uppercase italic text-sm">
                  2.3. Conteúdo de Estudo e IA
                </h3>
                <p className="text-muted-foreground text-sm italic">
                  Suas notas e cronogramas são processados para gerar resumos
                  via Inteligência Artificial. Estes dados são utilizados apenas
                  para a prestação do serviço contratado e não são
                  compartilhados para treinamento de modelos públicos de
                  terceiros.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic border-l-4 border-primary pl-4">
              3. Compartilhamento com Terceiros
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Seus dados são compartilhados estritamente com parceiros
              operacionais necessários para o funcionamento do SaaS:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-xs font-bold uppercase italic space-y-2 tracking-wide">
              <li>
                <span className="text-primary">Stripe:</span> Processamento de
                pagamentos e assinaturas.
              </li>
              <li>
                <span className="text-primary">Supabase:</span> Armazenamento de
                banco de dados e autenticação.
              </li>
              <li>
                <span className="text-primary">Vercel:</span> Hospedagem da
                infraestrutura da plataforma.
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic border-l-4 border-primary pl-4">
              4. Seus Direitos (Art. 18 LGPD)
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Você possui controle total sobre seus dados. A qualquer momento,
              através do seu painel ou suporte, você pode solicitar:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/40 text-[10px] font-black uppercase italic tracking-widest text-center">
                Acesso e Correção
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/40 text-[10px] font-black uppercase italic tracking-widest text-center">
                Exclusão Definitiva
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/40 text-[10px] font-black uppercase italic tracking-widest text-center">
                Revogação de Consentimento
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/40 text-[10px] font-black uppercase italic tracking-widest text-center">
                Portabilidade dos Dados
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic border-l-4 border-primary pl-4">
              5. Segurança e Criptografia
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Utilizamos criptografia <strong>AES-256</strong> em repouso e{' '}
              <strong>TLS 1.3</strong> em trânsito. O acesso ao banco de dados é
              restrito via RLS (Row Level Security) do Supabase, garantindo que
              nenhum usuário consiga acessar dados de outros.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic border-l-4 border-primary pl-4">
              6. Retenção de Dados
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Dados de usuários inativos (sem login por mais de 24 meses) podem
              ser anonimizados ou excluídos. Em caso de cancelamento da
              assinatura, seus dados permanecem salvos por 60 dias para permitir
              a reativação antes da exclusão permanente.
            </p>
          </section>

          <section className="bg-primary/5 p-8 rounded-4xl md:rounded-4xl border border-primary/20 text-center">
            <h2 className="text-lg md:text-xl font-black uppercase italic mb-4 flex items-center justify-center gap-2">
              <EyeOff className="text-primary h-5 w-5" /> Encarregado de Dados
              (DPO)
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
              Para qualquer requisição de privacidade, nossa equipe está pronta
              para atender dentro dos prazos legais.
            </p>
            <p className="text-primary font-black italic uppercase tracking-tighter text-xl md:text-2xl break-all">
              privacidade@focusstudy.com.br
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
