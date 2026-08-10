import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPreApprovalClient, mercadoPagoAmounts } from '@/lib/mercado-pago'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchAuthorizedPayment(id: string) {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) throw new Error('MP_ACCESS_TOKEN não configurado.')

  const response = await fetch(`https://api.mercadopago.com/authorized_payments/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) {
    throw new Error(`Erro ao consultar authorized_payment ${id}: HTTP ${response.status}`)
  }
  return response.json()
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const type = body?.type || body?.entity
    const id = body?.data?.id || body?.id || new URL(req.url).searchParams.get('id')

    if (!id) return NextResponse.json({ received: true })

    if (type === 'subscription_authorized_payment') {
      const payment = await fetchAuthorizedPayment(String(id))
      const preapprovalId = payment.preapproval_id
      const paymentStatus = payment.status

      if (!preapprovalId) return NextResponse.json({ received: true })

      const subscription = await getPreApprovalClient().get({ id: String(preapprovalId) })
      if (!subscription.external_reference) return NextResponse.json({ received: true })

      const yearly =
        subscription.reason?.includes('Anual') ||
        subscription.auto_recurring?.transaction_amount === mercadoPagoAmounts.yearly

      if (paymentStatus === 'processed') {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_id: subscription.id,
            subscription_status: 'active',
            plan_type: yearly ? 'pro_annual' : 'pro_monthly',
            subscription_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.external_reference)
        if (error) throw error
      } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_id: subscription.id,
            subscription_status: 'rejected',
            plan_type: 'free',
            subscription_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.external_reference)
        if (error) throw error
      }

      return NextResponse.json({ received: true })
    }

    if (type === 'subscription_preapproval') {
      const subscription = await getPreApprovalClient().get({ id: String(id) })
      if (!subscription.external_reference) return NextResponse.json({ received: true })

      const status = subscription.status || 'pending'

      if (['cancelled', 'paused'].includes(status)) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_id: subscription.id,
            subscription_status: status,
            plan_type: 'free',
            subscription_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.external_reference)
        if (error) throw error
      }

      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro no webhook Mercado Pago:', error)
    return NextResponse.json({ error: error?.message || 'Erro no webhook.' }, { status: 500 })
  }
}