// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

function getPlanType(priceId: string, status: string): string {
  if (status !== 'active' && status !== 'trialing') return 'free'

  const isYearly = priceId === process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID

  if (isYearly) {
    return 'pro_annual'
  }

  return 'pro_monthly'
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature') as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error(`❌ Erro de Assinatura: ${error.message}`)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const data = event.data.object as any
  console.log('🔔 Evento Recebido:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = data.metadata?.supabase_user_id
        const subscriptionId = data.subscription as string

        if (!userId || !subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        const planType = getPlanType(priceId, subscription.status)

        console.log(`🚀 Ativando plano ${planType} para: ${userId}`)

        // ✅ Usando upsert - cria o perfil se não existir
        await prisma.profile.upsert({
          where: { id: userId },
          update: {
            stripe_customer_id: data.customer as string,
            subscription_id: subscriptionId,
            subscription_status: subscription.status,
            plan_type: planType,
            onboarding_completed: true,
            updated_at: new Date(),
          },
          create: {
            id: userId,
            stripe_customer_id: data.customer as string,
            subscription_id: subscriptionId,
            subscription_status: subscription.status,
            plan_type: planType,
            onboarding_completed: true,
            study_days: [],
            created_at: new Date(),
            updated_at: new Date(),
          },
        })

        console.log('✅ Checkout completado.')
        break
      }

      case 'customer.subscription.updated': {
        const priceId = data.items.data[0].price.id
        const planType = getPlanType(priceId, data.status)

        await prisma.profile.updateMany({
          where: { stripe_customer_id: data.customer as string },
          data: {
            subscription_status: data.status,
            plan_type: planType,
            updated_at: new Date(),
          },
        })

        console.log(`✅ Assinatura atualizada: ${data.status}`)
        break
      }

      case 'customer.subscription.deleted': {
        await prisma.profile.updateMany({
          where: { stripe_customer_id: data.customer as string },
          data: {
            subscription_status: 'canceled',
            plan_type: 'free',
            updated_at: new Date(),
          },
        })

        console.log('✅ Assinatura cancelada')
        break
      }

      default:
        console.log(`🟡 Evento ignorado: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('❌ Erro interno no Webhook:', error.message)
    return new NextResponse(`Erro Interno: ${error.message}`, { status: 500 })
  }
}
