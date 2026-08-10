describe('Verificação de Variáveis de Ambiente', () => {
  it('deve verificar se as chaves essenciais estão carregadas', () => {
    // Liste aqui as chaves que você suspeita
    console.log('OpenAI Key existe?', !!process.env.OPENAI_API_KEY)
    console.log('Supabase URL existe?', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Mercado Pago Access Token existe?', !!process.env.MP_ACCESS_TOKEN)

    // O teste falha se a chave da OpenAI não existir
    expect(process.env.OPENAI_API_KEY).toBeDefined()
  })
})
