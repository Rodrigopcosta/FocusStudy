"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: (open: boolean) => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDirectUpgrade = async () => {
    setIsLoading(true)
    
    // Usamos o plano mensal como padrão para o "Experimentar Grátis"
    const priceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
      
      const data = await response.json()
      
      if (data.url) {
        // Redireciona diretamente para o Stripe
        window.location.href = data.url
      } else {
        throw new Error("URL de checkout não recebida")
      }
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error)
      toast.error("Não foi possível iniciar o checkout. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-100 border-2 border-amber-500/20 shadow-2xl">
        <DialogHeader className="items-center text-center">
          <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <Sparkles className="h-7 w-7 text-amber-500 animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
            Potencialize seus Estudos
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-muted-foreground">
            A geração inteligente via IA é uma ferramenta exclusiva para membros **PRO**.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid gap-3">
            {[
              "Flashcards ilimitados com IA",
              "Resumos automáticos de conteúdo",
              "Ranking Global e Missões Diárias",
              "7 dias grátis (cancele quando quiser)"
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-tight cursor-pointer shadow-lg active:scale-95 transition-all"
              onClick={handleDirectUpgrade}
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparando...</>
              ) : (
                "Experimentar Grátis agora"
              )}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full font-bold text-muted-foreground uppercase text-xs tracking-widest cursor-pointer"
              onClick={() => onClose(false)}
              disabled={isLoading}
            >
              Talvez mais tarde
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}