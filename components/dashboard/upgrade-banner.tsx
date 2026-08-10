'use client'

import { useEffect, useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { MercadoPagoSubscriptionBrick } from '@/components/payments/mercado-pago-subscription-brick'

export function UpgradeBanner() {
  const [isValidating, setIsValidating] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const [showCheckout, setShowCheckout] = useState(false)
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return
        setUserEmail(session.user.email || null)
      } catch (error) {
        console.error('Erro ao verificar elegibilidade:', error)
      } finally {
        setIsValidating(false)
      }
    }
    checkTrialStatus()
  }, [supabase])

  if (isValidating || !isVisible) return null

  return (
    <>
      <div className="relative flex h-11 w-full min-w-130 max-w-150 items-center justify-between overflow-hidden rounded-xl border border-amber-500/30 bg-card pl-4 pr-11 shadow-sm">
        <button onClick={() => setIsVisible(false)} className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted" title="Fechar">
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="mr-4 flex items-center gap-3 overflow-hidden">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
          <div className="truncate">
            <p className="truncate text-[13px] font-bold">Turbine seus estudos com IA</p>
            <p className="truncate text-[11px] text-muted-foreground">Assine pelo Mercado Pago.</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => { setPlan('monthly'); setShowCheckout(true) }}>Mensal</Button>
          <Button size="sm" onClick={() => { setPlan('yearly'); setShowCheckout(true) }} className="bg-amber-500 text-white hover:bg-amber-600">Anual</Button>
        </div>
      </div>
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-130">
          <DialogHeader>
            <DialogTitle><Sparkles className="mr-2 inline h-5 w-5 text-amber-500" />Assinatura FocusStudy</DialogTitle>
            <DialogDescription>Pagamento seguro processado pelo Mercado Pago.</DialogDescription>
          </DialogHeader>
          <MercadoPagoSubscriptionBrick plan={plan} userEmail={userEmail} onSuccess={() => { setShowCheckout(false); window.location.reload() }} />
        </DialogContent>
      </Dialog>
    </>
  )
}
