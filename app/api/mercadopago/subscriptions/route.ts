import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMercadoPagoSubscription, mercadoPagoAmounts } from '@/lib/mercado-pago'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type Plan = 'monthly' | 'yearly'

export async function POST(req: Request) {
  try {
    const { plan, cardTokenId, completeOnboarding } = (await req.json()) as {
      plan?: Plan
      cardTokenId?: string
      completeOnboarding?: boolean
    }

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 })
    }
    if (!cardTokenId) {
      return NextResponse.json({ error: 'Token do cartão não informado.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()
    if (profileError) throw new Error(`Erro ao consultar perfil: ${profileError.message}`)

    if (!profile) {
      const { data: createdProfile, error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .upsert(
          {
            id: user.id,
          },
          { onConflict: 'id' }
        )
        .select('id')
        .single()

      if (createProfileError) {
        throw new Error(`Não foi possível criar o perfil do usuário: ${createProfileError.message}`)
      }
      profile = createdProfile
    }

    const amount = mercadoPagoAmounts[plan]
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valor do plano não configurado.' }, { status: 500 })
    }

    const isSandbox = process.env.MP_ACCESS_TOKEN?.startsWith('TEST-')
    const payerEmail = isSandbox
      ? process.env.MP_TEST_PAYER_EMAIL || user.email
      : user.email

    if (isSandbox && !process.env.MP_TEST_PAYER_EMAIL) {
      return NextResponse.json(
        { error: 'Configure MP_TEST_PAYER_EMAIL com o e-mail do comprador de teste Mercado Pago.' },
        { status: 500 }
      )
    }

    const subscriptionBody = {
      reason: plan === 'yearly' ? 'FocusStudy Ultimate Anual' : 'FocusStudy Pro Mensal',
      external_reference: user.id,
      payer_email: payerEmail,
      card_token_id: cardTokenId,
      status: 'pending',
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=mercadopago`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: 'BRL',
      },
    }

    const subscription = await createMercadoPagoSubscription(subscriptionBody)

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_id: subscription.id,
        subscription_status: 'pending',
        plan_type: 'free',
        ...(completeOnboarding ? { onboarding_completed: true } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
    if (updateError) throw updateError

    return NextResponse.json({
      id: subscription.id,
      status: subscription.status,
      init_point: subscription.init_point,
      message: 'Assinatura criada. Aguardando confirmação de pagamento.',
    })
  } catch (error: any) {
    console.error('Erro ao criar assinatura Mercado Pago:', error)
    return NextResponse.json({ error: error?.message || 'Erro ao criar assinatura.' }, { status: 500 })
  }
}