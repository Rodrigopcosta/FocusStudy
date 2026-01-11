import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Politica de Privacidade",
  description: "Politica de privacidade do FocusStudy - Planejador de Estudos",
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
        <h1 className="text-3xl font-bold mb-8">Politica de Privacidade</h1>
        <p className="text-muted-foreground mb-6">Ultima atualizacao: Janeiro de 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Introducao</h2>
            <p className="text-muted-foreground">
              O FocusStudy respeita sua privacidade e esta comprometido em proteger seus dados pessoais. Esta politica
              de privacidade explica como coletamos, usamos e protegemos suas informacoes quando voce usa nosso servico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Dados que Coletamos</h2>
            <p className="text-muted-foreground mb-2">Coletamos os seguintes tipos de informacoes:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                <strong>Dados de cadastro:</strong> nome, email, data de nascimento, genero
              </li>
              <li>
                <strong>Dados de uso:</strong> tarefas, notas, sessoes de pomodoro, estatisticas de estudo
              </li>
              <li>
                <strong>Dados tecnicos:</strong> endereco IP, tipo de navegador, dispositivo utilizado
              </li>
              <li>
                <strong>Cookies:</strong> para melhorar sua experiencia e manter sua sessao ativa
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Como Usamos seus Dados</h2>
            <p className="text-muted-foreground mb-2">Utilizamos suas informacoes para:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Fornecer e manter o servico FocusStudy</li>
              <li>Personalizar sua experiencia de usuario</li>
              <li>Enviar comunicacoes importantes sobre o servico</li>
              <li>Melhorar e desenvolver novos recursos</li>
              <li>Garantir a seguranca do servico</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground">
              Nao vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing. Podemos
              compartilhar dados com provedores de servicos que nos auxiliam na operacao do FocusStudy, sempre sob
              obrigacoes de confidencialidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Seguranca dos Dados</h2>
            <p className="text-muted-foreground">
              Implementamos medidas de seguranca tecnicas e organizacionais para proteger seus dados, incluindo
              criptografia SSL/TLS, armazenamento seguro em servidores protegidos e controle de acesso restrito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Seus Direitos</h2>
            <p className="text-muted-foreground mb-2">
              De acordo com a Lei Geral de Protecao de Dados (LGPD), voce tem direito a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusao de seus dados</li>
              <li>Revogar o consentimento para tratamento de dados</li>
              <li>Portabilidade dos dados para outro servico</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-muted-foreground">
              Utilizamos cookies essenciais para o funcionamento do servico e cookies de preferencias para lembrar suas
              configuracoes. Voce pode gerenciar suas preferencias de cookies atraves das configuracoes do seu
              navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Retencao de Dados</h2>
            <p className="text-muted-foreground">
              Mantemos seus dados enquanto sua conta estiver ativa. Apos a exclusao da conta, seus dados serao removidos
              em ate 30 dias, exceto quando houver obrigacao legal de retencao.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Menores de Idade</h2>
            <p className="text-muted-foreground">
              O FocusStudy nao e destinado a menores de 13 anos. Se tomarmos conhecimento de que coletamos dados de uma
              crianca menor de 13 anos, tomaremos medidas para excluir essas informacoes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Alteracoes nesta Politica</h2>
            <p className="text-muted-foreground">
              Podemos atualizar esta politica periodicamente. Notificaremos sobre mudancas significativas por email ou
              atraves de um aviso em nosso servico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Contato</h2>
            <p className="text-muted-foreground">
              Para exercer seus direitos ou esclarecer duvidas sobre esta politica, entre em contato pelo email:
              privacidade@focusstudy.com.br
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
