import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(req: Request) {
  try {
    const { cpf } = await req.json()
    const supabase = await createClient()

    if (!cpf) {
      return NextResponse.json(
        { eligible: false, error: 'CPF necessário' },
        { status: 400 }
      )
    }

    // 1. Gera o hash idêntico ao do checkout
    const cleanCPF = cpf.replace(/\D/g, '')
    const cpfHash = createHash('sha256').update(cleanCPF).digest('hex')

    // 2. Verifica se algum perfil já "queimou" o trial com esse CPF
    const { data: existingTrial } = await supabase
      .from('profiles')
      .select('id')
      .eq('cpf_hash', cpfHash)
      .eq('trial_redeemed', true)
      .maybeSingle()

    // 3. Verifica se o usuário logado já usou trial (prevenção extra)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    let userAlreadyUsed = false

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_redeemed')
        .eq('id', user.id)
        .single()

      if (profile?.trial_redeemed) userAlreadyUsed = true
    }

    // Elegível apenas se o CPF nunca foi usado E o usuário nunca usou trial
    const isEligible = !existingTrial && !userAlreadyUsed

    return NextResponse.json({ eligible: isEligible })
  } catch (error) {
    console.error('Erro ao checar elegibilidade:', error)
    return NextResponse.json({ eligible: false }, { status: 500 })
  }
}
