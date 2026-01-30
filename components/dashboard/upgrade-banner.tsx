'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function UpgradeBanner() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    setIsLoading(planType)

    // IDs vindos do seu .env.local
    const priceId =
      planType === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Erro ao processar upgrade:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border border-amber-500/20 shadow-md">
      <div className="flex-1 text-center sm:text-left">
        <p className="text-sm font-bold flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Turbine seus estudos com IA
        </p>
        <p className="text-xs text-muted-foreground">
          Assine agora e ganhe 7 dias de acesso total grátis.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUpgrade('monthly')}
          disabled={!!isLoading}
          className="cursor-pointer font-medium"
        >
          {isLoading === 'monthly' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Mensal'
          )}
        </Button>

        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer shadow-sm transition-all active:scale-95"
          onClick={() => handleUpgrade('yearly')}
          disabled={!!isLoading}
        >
          {isLoading === 'yearly' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Anual (Economize)'
          )}
        </Button>
      </div>
    </div>
  )
}
