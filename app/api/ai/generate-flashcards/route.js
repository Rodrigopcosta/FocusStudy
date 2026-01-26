import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { text, count = 5 } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Texto não fornecido' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // O melhor custo-benefício de 2026
      messages: [
        {
          role: "system",
          content: "Você é um especialista em concursos públicos. Crie flashcards eficazes (pergunta e resposta curta) baseados no texto fornecido. Retorne apenas JSON."
        },
        {
          role: "user",
          content: `Crie ${count} flashcards do tipo 'frente e verso' para este conteúdo: ${text}. 
          Formato do JSON: {"flashcards": [{"front": "pergunta", "back": "resposta"}]}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(response.choices[0].message.content);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na IA:', error);
    return NextResponse.json({ error: 'Falha ao gerar flashcards' }, { status: 500 });
  }
}