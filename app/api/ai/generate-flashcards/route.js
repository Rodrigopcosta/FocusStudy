import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Certifique-se que este caminho aponta para o server client

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    // 1. Inicializa o cliente do servidor corretamente (aguardando os cookies)
    const supabase = await createClient();
    
    // 2. Busca o usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { text } = await req.json();

    // 3. Verificar Plano e Limite Diário
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

    // 4. Gerar exatamente 5 flashcards via OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em concursos públicos. Crie exatamente 5 flashcards eficazes. Use o formato Cloze Deletion (omissão de palavras) com {{termo}} na frente para pontos cruciais e a resposta curta no verso. Retorne apenas JSON."
        },
        {
          role: "user",
          content: `Crie 5 flashcards para este conteúdo: ${text}. 
          Formato do JSON: {"flashcards": [{"front": "pergunta com {{...}}", "back": "resposta"}]}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(response.choices[0].message.content);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na IA:', error);
    return NextResponse.json({ error: 'Falha ao gerar flashcards', details: error.message }, { status: 500 });
  }
}