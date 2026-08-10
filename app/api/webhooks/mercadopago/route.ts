import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPreApprovalClient, mercadoPagoAmounts } from '@/lib/mercado-pago'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const id = body?.data?.id || body?.id || new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ received: true })

    const subscription = await getPreApprovalClient().get({ id: String(id) })
    if (!subscription.external_reference) return NextResponse.json({ received: true })

    const status = subscription.status || 'pending'
    const active = ['authorized', 'active'].includes(status)
    const yearly =
      subscription.reason?.includes('Anual') ||
      subscription.auto_recurring?.transaction_amount === mercadoPagoAmounts.yearly

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_id: subscription.id,
        subscription_status: status,
        plan_type: active ? (yearly ? 'pro_annual' : 'pro_monthly') : 'free',
        subscription_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.external_reference)
    if (error) throw error

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro no webhook Mercado Pago:', error)
    return NextResponse.json({ error: error?.message || 'Erro no webhook.' }, { status: 500 })
  }
}
