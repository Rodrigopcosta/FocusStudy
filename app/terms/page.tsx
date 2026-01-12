import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Termos de Uso",
  description: "Termos de uso do FocusStudy - Planejador de Estudos",
}

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>
        <p className="text-muted-foreground mb-6">Última atualização: Janeiro de 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground">
              Ao acessar e usar o FocusStudy, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você
              não concordar com qualquer parte destes termos, não poderá acessar o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground">
              O FocusStudy é uma plataforma de organização de estudos que oferece ferramentas para gerenciamento de
              tarefas, anotações, timer Pomodoro e acompanhamento de progresso. O serviço é destinado a estudantes e
              pessoas que desejam melhorar sua produtividade nos estudos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Cadastro e Conta</h2>
            <p className="text-muted-foreground">
              Para utilizar o FocusStudy, você deve criar uma conta fornecendo informações precisas e completas. Você é
              responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua
              conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Uso Aceitável</h2>
            <p className="text-muted-foreground mb-2">Você concorda em não:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Usar o serviço para fins ilegais ou não autorizados</li>
              <li>Violar quaisquer leis locais, estaduais, nacionais ou internacionais</li>
              <li>Transmitir vírus ou código malicioso</li>
              <li>Coletar informações de outros usuários sem autorização</li>
              <li>Interferir ou interromper o serviço ou servidores</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Propriedade Intelectual</h2>
            <p className="text-muted-foreground">
              Todo o conteúdo do FocusStudy, incluindo textos, gráficos, logos, ícones e software, é propriedade do
              FocusStudy ou de seus licenciadores e está protegido por leis de direitos autorais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Conteúdo do Usuário</h2>
            <p className="text-muted-foreground">
              Você mantém a propriedade de todo o conteúdo que criar no FocusStudy (tarefas, notas, etc.). Ao usar nosso
              serviço, você nos concede uma licença limitada para armazenar e processar seu conteúdo com o único
              propósito de fornecer o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground">
              O FocusStudy é fornecido "como está", sem garantias de qualquer tipo. Não nos responsabilizamos por
              quaisquer danos diretos, indiretos, incidentais ou consequentes decorrentes do uso do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Modificações dos Termos</h2>
            <p className="text-muted-foreground">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão
              comunicadas por e-mail ou através do serviço. O uso continuado após as modificações constitui aceitação dos
              novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Rescisão</h2>
            <p className="text-muted-foreground">
              Podemos encerrar ou suspender sua conta e acesso ao serviço a qualquer momento, sem aviso prévio, por
              violação destes termos ou por qualquer outro motivo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Contato</h2>
            <p className="text-muted-foreground">
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail:
              contato@focusstudy.com.br
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
