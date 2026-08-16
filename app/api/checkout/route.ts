// app/api/checkout/route.ts

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json()
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

    // 2. Prepara os dados da assinatura paga
    const metadata = {
      supabase_user_id: user.id,
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
      subscription_data: { metadata },
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