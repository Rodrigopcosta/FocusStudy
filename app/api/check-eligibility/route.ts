import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { deviceId } = await req.json()
    const supabase = await createClient()

    if (!deviceId) {
      return NextResponse.json({ eligible: false, error: 'Dados insuficientes.' }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { data: records, error } = await supabase
      .from('profiles')
      .select('id, trial_redeemed, has_trial_active')
      .eq('device_id', deviceId)

    if (error) throw error

    const otherRecords = records?.filter(p => p.id !== user?.id) ?? []
    const hasAlreadyRedeemed = otherRecords.some(p => p.trial_redeemed === true || p.has_trial_active === true)

    return NextResponse.json({ eligible: !hasAlreadyRedeemed })
  } catch (error) {
    console.error('Erro ao checar elegibilidade:', error)
    return NextResponse.json({ eligible: false, error: 'Erro interno.' }, { status: 500 })
  }
}
