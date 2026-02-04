import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

// Cliente Admin necessário para bypassar RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

  const session = event.data.object as any
  console.log('🔔 Evento Recebido:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = session.metadata?.supabase_user_id
        const cpfHash = session.metadata?.cpf_hash
        const subscriptionId = session.subscription as string

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0].price.id

          // Define o plano baseado no Price ID
          const planType = 
            priceId === process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID 
            ? 'ultimate' 
            : 'pro'
          
          console.log(`🚀 Ativando plano ${planType} para o usuário: ${userId}`)

          // ATUALIZAÇÃO DO PERFIL
          // Importante: trial_redeemed vira true apenas se a assinatura DE FATO teve um trial
          // ou se você quer bloquear trial para sempre após a primeira compra (recomendado)
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              stripe_customer_id: session.customer as string,
              subscription_status: subscription.status,
              plan_type: planType,
              trial_redeemed: true, // Uma vez que pagou ou usou trial, nunca mais ganha trial
              cpf_hash: cpfHash,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (updateError) {
            console.error('❌ Erro ao atualizar Supabase:', updateError.message)
            throw updateError
          }
          
          console.log('✅ Banco de dados atualizado: Assinatura Ativa e Documento Vinculado.')
        }
        break
      }

      case 'customer.subscription.updated': {
        const updatedSub = event.data.object as any
        
        // Buscamos o tipo de plano novamente para garantir upgrade/downgrade
        const priceId = updatedSub.items.data[0].price.id
        const planType = 
          priceId === process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID 
          ? 'ultimate' 
          : 'pro'

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: updatedSub.status,
            plan_type: updatedSub.status === 'active' || updatedSub.status === 'trialing' ? planType : 'free',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', updatedSub.customer as string)

        if (updateError) console.error('❌ Erro ao atualizar status:', updateError.message)
        break
      }

      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object as any
        
        // Retorno ao plano free
        const { error: deleteError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            plan_type: 'free',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', deletedSub.customer as string)

        if (deleteError) console.error('❌ Erro ao remover plano:', deleteError.message)
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