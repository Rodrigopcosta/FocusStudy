'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, AlertCircle, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function UpgradeBanner() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [isTrialEligible, setIsTrialEligible] = useState(true)
  const [isValidating, setIsValidating] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session?.user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('device_id, trial_redeemed')
          .eq('id', session.user.id)
          .single()

        if (profile?.trial_redeemed) {
          setIsTrialEligible(false)
          return
        }

        const currentDeviceId =
          profile?.device_id || localStorage.getItem('device_id')

        if (currentDeviceId) {
          const { data: duplicateDevices } = await supabase
            .from('profiles')
            .select('id')
            .eq('device_id', currentDeviceId)
            .eq('trial_redeemed', true)

          if (duplicateDevices && duplicateDevices.length > 0) {
            setIsTrialEligible(false)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar elegibilidade do trial:', error)
      } finally {
        setIsValidating(false)
      }
    }

    checkTrialStatus()
  }, [supabase])

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
        body: JSON.stringify({
          priceId,
          isTrialEligible,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Erro ao gerar checkout')
      }
    } catch (error: any) {
      console.error('Erro ao processar upgrade:', error)
      toast.error('Erro ao redirecionar para o pagamento.')
    } finally {
      setIsLoading(null)
    }
  }

  if (isValidating || !isVisible) return null

  return (
    <div className="flex w-full justify-end px-4 py-2">
      <div className="relative flex w-full max-w-xl flex-col gap-4 overflow-hidden rounded-xl border border-amber-500/20 bg-card p-4 pr-12 shadow-lg animate-in fade-in slide-in-from-right-4 sm:flex-row sm:items-center">
        {/* Botão Fechar com cursor-pointer */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer z-10"
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex-1">
          <p className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            {isTrialEligible
              ? 'Turbine seus estudos com IA'
              : 'Seja FocusStudy Pro'}
          </p>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {isTrialEligible ? (
              'Assine agora e ganhe 7 dias grátis.'
            ) : (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                Trial indisponível.
              </span>
            )}
          </div>
        </div>

        {/* Container de Botões */}
        <div className="flex items-center gap-2 mr-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpgrade('monthly')}
            disabled={!!isLoading}
            className="h-8 cursor-pointer font-medium hover:bg-muted text-xs px-3"
          >
            {isLoading === 'monthly' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              'Mensal'
            )}
          </Button>

          <Button
            size="sm"
            className="h-8 bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer shadow-sm transition-all active:scale-95 text-xs px-3"
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

        {/* Efeito visual */}
        <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-amber-500/5 blur-2xl" />
      </div>
    </div>
  )
}
