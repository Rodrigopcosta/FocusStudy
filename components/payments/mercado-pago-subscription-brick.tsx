'use client'

import { useEffect, useState } from 'react'
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

export function MercadoPagoSubscriptionBrick({
  plan,
  deviceId,
  userEmail,
  completeOnboarding = false,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY

  useEffect(() => {
    if (publicKey) initMercadoPago(publicKey, { locale: 'pt-BR' })
  }, [publicKey])

  if (!publicKey) {
    return <p className="text-sm text-destructive">Mercado Pago não configurado.</p>
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
      toast.success('Assinatura criada com sucesso!')
      onSuccess?.()
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
