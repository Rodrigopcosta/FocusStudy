'use client'

import { useEffect, useRef, useState } from 'react'
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react'
import { Loader2 } from 'lucide-react'
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
// A confirmação real costuma levar bem mais tempo (assíncrona do lado do Mercado Pago),
// então depois desse período o usuário segue em frente e o status final é
// acompanhado pelo SubscriptionStatusBadge no resto do app.
const QUICK_CHECK_INTERVAL_MS = 3000
const QUICK_CHECK_ATTEMPTS = 5 // ~15s no total

export function MercadoPagoSubscriptionBrick({
  plan,
  deviceId,
  userEmail,
  completeOnboarding = false,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const quickCheckTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY

  useEffect(() => {
    if (publicKey) initMercadoPago(publicKey, { locale: 'pt-BR' })
  }, [publicKey])

  useEffect(() => {
    return () => {
      if (quickCheckTimer.current) clearInterval(quickCheckTimer.current)
    }
  }, [])

  if (!publicKey) {
    return <p className="text-sm text-destructive">Mercado Pago não configurado.</p>
  }

  const quickCheckThenProceed = () => {
    let attempts = 0

    quickCheckTimer.current = setInterval(async () => {
      attempts += 1

      try {
        const response = await fetch('/api/mercadopago/subscriptions/status', {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()

          if (data.subscription_status === 'active') {
            if (quickCheckTimer.current) clearInterval(quickCheckTimer.current)
            toast.success('Pagamento aprovado! Sua assinatura está ativa.')
            onSuccess?.()
            return
          }

          if (data.subscription_status === 'rejected') {
            if (quickCheckTimer.current) clearInterval(quickCheckTimer.current)
            toast.error(
              'O pagamento foi recusado pela operadora do cartão. Verifique os dados ou tente outro cartão.'
            )
            return
          }
        }
      } catch {
        // ignora falha pontual, tenta de novo no próximo tick
      }

      if (attempts >= QUICK_CHECK_ATTEMPTS) {
        if (quickCheckTimer.current) clearInterval(quickCheckTimer.current)
        toast.info(
          'Cartão enviado! Estamos confirmando o pagamento com a operadora — você será avisado assim que for aprovado.'
        )
        onSuccess?.()
      }
    }, QUICK_CHECK_INTERVAL_MS)
  }

  const submitSubscription = async (cardData: { token?: string }) => {
    if (!cardData.token) {
      toast.error('Não foi possível tokenizar o cartão.')
      return
    }

    setIsSubmitting(true)
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
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <CardPayment
        initialization={{
          amount: amounts[plan],
          payer: userEmail ? { email: userEmail } : undefined,
        }}
        customization={{
          paymentMethods: {
            minInstallments: 1,
            maxInstallments: 1,
            types: { excluded: ['debit_card', 'prepaid_card'] },
          },
        }}
        onSubmit={submitSubscription}
        onReady={() => undefined}
        onError={(error: unknown) => console.error('Erro no Brick Mercado Pago:', error)}
      />
      {isSubmitting && <Loader2 className="mx-auto h-5 w-5 animate-spin" />}
    </div>
  )
}