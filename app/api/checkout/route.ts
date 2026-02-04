import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(req: Request) {
  try {
    const { priceId, cpf } = await req.json()
    const supabase = await createClient()

    // 1. Pega o usuário logado
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Não autorizado' }), 
        { status: 401 }
      )
    }

    if (!cpf) {
      return new NextResponse(
        JSON.stringify({ error: 'CPF é obrigatório' }), 
        { status: 400 }
      )
    }

    // --- LÓGICA ANTIFRAUDE ROBUSTA ---
    
    // A. Limpa o CPF e gera o Hash no Servidor
    const cleanCPF = cpf.replace(/\D/g, '')
    const cpfHash = createHash('sha256').update(cleanCPF).digest('hex')

    // B. Verifica se este CPF já foi usado em QUALQUER conta para resgatar Trial
    const { data: existingTrial } = await supabase
      .from('profiles')
      .select('id')
      .eq('cpf_hash', cpfHash)
      .eq('trial_redeemed', true)
      .maybeSingle()

    // C. Verifica o status do perfil atual do usuário logado
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('trial_redeemed')
      .eq('id', user.id)
      .single()

    // Decisão final do Trial
    const shouldGiveTrial = !currentProfile?.trial_redeemed && !existingTrial

    // D. Atualiza o perfil atual com o hash ANTES de ir para o Stripe
    // Isso garante que o documento fique vinculado ao ID do usuário
    await supabase
      .from('profiles')
      .update({ cpf_hash: cpfHash })
      .eq('id', user.id)

    // -----------------------------------------------------------

    // 2. Prepara os dados da assinatura
    const subscriptionData: any = {
      metadata: {
        supabase_user_id: user.id,
        cpf_hash: cpfHash,
        was_trial: shouldGiveTrial ? 'true' : 'false'
      },
    }

    // Só adiciona o período de trial se ele for elegível
    if (shouldGiveTrial) {
      subscriptionData.trial_period_days = 7
      subscriptionData.trial_settings = {
        end_behavior: {
          missing_payment_method: 'cancel',
        },
      }
      console.log(`[Checkout] Usuário ${user.id} elegível para trial.`)
    } else {
      console.log(`[Checkout] Usuário ${user.id} NÃO elegível. Cobrança imediata.`)
    }

    // 3. Cria a sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      
      tax_id_collection: {
        enabled: true,
      },

      allow_promotion_codes: true,

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      
      // O Stripe substituirá {CHECKOUT_SESSION_ID} automaticamente
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,

      metadata: {
        supabase_user_id: user.id,
        cpf_hash: cpfHash,
        is_trial_conversion: shouldGiveTrial ? 'true' : 'false'
      },
      
      customer_email: user.email,
      subscription_data: subscriptionData,
      
      billing_address_collection: 'required',
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erro no Checkout:', error)
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Erro interno ao criar sessão de checkout' }), 
      { status: 500 }
    )
  }
}