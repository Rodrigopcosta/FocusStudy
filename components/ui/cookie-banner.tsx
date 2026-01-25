"use client"

import { useState, useEffect } from "react"
import { Cookie, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // Garante que o código só rode no navegador
    const consent = localStorage.getItem("focusstudy-cookie-consent")
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("focusstudy-cookie-consent", "accepted")
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("focusstudy-cookie-consent", "declined")
    setIsVisible(false)
  }

  // Evita erro de hidratação (renderização desigual entre servidor e cliente)
  if (!mounted || !isVisible) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 z-100 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="max-w-4xl mx-auto bg-card/80 backdrop-blur-xl border-2 border-primary/20 p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 cursor-help group">
            <Cookie className="h-8 w-8 text-primary animate-pulse group-hover:scale-110 transition-transform" />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h4 className="text-lg font-black uppercase italic tracking-tighter flex items-center justify-center md:justify-start gap-2">
              Controle de Privacidade <ShieldCheck className="h-4 w-4 text-primary" />
            </h4>
            <p className="text-[11px] md:text-xs text-muted-foreground font-bold uppercase italic leading-relaxed">
              Nós utilizamos cookies para personalizar sua experiência, analisar tráfego e garantir a segurança das suas transações. 
              Ao clicar em aceitar, você concorda com nossa{" "}
              <Link 
                href="/privacy" 
                className="text-primary underline decoration-2 underline-offset-4 cursor-pointer hover:text-primary/80 transition-colors"
              >
                Política de Privacidade
              </Link>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Button 
              variant="ghost" 
              onClick={handleDecline}
              className="w-full sm:w-auto text-[10px] font-black uppercase italic tracking-widest hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
            >
              Recusar
            </Button>
            <Button 
              onClick={handleAccept}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase italic px-8 h-12 rounded-full shadow-lg shadow-primary/20 cursor-pointer transition-all active:scale-95"
            >
              Aceitar Cookies
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}