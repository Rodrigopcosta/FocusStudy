import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Limite Premium: 50.000 caracteres
const SERVER_MAX_CHARS = 50000
// Limite de resumos por dia para assinantes (ajuste conforme necessário)
const DAILY_SUMMARY_LIMIT = 10

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

    // 1. VERIFICAÇÃO DE ASSINATURA E LIMITE DIÁRIO
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_type')
      .eq('id', user.id)
      .single()

    // Como você disse que é exclusivo para quem tem assinatura:
    if (profile?.plan_type !== 'pro' && profile?.plan_type !== 'premium') {
      return NextResponse.json(
        {
          error: 'subscription_required',
          message: 'O Resumo Premium de 50k é exclusivo para assinantes.',
        },
        { status: 403 }
      )
    }

    // Trava de quantidade diária (mesmo para assinantes, para evitar abusos)
    const today = new Date().toISOString().split('T')[0]

    // Assumindo que você tenha uma tabela 'summaries' para registrar os usos
    // Se não tiver, você pode criar uma ou usar uma tabela de logs de uso genérica
    const { count: usageToday } = await supabase
      .from('summaries') // Certifique-se de que esta tabela existe
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today)

    if (usageToday !== null && usageToday >= DAILY_SUMMARY_LIMIT) {
      return NextResponse.json(
        {
          error: 'limit_reached',
          message: `Você atingiu seu limite diário de ${DAILY_SUMMARY_LIMIT} resumos premium.`,
        },
        { status: 429 }
      )
    }

    let { text, mode, lines } = await req.json()

    // 2. VALIDAÇÃO DE CONTEÚDO
    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        {
          error: 'invalid_content',
          message: 'Texto muito curto para resumir.',
        },
        { status: 400 }
      )
    }

    if (text.length > SERVER_MAX_CHARS) {
      text = text.substring(0, SERVER_MAX_CHARS)
    }

    const promptInstructions = {
      bullets:
        'Crie um resumo estruturado exclusivamente em tópicos (bullet points) claros.',
      short: 'Crie um resumo executivo de um único parágrafo.',
      detailed:
        'Crie um resumo detalhado, mantendo a cronologia e conceitos principais.',
      lines: `Crie um resumo conciso que tenha entre ${lines || 5} e ${Math.max((lines || 5) + 2, 7)} linhas.`,
    }

    // 3. CHAMADA À OPENAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um tutor acadêmico especializado em síntese. Responda apenas em JSON.`,
        },
        {
          role: 'user',
          content: `${promptInstructions[mode as keyof typeof promptInstructions]}\n\nTexto: "${text}"\n\nRetorne JSON: { "summary": "...", "error": null }`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const data = JSON.parse(response.choices[0].message.content || '{}')

    // 4. REGISTRO DE USO NO BANCO (Importante para a trava funcionar)
    if (data.summary) {
      await supabase.from('summaries').insert({
        user_id: user.id,
        content_length: text.length,
        mode: mode,
      })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Erro na IA:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Erro ao processar resumo.' },
      { status: 500 }
    )
  }
}
