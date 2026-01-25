"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ErrorPage({ error }: { error: Error }) {
  const router = useRouter()

  useEffect(() => {
    console.error("Erro capturado:", error)
    // Em caso de erro crítico, tenta voltar para a segurança da Home após 3s
    const timeout = setTimeout(() => {
      router.push("/")
      router.refresh()
    }, 3000)

    return () => clearTimeout(timeout)
  }, [error, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mx-auto mb-4" />
        <h1 className="text-lg font-black uppercase tracking-tighter italic">Falha na Conexão</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
          Reiniciando sessão segura...
        </p>
      </div>
    </div>
  )
}