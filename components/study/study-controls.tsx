"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function StudyControls({ isRevealed, onReveal, onFeedback, isProcessing }: any) {
  return (
    <footer className="mt-8 h-24">
      {!isRevealed ? (
        <Button onClick={onReveal} className="w-full h-full text-xl font-black rounded-3xl bg-primary uppercase italic">
          Mostrar Resposta
        </Button>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 h-full">
          <Button disabled={isProcessing} onClick={() => onFeedback(1)} className="h-full font-black rounded-2xl text-white bg-red-500 uppercase italic text-sm">Errei</Button>
          <Button disabled={isProcessing} onClick={() => onFeedback(2)} className="h-full font-black rounded-2xl text-white bg-orange-500 uppercase italic text-sm">Difícil</Button>
          <Button disabled={isProcessing} onClick={() => onFeedback(3)} className="h-full font-black rounded-2xl text-white bg-green-600 uppercase italic text-sm">Bom</Button>
          <Button disabled={isProcessing} onClick={() => onFeedback(4)} className="h-full font-black rounded-2xl text-white bg-blue-600 uppercase italic text-sm">Fácil</Button>
        </div>
      )}
    </footer>
  )
}