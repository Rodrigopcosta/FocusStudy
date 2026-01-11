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
        <p className="text-muted-foreground mb-6">Ultima atualizacao: Janeiro de 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Aceitacao dos Termos</h2>
            <p className="text-muted-foreground">
              Ao acessar e usar o FocusStudy, voce concorda em cumprir e estar vinculado a estes Termos de Uso. Se voce
              nao concordar com qualquer parte destes termos, nao podera acessar o servico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Descricao do Servico</h2>
            <p className="text-muted-foreground">
              O FocusStudy e uma plataforma de organizacao de estudos que oferece ferramentas para gerenciamento de
              tarefas, anotacoes, timer Pomodoro e acompanhamento de progresso. O servico e destinado a estudantes e
              pessoas que desejam melhorar sua produtividade nos estudos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Cadastro e Conta</h2>
            <p className="text-muted-foreground">
              Para utilizar o FocusStudy, voce deve criar uma conta fornecendo informacoes precisas e completas. Voce e
              responsavel por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua
              conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Uso Aceitavel</h2>
            <p className="text-muted-foreground mb-2">Voce concorda em nao:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Usar o servico para fins ilegais ou nao autorizados</li>
              <li>Violar quaisquer leis locais, estaduais, nacionais ou internacionais</li>
              <li>Transmitir virus ou codigo malicioso</li>
              <li>Coletar informacoes de outros usuarios sem autorizacao</li>
              <li>Interferir ou interromper o servico ou servidores</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Propriedade Intelectual</h2>
            <p className="text-muted-foreground">
              Todo o conteudo do FocusStudy, incluindo textos, graficos, logos, icones e software, e propriedade do
              FocusStudy ou de seus licenciadores e esta protegido por leis de direitos autorais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Conteudo do Usuario</h2>
            <p className="text-muted-foreground">
              Voce mantem a propriedade de todo o conteudo que criar no FocusStudy (tarefas, notas, etc.). Ao usar nosso
              servico, voce nos concede uma licenca limitada para armazenar e processar seu conteudo com o unico
              proposito de fornecer o servico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Limitacao de Responsabilidade</h2>
            <p className="text-muted-foreground">
              O FocusStudy e fornecido "como esta", sem garantias de qualquer tipo. Nao nos responsabilizamos por
              quaisquer danos diretos, indiretos, incidentais ou consequentes decorrentes do uso do servico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Modificacoes dos Termos</h2>
            <p className="text-muted-foreground">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Alteracoes significativas serao
              comunicadas por email ou atraves do servico. O uso continuado apos as modificacoes constitui aceitacao dos
              novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Rescisao</h2>
            <p className="text-muted-foreground">
              Podemos encerrar ou suspender sua conta e acesso ao servico a qualquer momento, sem aviso previo, por
              violacao destes termos ou por qualquer outro motivo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Contato</h2>
            <p className="text-muted-foreground">
              Se voce tiver duvidas sobre estes Termos de Uso, entre em contato conosco atraves do email:
              contato@focusstudy.com.br
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
