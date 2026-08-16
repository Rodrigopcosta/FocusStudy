import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { priceId, cancelUrl } = await req.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
      })
    }

    if (!priceId) {
      return new NextResponse(
        JSON.stringify({ error: 'O ID do preço não foi fornecido.' }),
        {
          status: 400,
        }
      )
    }

    const metadata = {
      supabase_user_id: user.id,
    }

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${cancelUrl ?? '/dashboard'}?canceled=true`,
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
