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
    question: "O FocusStudy é gratuito?",
    answer:
      "Sim! O FocusStudy é totalmente gratuito. Você pode criar sua conta e usar todas as funcionalidades sem nenhum custo.",
  },
  {
    question: "Como funciona a técnica Pomodoro?",
    answer:
      "A técnica Pomodoro consiste em dividir o tempo de estudo em blocos focados seguidos de pausas. No FocusStudy, oferecemos dois modos: 25 minutos de foco + 5 de pausa, ou 50 minutos de foco + 10 de pausa. Isso ajuda a manter a concentração e evitar a fadiga mental.",
  },
  {
    question: "Posso usar o FocusStudy para estudar para concursos?",
    answer:
      "Com certeza! O FocusStudy foi desenvolvido pensando em concurseiros. Você pode criar disciplinas específicas, organizar tarefas por prioridade, fazer anotações de cada matéria e acompanhar seu progresso no dashboard.",
  },
  {
    question: "E para quem está na faculdade?",
    answer:
      "Também! Ao criar sua conta, você pode escolher se está estudando para concursos ou na faculdade. Para universitários, oferecemos opções de organizar disciplinas por curso e matéria.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim, levamos a segurança muito a sério. Seus dados são armazenados em servidores seguros com criptografia, e seguimos as melhores práticas de proteção de dados conforme a LGPD.",
  },
  {
    question: "Como crio uma nova disciplina?",
    answer:
      "Vá até a página de Disciplinas no menu lateral. Lá você pode adicionar novas disciplinas com nome, cor e ícone personalizados. As disciplinas podem ser usadas para organizar suas tarefas e notas.",
  },
  {
    question: "Posso editar ou excluir uma tarefa?",
    answer:
      "Sim! Na lista de tarefas, clique no menu de três pontos ao lado de qualquer tarefa para ver as opções de editar ou excluir. Você também pode marcar tarefas como concluídas clicando no checkbox.",
  },
  {
    question: "O que é a sequência (streak)?",
    answer:
      "A sequência mostra quantos dias consecutivos você estudou. Cada dia que você completa ao menos uma sessão de Pomodoro ou tarefa, sua sequência aumenta. É uma forma de motivação para manter a consistência nos estudos!",
  },
  {
    question: "Posso usar o FocusStudy no celular?",
    answer:
      "Sim! O FocusStudy é totalmente responsivo e funciona em qualquer dispositivo - computador, tablet ou celular. Basta acessar pelo navegador.",
  },
  {
    question: "Como posso dar feedback ou sugestões?",
    answer:
      "Adoramos ouvir nossos usuários! Você pode enviar feedback, sugestões ou relatar problemas pelo e-mail: contato@focusstudy.com.br",
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
        <p className="text-muted-foreground mb-8">Encontre respostas para as dúvidas mais comuns sobre o FocusStudy.</p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 rounded-lg bg-muted/50 text-center">
          <h2 className="font-semibold mb-2">Não encontrou sua resposta?</h2>
          <p className="text-muted-foreground mb-4">Entre em contato conosco pelo e-mail:</p>
          <a href="mailto:contato@focusstudy.com.br" className="text-primary hover:underline">
            contato@focusstudy.com.br
          </a>
        </div>
      </main>
    </div>
  )
}
