import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "Perguntas Frequentes",
  description: "Perguntas frequentes sobre o FocusStudy - Planejador de Estudos",
}

const faqs = [
  {
    question: "O FocusStudy e gratuito?",
    answer:
      "Sim! O FocusStudy e totalmente gratuito. Voce pode criar sua conta e usar todas as funcionalidades sem nenhum custo.",
  },
  {
    question: "Como funciona a tecnica Pomodoro?",
    answer:
      "A tecnica Pomodoro consiste em dividir o tempo de estudo em blocos focados seguidos de pausas. No FocusStudy, oferecemos dois modos: 25 minutos de foco + 5 de pausa, ou 50 minutos de foco + 10 de pausa. Isso ajuda a manter a concentracao e evitar a fadiga mental.",
  },
  {
    question: "Posso usar o FocusStudy para estudar para concursos?",
    answer:
      "Com certeza! O FocusStudy foi desenvolvido pensando em concurseiros. Voce pode criar disciplinas especificas, organizar tarefas por prioridade, fazer anotacoes de cada materia e acompanhar seu progresso no dashboard.",
  },
  {
    question: "E para quem esta na faculdade?",
    answer:
      "Tambem! Ao criar sua conta, voce pode escolher se esta estudando para concursos ou na faculdade. Para universitarios, oferecemos opcoes de organizar disciplinas por curso e materia.",
  },
  {
    question: "Meus dados estao seguros?",
    answer:
      "Sim, levamos a seguranca muito a serio. Seus dados sao armazenados em servidores seguros com criptografia, e seguimos as melhores praticas de protecao de dados conforme a LGPD.",
  },
  {
    question: "Como crio uma nova disciplina?",
    answer:
      "Va ate a pagina de Disciplinas no menu lateral. La voce pode adicionar novas disciplinas com nome, cor e icone personalizados. As disciplinas podem ser usadas para organizar suas tarefas e notas.",
  },
  {
    question: "Posso editar ou excluir uma tarefa?",
    answer:
      "Sim! Na lista de tarefas, clique no menu de tres pontos ao lado de qualquer tarefa para ver as opcoes de editar ou excluir. Voce tambem pode marcar tarefas como concluidas clicando no checkbox.",
  },
  {
    question: "O que e a sequencia (streak)?",
    answer:
      "A sequencia mostra quantos dias consecutivos voce estudou. Cada dia que voce completa ao menos uma sessao de Pomodoro ou tarefa, sua sequencia aumenta. E uma forma de motivacao para manter a consistencia nos estudos!",
  },
  {
    question: "Posso usar o FocusStudy no celular?",
    answer:
      "Sim! O FocusStudy e totalmente responsivo e funciona em qualquer dispositivo - computador, tablet ou celular. Basta acessar pelo navegador.",
  },
  {
    question: "Como posso dar feedback ou sugestoes?",
    answer:
      "Adoramos ouvir nossos usuarios! Voce pode enviar feedback, sugestoes ou relatar problemas pelo email: contato@focusstudy.com.br",
  },
]

export default function FAQPage() {
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
        <h1 className="text-3xl font-bold mb-4">Perguntas Frequentes</h1>
        <p className="text-muted-foreground mb-8">Encontre respostas para as duvidas mais comuns sobre o FocusStudy.</p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 rounded-lg bg-muted/50 text-center">
          <h2 className="font-semibold mb-2">Nao encontrou sua resposta?</h2>
          <p className="text-muted-foreground mb-4">Entre em contato conosco pelo email:</p>
          <a href="mailto:contato@focusstudy.com.br" className="text-primary hover:underline">
            contato@focusstudy.com.br
          </a>
        </div>
      </main>
    </div>
  )
}
