"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { useState } from "react"

export function UpgradeBanner() {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      // Chamada para a sua API de checkout que já configuramos anteriormente
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          // Certifique-onse de que este ID de preço está no seu .env.local
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID 
        }),
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error("URL de checkout não retornada")
      }
    } catch (error) {
      console.error("Erro ao iniciar checkout", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleUpgrade} 
      disabled={isLoading}
      className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-none shadow-lg animate-pulse hover:animate-none"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Ativar IA & Resumos (7 dias grátis)
    </Button>
  )
}