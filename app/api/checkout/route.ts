import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json()
    const supabase = await createClient()

    // 1. Pega o usuário logado para saber QUEM está comprando
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    // 2. Cria a sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // REDIRECIONAMENTOS: Para onde ele vai após pagar ou cancelar
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,

      // O SEGREDO ESTÁ AQUI: Vinculamos o ID do Supabase ao pagamento do Stripe
      metadata: {
        supabase_user_id: user.id,
      },
      // Permite que o Stripe use o e-mail do usuário logado automaticamente
      customer_email: user.email,
      subscription_data: {
        trial_period_days: 7, // Garante os 7 dias grátis configurados
        metadata: {
          supabase_user_id: user.id,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erro no Checkout:', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}
