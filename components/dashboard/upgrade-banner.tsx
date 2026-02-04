'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function UpgradeBanner() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [isTrialEligible, setIsTrialEligible] = useState(true)
  const [isValidating, setIsValidating] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return

        // 1. Busca o perfil para pegar o device_id e o próprio status de trial
        const { data: profile } = await supabase
          .from('profiles')
          .select('device_id, trial_redeemed')
          .eq('id', session.user.id)
          .single()

        // Se o usuário já resgatou, nem precisa olhar o device_id
        if (profile?.trial_redeemed) {
          setIsTrialEligible(false)
          return
        }

        const currentDeviceId = profile?.device_id || localStorage.getItem('device_id')

        if (currentDeviceId) {
          // 2. Verifica se QUALQUER conta com este device_id já usou o trial
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

    // IDs de preço vindos das variáveis de ambiente
    const priceId =
      planType === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID

    if (!priceId) {
      toast.error("Configuração de plano não encontrada.")
      setIsLoading(null)
      return
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId,
          isTrialEligible 
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
      toast.error("Erro ao redirecionar para o pagamento.")
    } finally {
      setIsLoading(null)
    }
  }

  // Não renderiza nada enquanto valida para evitar layout shift
  if (isValidating) return null

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border border-amber-500/20 shadow-md animate-in fade-in slide-in-from-top-2">
      <div className="flex-1 text-center sm:text-left">
        <p className="text-sm font-bold flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          {isTrialEligible ? 'Turbine seus estudos com IA' : 'Seja FocusStudy Pro'}
        </p>
        <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-0.5">
          {isTrialEligible ? (
            'Assine agora e ganhe 7 dias de acesso total grátis.'
          ) : (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              Trial indisponível para este dispositivo.
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUpgrade('monthly')}
          disabled={!!isLoading}
          className="cursor-pointer font-medium hover:bg-muted"
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