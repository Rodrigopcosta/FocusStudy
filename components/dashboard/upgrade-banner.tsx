'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function UpgradeBanner() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    setIsLoading(planType)

    const priceId =
      planType === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID

    if (!priceId) {
      toast.error('Configuração de plano não encontrada.')
      setIsLoading(null)
      return
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Erro ao gerar checkout')
      }
    } catch (error: any) {
      toast.error('Erro ao redirecionar para o pagamento.')
    } finally {
      setIsLoading(null)
    }
  }

  if (!isVisible) return null

  return (
    <div className="flex h-11 w-full min-w-130 max-w-150 items-center justify-between overflow-hidden rounded-xl border border-amber-500/30 bg-card pl-4 pr-11 shadow-sm animate-in fade-in slide-in-from-right-4 relative">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer z-10"
        title="Fechar"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-3 overflow-hidden mr-4">
        <div className="bg-amber-500/10 p-1.5 rounded-lg shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        </div>
        <div className="flex flex-col truncate">
          <p className="text-[13px] font-bold leading-tight truncate">
            Turbine seus estudos com IA
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight truncate">
            Desbloqueie todas as funções premium.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUpgrade('monthly')}
          disabled={!!isLoading}
          className="h-7 text-[11px] px-3 cursor-pointer hover:bg-muted font-medium border-amber-500/10"
        >
          {isLoading === 'monthly' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            'Mensal'
          )}
        </Button>

        <Button
          size="sm"
          className="h-7 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] px-4 cursor-pointer shadow-sm transition-all active:scale-95 whitespace-nowrap"
          onClick={() => handleUpgrade('yearly')}
          disabled={!!isLoading}
        >
          {isLoading === 'yearly' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            'Anual'
          )}
        </Button>
      </div>

      <div className="absolute -right-2 top-0 h-full w-24 bg-linear-to-l from-amber-500/5 to-transparent pointer-events-none" />
    </div>
  )
}
