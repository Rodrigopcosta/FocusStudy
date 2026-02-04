import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Limite Premium: 50.000 caracteres (Aprox. 10k a 12k tokens)
// Isso garante que textos muito longos caibam na janela do gpt-4o-mini
const SERVER_MAX_CHARS = 50000

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    let { text, mode, lines } = await req.json()

    // Validação de segurança no Servidor
    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'invalid_content', message: 'Texto muito curto para resumir.' },
        { status: 400 }
      )
    }

    // Lógica de "Safe-Cut": Se passar do limite no servidor, cortamos para processar
    // Isso evita que a requisição falhe por erro 413 e garante o serviço ao usuário premium
    if (text.length > SERVER_MAX_CHARS) {
      text = text.substring(0, SERVER_MAX_CHARS)
      console.log(`[API Summary] Texto cortado para ${SERVER_MAX_CHARS} caracteres para o usuário ${user.id}`)
    }

    // Configuração do tom do resumo baseado no 'mode'
    const promptInstructions = {
      bullets: "Crie um resumo estruturado exclusivamente em tópicos (bullet points) claros e objetivos.",
      short: "Crie um resumo executivo de um único parágrafo, sendo extremamente direto e sintetizado.",
      detailed: "Crie um resumo detalhado e abrangente, mantendo a cronologia, os argumentos principais e conceitos fundamentais.",
      lines: `Crie um resumo conciso que tenha exatamente entre ${lines || 5} e ${Math.max((lines || 5) + 2, 7)} linhas de texto.`
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um tutor acadêmico de elite especializado em síntese e análise de conteúdo. 
          Sua tarefa é ler textos extensos e extrair a essência educativa de forma precisa.
          REGRAS CRÍTICAS:
          1. NUNCA use marcações de flashcards como {{termo}}.
          2. Não invente fatos; atenha-se ao conteúdo fornecido.
          3. Use uma linguagem acadêmica, porém acessível.
          4. Retorne a resposta exclusivamente no formato JSON solicitado.
          5. Se o texto fornecido for incompreensível, ofensivo ou puramente aleatório, retorne {"error": "invalid_content"}.`,
        },
        {
          role: 'user',
          content: `${promptInstructions[mode as keyof typeof promptInstructions] || promptInstructions.bullets}\n\nTexto para resumir: "${text}"\n\nRetorne obrigatoriamente neste formato JSON:\n{ "summary": "conteúdo do resumo aqui", "error": null }`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6, // Reduzido levemente para maior precisão em textos longos
    })

    const data = JSON.parse(response.choices[0].message.content || '{}')

    if (data.error === 'invalid_content') {
      return NextResponse.json(
        { 
          error: 'invalid_content', 
          message: 'Não foi possível identificar um tema acadêmico ou educativo consistente para resumir.' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Erro na IA de Resumo:', error)
    return NextResponse.json(
      { 
        error: 'server_error', 
        message: 'Falha ao processar o volume de dados. Tente novamente em instantes.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}