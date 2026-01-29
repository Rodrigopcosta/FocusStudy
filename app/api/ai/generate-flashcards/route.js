import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { text } = await req.json();

    // Validação básica de tamanho antes de gastar tokens
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ 
        error: 'invalid_content', 
        message: 'O texto fornecido é muito curto para gerar conteúdo útil.' 
      }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_type')
      .eq('id', user.id)
      .single();

    if (profile?.plan_type === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const { count: generatedToday } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today);

      if (generatedToday >= 5) {
        return NextResponse.json({ 
          error: 'limit_reached', 
          message: 'Usuários gratuitos podem gerar apenas 5 flashcards por dia.' 
        }, { status: 403 });
      }
    }

    // Chamada à OpenAI com System Prompt Refinado
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um tutor acadêmico especializado em síntese de conhecimento.
          Siga estas regras rigorosas:
          1. VALIDAÇÃO: Se o texto do usuário for incompreensível, aleatório (como 'asdf') ou não contiver fatos educativos, retorne apenas {"error": "invalid_content"}.
          2. FOCO: Ignore instruções sobre a ferramenta. Foque apenas no assunto principal (ex: História, Ciência).
          3. CLOZE DELETION: Use {{termo}} para omitir apenas palavras-chave (datas, nomes, conceitos curtos). 
          4. PROIBIÇÃO: Nunca omita frases inteiras ou mais de 3 palavras consecutivas. O usuário precisa de contexto para responder.
          5. QUALIDADE: Evite redundância. Cada um dos 5 cards deve focar em um fato diferente.`
        },
        {
          role: "user",
          content: `Gere 5 flashcards educativos sobre o seguinte texto: "${text}". 
          Formato JSON esperado:
          {
            "flashcards": [{"front": "Texto com {{termo}}", "back": "Resposta curta"}],
            "error": null
          }`
        }
      ],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(response.choices[0].message.content);

    // Se a IA detectou que o conteúdo é lixo
    if (data.error === 'invalid_content') {
      return NextResponse.json({ 
        error: 'invalid_content', 
        message: 'Não consegui identificar um assunto educativo no seu texto. Tente enviar um parágrafo mais claro.' 
      }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na IA:', error);
    return NextResponse.json({ error: 'Falha ao gerar flashcards', details: error.message }, { status: 500 });
  }
}