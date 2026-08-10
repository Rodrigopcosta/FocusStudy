'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'

type SubscriptionStatus = 'none' | 'pending' | 'active' | 'rejected' | 'paused' | 'cancelled' | 'authorized'

// Enquanto pendente, verifica periodicamente. Intervalo generoso porque a
// confirmação real do Mercado Pago costuma levar bastante tempo (assíncrona).
const POLL_INTERVAL_MS = 60000

export function SubscriptionStatusBadge() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/mercadopago/subscriptions/status', {
        cache: 'no-store',
      })
      if (!response.ok) return
      const data = await response.json()
      setStatus(data.subscription_status)

      // Só continua consultando enquanto ainda não há resposta definitiva.
      if (data.subscription_status !== 'pending' && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } catch {
      // silencioso — tenta de novo no próximo tick
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (loading || status === null || status === 'none' || status === 'active') {
    // Não mostra nada quando não há assinatura ou quando já está ativa
    // (nesse caso o resto do app já deve refletir o acesso Pro normalmente).
    return null
  }

  if (status === 'pending' || status === 'authorized') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Confirmando seu pagamento com a operadora do cartão…</span>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        <XCircle className="h-4 w-4" />
        <span>Pagamento recusado. Atualize seus dados de cartão para tentar novamente.</span>
      </div>
    )
  }

  if (status === 'paused') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <Clock className="h-4 w-4" />
        <span>Sua assinatura está pausada.</span>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <XCircle className="h-4 w-4" />
        <span>Sua assinatura foi cancelada.</span>
      </div>
    )
  }

  return null
}