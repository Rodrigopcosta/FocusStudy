// app/api/check-eligibility/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(req: Request) {
  try {
    const { cpf, deviceId } = await req.json()
    const supabase = await createClient()

    // 1. Validação básica de entrada
    if (!cpf || !deviceId) {
      return NextResponse.json(
        { eligible: false, error: 'Dados insuficientes.' },
        { status: 400 }
      )
    }

    // 2. RATE LIMIT (Proteção contra abusos)
    // Reduzi de 10 para 3, pois 10 contas no mesmo dispositivo é muito para um usuário comum
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('device_id', deviceId)

    if (count && count >= 3) { 
      return NextResponse.json(
        { eligible: false, error: 'Limite de contas atingido para este dispositivo.' },
        { status: 429 }
      )
    }

    // 3. Preparação do CPF
    const cleanCPF = cpf.replace(/\D/g, '')
    if (cleanCPF.length !== 11) {
       return NextResponse.json({ eligible: false, error: 'CPF inválido.' }, { status: 400 })
    }
    
    const cpfHash = createHash('sha256').update(cleanCPF).digest('hex')

    // 4. Verificação de Histórico (CPF e Dispositivo)
    // IMPORTANTE: Adicionamos 'id' para evitar que o usuário seja bloqueado por ELE MESMO 
    // caso ele recarregue a página após já ter inserido o CPF.
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: records, error: queryError } = await supabase
      .from('profiles')
      .select('id, trial_redeemed, has_trial_active, device_id, cpf_hash')
      .or(`cpf_hash.eq.${cpfHash},device_id.eq.${deviceId}`)

    if (queryError) throw queryError

    /**
     * Lógica de Elegibilidade Refinada:
     * O usuário não é elegível se encontrarmos OUTRO perfil (id diferente do atual)
     * que já tenha usado o trial ou esteja com ele ativo.
     */
    const otherRecords = records?.filter(profile => profile.id !== user?.id) || []
    
    const hasAlreadyRedeemed = otherRecords.some(profile => 
      profile.trial_redeemed === true || profile.has_trial_active === true
    )

    // 5. Identificação do motivo
    let reason = null
    if (hasAlreadyRedeemed) {
      const byDevice = otherRecords.find(p => p.device_id === deviceId)
      reason = byDevice ? 'device' : 'cpf'
    }

    console.log(`✅ Elegibilidade verificada - CPF: ${cleanCPF.slice(-4)}, Device: ${deviceId.slice(0, 8)}..., Eligible: ${!hasAlreadyRedeemed}, Reason: ${reason}`)

    // 6. Resposta
    return NextResponse.json({ 
      eligible: !hasAlreadyRedeemed,
      hash: cpfHash,
      reason: reason 
    })

  } catch (error) {
    console.error('Erro ao checar elegibilidade:', error)
    return NextResponse.json(
      { eligible: false, error: 'Erro interno ao validar dados.' }, 
      { status: 500 }
    )
  }
}