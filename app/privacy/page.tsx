import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade do FocusStudy - Planejador de Estudos",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">FocusStudy</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-6">Última atualização: Janeiro de 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Introdução</h2>
            <p className="text-muted-foreground">
              O FocusStudy respeita sua privacidade e está comprometido em proteger seus dados pessoais. Esta política
              de privacidade explica como coletamos, usamos e protegemos suas informações quando você usa nosso serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Dados que Coletamos</h2>
            <p className="text-muted-foreground mb-2">Coletamos os seguintes tipos de informações:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                <strong>Dados de cadastro:</strong> nome, e-mail, data de nascimento, gênero
              </li>
              <li>
                <strong>Dados de uso:</strong> tarefas, notas, sessões de Pomodoro, estatísticas de estudo
              </li>
              <li>
                <strong>Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo utilizado
              </li>
              <li>
                <strong>Cookies:</strong> para melhorar sua experiência e manter sua sessão ativa
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Como Usamos seus Dados</h2>
            <p className="text-muted-foreground mb-2">Utilizamos suas informações para:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Fornecer e manter o serviço FocusStudy</li>
              <li>Personalizar sua experiência de usuário</li>
              <li>Enviar comunicações importantes sobre o serviço</li>
              <li>Melhorar e desenvolver novos recursos</li>
              <li>Garantir a segurança do serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground">
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing. Podemos
              compartilhar dados com provedores de serviços que nos auxiliam na operação do FocusStudy, sempre sob
              obrigações de confidencialidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Segurança dos Dados</h2>
            <p className="text-muted-foreground">
              Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, incluindo
              criptografia SSL/TLS, armazenamento seguro em servidores protegidos e controle de acesso restrito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Seus Direitos</h2>
            <p className="text-muted-foreground mb-2">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar o consentimento para tratamento de dados</li>
              <li>Portabilidade dos dados para outro serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-muted-foreground">
              Utilizamos cookies essenciais para o funcionamento do serviço e cookies de preferências para lembrar suas
              configurações. Você pode gerenciar suas preferências de cookies através das configurações do seu
              navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Retenção de Dados</h2>
            <p className="text-muted-foreground">
              Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da conta, seus dados serão removidos
              em até 30 dias, exceto quando houver obrigação legal de retenção.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Menores de Idade</h2>
            <p className="text-muted-foreground">
              O FocusStudy não é destinado a menores de 13 anos. Se tomarmos conhecimento de que coletamos dados de uma
              criança menor de 13 anos, tomaremos medidas para excluir essas informações.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Alterações nesta Política</h2>
            <p className="text-muted-foreground">
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas por e-mail ou
              através de um aviso em nosso serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Contato</h2>
            <p className="text-muted-foreground">
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato pelo e-mail:
              privacidade@focusstudy.com.br
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
