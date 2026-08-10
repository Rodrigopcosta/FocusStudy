import { OpenAI } from 'openai'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { PDFParse } from 'pdf-parse'

export const dynamic = 'force-dynamic'

interface PlanResponse {
  error?: string | null
  title?: string
  disciplines?: Array<{
    name: string
    topics: string[]
  }>
  schedule?: Array<{
    week: number
    focus: string
    tasks: Array<{
      discipline: string
      topic: string
      estimatedMinutes: number
    }>
  }>
  flashcards?: Array<{
    discipline: string
    front: string
    back: string
  }>
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { message: 'Configuração do servidor ausente (OPENAI_API_KEY).' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey })
    const supabase = await createClient()

    // 1. Checa Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // 2. Processa FormData (recebe o arquivo PDF do front-end)
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const weeksAvailable = formData.get('weeksAvailable') || '4'
    const hoursPerDay = formData.get('hoursPerDay') || '2'

    if (!file) {
      return NextResponse.json(
        { message: 'Por favor, envie o arquivo PDF do edital.' },
        { status: 400 }
      )
    }

    // 3. Converte o arquivo em buffer e extrai o texto do PDF
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const parser = new PDFParse({ data: buffer })
    let pdfData
    try {
      pdfData = await parser.getText()
    } finally {
      await parser.destroy()
    }
    const editalText = pdfData.text

    if (!editalText || editalText.trim().length < 50) {
      return NextResponse.json(
        {
          message: 'Não foi possível extrair texto do PDF. Verifique se o arquivo não é uma imagem digitalizada/escaneada.',
        },
        { status: 400 }
      )
    }

    // 4. Checagem do plano do usuário no Supabase (Pro/Ultimate)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan_type')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.plan_type === 'free') {
      return NextResponse.json(
        {
          message: 'Recurso exclusivo para planos PRO.',
        },
        { status: 403 }
      )
    }

    // 5. Chamada para a IA OpenAI com o texto extraído do PDF
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `Você é um coordenador pedagógico e especialista em concursos e exames.
Sua tarefa é analisar o edital e gerar um plano de estudos estruturado e flashcards em formato Cloze Deletion.

REGRAS:
1. Extraia e agrupe o conteúdo por Disciplinas principais.
2. Divida cada disciplina em tópicos executáveis organizados por semanas.
3. Crie flashcards relevantes focados nas regras, conceitos e jurisprudências/fatos mais cobrados.
4. No Cloze Deletion dos flashcards, use {{termo}} para omitir palavras-chave vitais (não omita frases inteiras).
5. Se o texto não for um edital ou conteúdo estudável, retorne {"error": "invalid_content"}.`,
        },
        {
          role: 'user',
          content: `Analise este edital e monte o plano considerando ${weeksAvailable} semanas e ${hoursPerDay}h/dia de estudo:

EDITAL:
"${editalText.slice(0, 30000)}"

Formato JSON estritamente esperado:
{
  "error": null,
  "title": "Nome do Concurso/Exame ou Resumo do Edital",
  "disciplines": [
    {
      "name": "Nome da Disciplina",
      "topics": ["Tópico 1", "Tópico 2"]
    }
  ],
  "schedule": [
    {
      "week": 1,
      "focus": "Foco da Semana",
      "tasks": [
        { "discipline": "Nome da Disciplina", "topic": "Tópico x", "estimatedMinutes": 60 }
      ]
    }
  ],
  "flashcards": [
    {
      "discipline": "Nome da Disciplina",
      "front": "Pergunta ou afirmação com {{termo}}",
      "back": "Resposta curta"
    }
  ]
}`,
        },
      ],
    })

    const rawContent = response.choices[0]?.message?.content

    if (!rawContent) {
      return NextResponse.json(
        { message: 'Resposta vazia retornada pela IA.' },
        { status: 500 }
      )
    }

    let data: PlanResponse
    try {
      data = JSON.parse(rawContent)
    } catch {
      return NextResponse.json(
        { message: 'Falha ao processar a resposta gerada pela IA.' },
        { status: 500 }
      )
    }

    if (data.error === 'invalid_content') {
      return NextResponse.json(
        {
          message: 'Não foi possível extrair um edital válido desse arquivo.',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Erro na geração do plano:', error)
    return NextResponse.json(
      { message: error?.message || 'Erro interno ao processar o arquivo PDF.' },
      { status: 500 }
    )
  }
}