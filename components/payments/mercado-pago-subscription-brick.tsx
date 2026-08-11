'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  plan: 'monthly' | 'yearly'
  deviceId?: string | null
  userEmail?: string | null
  completeOnboarding?: boolean
  onSuccess?: () => void
}

const amounts = {
  monthly: Number(process.env.NEXT_PUBLIC_MP_MONTHLY_AMOUNT || '39.9'),
  yearly: Number(process.env.NEXT_PUBLIC_MP_YEARLY_AMOUNT || '297'),
}

// Checagem curta só para pegar aprovações/recusas que acontecem quase na hora.
// A confirmação real costuma levar bem mais tempo (assíncrona do lado do Mercado Pago).
const QUICK_CHECK_INTERVAL_MS = 3000
const QUICK_CHECK_ATTEMPTS = 5 // ~15s no total

const cardCustomization = {
  paymentMethods: {
    minInstallments: 1,
    maxInstallments: 1,
    types: {
      excluded: ['debit_card', 'prepaid_card'] as Array<
        'debit_card' | 'prepaid_card'
      >,
    },
  },
}

type BrickState = 'form' | 'submitting' | 'processing' | 'approved' | 'rejected' | 'still_pending'

export function MercadoPagoSubscriptionBrick({
  plan,
  deviceId,
  userEmail,
  completeOnboarding = false,
  onSuccess,
}: Props) {
  const [state, setState] = useState<BrickState>('form')
  const [brickKey, setBrickKey] = useState(0) // força remontar o Brick limpo em caso de nova tentativa
  const quickCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY

  const initialization = useMemo(
    () => ({
      amount: amounts[plan],
      payer: userEmail ? { email: userEmail } : undefined,
    }),
    [plan, userEmail]
  )
  const handleBrickReady = useCallback(() => undefined, [])
  const handleBrickError = useCallback((error: unknown) => {
    console.error('Erro no Brick Mercado Pago:', error)
  }, [])

  useEffect(() => {
    if (publicKey) initMercadoPago(publicKey, { locale: 'pt-BR' })
  }, [publicKey])

  useEffect(() => {
    return () => {
      if (quickCheckTimer.current) clearTimeout(quickCheckTimer.current)
    }
  }, [])

  if (!publicKey) {
    return <p className="text-sm text-destructive">Mercado Pago não configurado.</p>
  }

  const quickCheckThenProceed = useCallback(() => {
    if (quickCheckTimer.current) clearTimeout(quickCheckTimer.current)

    let attempts = 0
    setState('processing')

    const checkStatus = async () => {
      attempts += 1

      try {
        const response = await fetch('/api/mercadopago/subscriptions/status', {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()

          if (data.subscription_status === 'active') {
            if (quickCheckTimer.current) clearTimeout(quickCheckTimer.current)
            quickCheckTimer.current = null
            setState('approved')
            return
          }

          if (data.subscription_status === 'rejected') {
            if (quickCheckTimer.current) clearTimeout(quickCheckTimer.current)
            quickCheckTimer.current = null
            setState('rejected')
            return
          }
        }
      } catch {
        // ignora falha pontual, tenta de novo no próximo tick
      }

      if (attempts >= QUICK_CHECK_ATTEMPTS) {
        if (quickCheckTimer.current) clearTimeout(quickCheckTimer.current)
        quickCheckTimer.current = null
        setState('still_pending')
        return
      }

      quickCheckTimer.current = setTimeout(checkStatus, QUICK_CHECK_INTERVAL_MS)
    }

    quickCheckTimer.current = setTimeout(checkStatus, QUICK_CHECK_INTERVAL_MS)
  }, [])

  const submitSubscription = useCallback(async (cardData: { token?: string }) => {
    if (!cardData.token) {
      toast.error('Não foi possível tokenizar o cartão.')
      return
    }

    setState('submitting')
    try {
      const response = await fetch('/api/mercadopago/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          deviceId,
          cardTokenId: cardData.token,
          completeOnboarding,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível criar a assinatura.')
      if (data.init_point) {
        window.location.href = data.init_point
        return
      }

      quickCheckThenProceed()
    } catch (error: any) {
      console.error('Erro na assinatura Mercado Pago:', error)
      toast.error(error.message || 'Não foi possível concluir a assinatura.')
      setState('form')
    }
  }, [completeOnboarding, deviceId, plan, quickCheckThenProceed])

  const tryAgain = () => {
    setBrickKey(prev => prev + 1) // remonta o Brick do zero, sem dados do cartão anterior
    setState('form')
  }

  // --- Estado: enviando o token do cartão para o servidor ---
  if (state === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Enviando dados do cartão…</p>
      </div>
    )
  }

  // --- Estado: assinatura criada, checando confirmação rápida ---
  if (state === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Confirmando o pagamento com a operadora…</p>
        <p className="text-xs text-muted-foreground max-w-xs">Isso leva só alguns instantes.</p>
      </div>
    )
  }

  // --- Estado: aprovado ---
  if (state === 'approved') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 py-8 px-4 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        <p className="text-sm font-medium text-emerald-800">Pagamento aprovado! Sua assinatura está ativa.</p>
        <button
          type="button"
          onClick={() => onSuccess?.()}
          className="mt-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Continuar
        </button>
      </div>
    )
  }

  // --- Estado: recusado ---
  if (state === 'rejected') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-red-200 bg-red-50 py-8 px-4 text-center">
        <XCircle className="h-8 w-8 text-red-600" />
        <p className="text-sm font-medium text-red-800">
          Transação negada pela operadora do cartão. Verifique os dados ou tente outro cartão.
        </p>
        <button
          type="button"
          onClick={tryAgain}
          className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // --- Estado: ainda pendente após a checagem rápida (segue em frente, sem bloquear) ---
  if (state === 'still_pending') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-amber-200 bg-amber-50 py-8 px-4 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
        <p className="text-sm font-medium text-amber-800">
          Cartão enviado! Ainda estamos confirmando o pagamento com a operadora — você será avisado assim que for aprovado.
        </p>
        <button
          type="button"
          onClick={() => onSuccess?.()}
          className="mt-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Continuar
        </button>
      </div>
    )
  }

  // --- Estado: formulário do cartão ---
  return (
    <div className="space-y-4">
      <CardPayment
        key={brickKey}
        initialization={initialization}
        customization={cardCustomization}
        onSubmit={submitSubscription}
        onReady={handleBrickReady}
        onError={handleBrickError}
      />
    </div>
  )
}