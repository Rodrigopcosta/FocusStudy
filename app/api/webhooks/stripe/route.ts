// app/api/webhooks/stripe/route.ts

import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

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
        const deviceId = session.metadata?.device_id
        const isTrialConversion = session.metadata?.is_trial_conversion === 'true'
        const subscriptionId = session.subscription as string

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0].price.id

          // Lógica de plano centralizada
          const isYearly = [
            process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
            process.env.NEXT_PUBLIC_STRIPE_YEARLY_TRIAL_PRICE_ID
          ].includes(priceId)
          
          const planType = isYearly ? 'ultimate' : 'pro'

          console.log(`🚀 Ativando plano ${planType} para o usuário: ${userId}`)
          console.log(`📅 É trial: ${isTrialConversion}, Status: ${subscription.status}`)

          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              stripe_customer_id: session.customer as string,
              subscription_status: subscription.status,
              plan_type: planType,
              // trial_redeemed = true quando o período de trial TERMINAR (veja customer.subscription.updated)
              // has_trial_active = true APENAS se é trial e está ativo agora
              has_trial_active: isTrialConversion && subscription.status === 'trialing',
              cpf_hash: cpfHash,
              device_id: deviceId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

          if (updateError) throw updateError
          console.log('✅ Checkout completado com sucesso.')
        }
        break
      }

      case 'customer.subscription.updated': {
        const updatedSub = event.data.object as any
        const priceId = updatedSub.items.data[0].price.id
        
        // Uma assinatura é considerada ativa se estiver 'active' ou 'trialing'
        const isActive = ['active', 'trialing'].includes(updatedSub.status)
        const isTrialing = updatedSub.status === 'trialing'

        const isYearly = [
          process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
          process.env.NEXT_PUBLIC_STRIPE_YEARLY_TRIAL_PRICE_ID
        ].includes(priceId)

        const planType = isActive ? (isYearly ? 'ultimate' : 'pro') : 'free'

        // Se saiu do trial (passou de trialing para active), marca trial_redeemed
        const { data: currentProfile } = await supabaseAdmin
          .from('profiles')
          .select('subscription_status, trial_redeemed')
          .eq('stripe_customer_id', updatedSub.customer as string)
          .single()

        const wasTrialing = currentProfile?.subscription_status === 'trialing'
        const isNowActive = updatedSub.status === 'active'
        const shouldMarkTrialRedeemed = wasTrialing && isNowActive

        console.log(`📝 Sub atualizada - Era trialing: ${wasTrialing}, Agora active: ${isNowActive}, Marca redeemed: ${shouldMarkTrialRedeemed}`)

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: updatedSub.status,
            // has_trial_active = true apenas se ainda está em trialing
            has_trial_active: isTrialing,
            // trial_redeemed = true quando sai do trial (passou de trialing para active)
            trial_redeemed: shouldMarkTrialRedeemed ? true : (currentProfile?.trial_redeemed || false),
            plan_type: planType,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', updatedSub.customer as string)

        if (updateError) console.error('❌ Erro no update do sub.updated:', updateError.message)
        break
      }

      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object as any

        const { error: deleteError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            plan_type: 'free',
            has_trial_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', deletedSub.customer as string)

        if (deleteError) console.error('❌ Erro no sub.deleted:', deleteError.message)
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