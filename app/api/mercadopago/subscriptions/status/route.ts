import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('plan_type, subscription_status')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Erro ao consultar status da assinatura:', error)
    return NextResponse.json(
      { error: 'Não foi possível consultar o status da assinatura.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    plan_type: profile?.plan_type ?? 'free',
    subscription_status: profile?.subscription_status ?? 'none',
  })
}
