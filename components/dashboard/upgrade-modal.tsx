'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MercadoPagoSubscriptionBrick } from '@/components/payments/mercado-pago-subscription-brick'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: (open: boolean) => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-130">
        <DialogHeader>
          <DialogTitle><Sparkles className="mr-2 inline text-amber-500" />Potencialize seus estudos</DialogTitle>
          <DialogDescription>Assine com segurança pelo Mercado Pago.</DialogDescription>
        </DialogHeader>
        <MercadoPagoSubscriptionBrick plan="monthly" onSuccess={() => onClose(false)} />
        <Button variant="ghost" onClick={() => onClose(false)}>Talvez mais tarde</Button>
      </DialogContent>
    </Dialog>
  )
}
