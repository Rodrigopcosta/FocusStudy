// app/api/checkout/route.ts

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(req: Request) {
  try {
    const { priceId, cpf, deviceId } = await req.json()
    const supabase = await createClient()

    // 1. Pega o usuário logado
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
      })
    }

    if (!priceId) {
      return new NextResponse(JSON.stringify({ error: 'O ID do preço não foi fornecido.' }), {
        status: 400,
      })
    }

    if (!cpf) {
      return new NextResponse(JSON.stringify({ error: 'CPF é obrigatório' }), {
        status: 400,
      })
    }

    // --- LÓGICA ANTIFRAUDE ---
    const cleanCPF = cpf.replace(/\D/g, '')
    const cpfHash = createHash('sha256').update(cleanCPF).digest('hex')

    // Pegamos o perfil atual do usuário logado
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('trial_redeemed, has_trial_active, cpf_hash, device_id')
      .eq('id', user.id)
      .single()

    // Verificamos se esse CPF ou Device já teve um trial CONCRETIZADO (trial_redeemed) 
    // OU se tem um trial ativo no momento (has_trial_active) em OUTRO perfil
    const { data: trialHistory } = await supabase
      .from('profiles')
      .select('trial_redeemed, has_trial_active, id')
      .or(`cpf_hash.eq.${cpfHash},device_id.eq.${deviceId}`)

    // Filtra apenas outros perfis (não o atual)
    const otherProfiles = trialHistory?.filter(p => p.id !== user.id) || []
    
    const hasRedeemedBefore = otherProfiles.some(
      p => p.trial_redeemed === true || p.has_trial_active === true
    )

    // Elegível se: 
    // - Nunca resgatou nesta conta (trial_redeemed = false E has_trial_active = false)
    // - E nem em outra conta com mesmo CPF/Device
    const shouldGiveTrial = 
      !currentProfile?.trial_redeemed && 
      !currentProfile?.has_trial_active && 
      !hasRedeemedBefore

    console.log(`📊 Trial Eligibility Check:`)
    console.log(`   - currentProfile.trial_redeemed: ${currentProfile?.trial_redeemed}`)
    console.log(`   - currentProfile.has_trial_active: ${currentProfile?.has_trial_active}`)
    console.log(`   - hasRedeemedBefore: ${hasRedeemedBefore}`)
    console.log(`   - shouldGiveTrial: ${shouldGiveTrial}`)

    // Atualizamos o perfil com o CPF e Device antes de ir para o Stripe para garantir o vínculo
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        cpf_hash: cpfHash,
        device_id: deviceId 
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError)
      if (updateError.code === '23505') {
        return NextResponse.json(
          { error: 'Este CPF já está vinculado a outra conta.' },
          { status: 409 }
        )
      }
      throw updateError
    }

    // 2. Prepara os dados da assinatura (Trial ou Direto)
    const metadata = {
      supabase_user_id: user.id,
      cpf_hash: cpfHash,
      device_id: deviceId,
      is_trial_conversion: shouldGiveTrial ? 'true' : 'false',
    }

    const subscriptionData: any = {
      metadata: metadata, // Importante: metadados na assinatura para eventos recorrentes
    }

    if (shouldGiveTrial) {
      subscriptionData.trial_period_days = 7
      subscriptionData.trial_settings = {
        end_behavior: {
          missing_payment_method: 'cancel',
        },
      }
      console.log('🎁 Trial de 7 dias será concedido')
    } else {
      console.log('💳 Cobrança imediata (sem trial)')
    }

    // 3. Cria a sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      tax_id_collection: { enabled: true },
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId, 
          quantity: 1,
        },
      ],
      mode: 'subscription',
      metadata: metadata,
      customer_email: user.email,
      subscription_data: subscriptionData,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      billing_address_collection: 'required',
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erro no Checkout:', error)
    return new NextResponse(
      JSON.stringify({
        error: error.message || 'Erro interno ao criar sessão de checkout',
      }),
      { status: 500 }
    )
  }
}