import { createClient } from "@/lib/supabase/server"
import { stripe } from "../../../lib/stripe"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse("Usuário não autenticado", { status: 401 })
    }

    // Cria a sessão de Checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true, // Caso queira dar cupons no futuro
      subscription_data: {
        trial_period_days: 7, // Configura os 7 dias grátis aqui
        metadata: {
          supabase_user_id: user.id, // Vincula o pagamento ao seu usuário
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      customer_email: user.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Erro no Checkout Stripe:", error)
    return new NextResponse(error.message, { status: 500 })
  }
}