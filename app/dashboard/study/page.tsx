"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { GamificationService } from "@/lib/gamification/service"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Eye, Keyboard, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface Flashcard {
  id: string
  front: string
  back: string
  interval: number
  ease_factor: number
  repetition_count: number
}

export default function StudyPage() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [xpFloating, setXpFloating] = useState<{ show: boolean; val: number }>({ show: false, val: 0 })
  
  const supabase = createClient()

  // Busca apenas os cards que precisam ser revisados hoje ou antes
  const fetchCards = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", user.id)
      .lte("next_review", new Date().toISOString())
      .order("next_review", { ascending: true })

    if (error) {
      toast.error("Erro ao carregar cards")
    } else {
      setCards(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  // Lógica de Cloze Deletion (Omissão de Palavras {{...}})
  const renderContent = (text: string, revealed: boolean) => {
    const parts = text.split(/(\{\{.*?\}\})/)
    return parts.map((part, i) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        const content = part.slice(2, -2)
        return (
          <span
            key={i}
            className={`px-2 rounded-md transition-all duration-500 font-bold ${
              revealed 
                ? "bg-blue-100 text-blue-700 border-b-2 border-blue-400" 
                : "bg-slate-800 text-transparent select-none cursor-pointer"
            }`}
            onClick={() => !revealed && setIsRevealed(true)}
          >
            {content}
          </span>
        )
      }
      return part
    })
  }

  const handleFeedback = async (quality: number) => {
    const card = cards[currentIndex]
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !card) return

    // Algoritmo SRS (Espaçamento)
    let newInterval: number
    let newEaseFactor = card.ease_factor

    if (quality < 3) {
      newInterval = 1 
      newEaseFactor = Math.max(1.3, card.ease_factor - 0.2)
    } else {
      // Bônus de intervalo baseado na qualidade
      const modifier = quality === 4 ? 2.5 : 1.5
      newInterval = Math.max(card.interval * modifier * card.ease_factor, 1)
      newEaseFactor = card.ease_factor + 0.1
    }

    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + Math.round(newInterval))

    // Gamificação: XP Base
    const baseXP = quality === 1 ? 5 : quality === 2 ? 10 : quality === 3 ? 20 : 30

    try {
      // 1. Atualiza o Card no Supabase
      const updateCard = supabase
        .from("flashcards")
        .update({
          interval: Math.round(newInterval),
          ease_factor: newEaseFactor,
          next_review: nextReview.toISOString(),
          repetition_count: card.repetition_count + 1
        })
        .eq("id", card.id)

      // 2. Adiciona XP (O serviço já calcula o bônus de streak internamente)
      const addXp = GamificationService.addXP(user.id, baseXP)

      const [_, xpResult] = await Promise.all([updateCard, addXp])

      // Efeito visual de XP
      if (xpResult) {
        setXpFloating({ show: true, val: xpResult.boostedAmount })
        setTimeout(() => setXpFloating({ show: false, val: 0 }), 1000)
      }

      // 3. Verifica Medalha (Flash Hunter - 50 revisões)
      if (card.repetition_count + 1 === 50) {
        await GamificationService.unlockBadge(user.id, 'flash-hunter')
        toast.success("🏅 Nova Medalha: Flash Hunter!")
      }

      // Passar para o próximo
      setIsRevealed(false)
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        setCards([]) // Finalizou a pilha
      }
    } catch (error) {
      toast.error("Erro ao salvar progresso")
    }
  }

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cards.length === 0) return
      
      if (e.code === "Space") {
        e.preventDefault()
        setIsRevealed(true)
      }
      
      if (isRevealed) {
        if (["1", "2", "3", "4"].includes(e.key)) {
          handleFeedback(parseInt(e.key))
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isRevealed, currentIndex, cards])

  if (loading) return (
    <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Organizando seus estudos...</p>
    </div>
  )

  if (cards.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="bg-green-500/10 p-6 rounded-full">
        <CheckCircle2 className="h-20 w-20 text-green-500" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Deck Limpo!</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">Você concluiu todas as revisões agendadas para este momento.</p>
      </div>
      <Button onClick={() => window.location.href = '/dashboard/flashcards'} variant="outline" className="rounded-full px-8">
        Gerar mais Flashcards
      </Button>
    </div>
  )

  const currentCard = cards[currentIndex]
  const progressPercent = ((currentIndex) / cards.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 relative">
      {/* Barra de Progresso Superior */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase">Restantes</p>
              <p className="text-xl font-black">{cards.length - currentIndex}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-primary uppercase">Sessão Atual</p>
            <p className="text-sm font-bold">{Math.round(progressPercent)}% Concluído</p>
          </div>
        </div>
        <Progress value={progressPercent} className="h-3 bg-secondary/50 border shadow-sm" />
      </div>

      {/* Area do Card */}
      <div className="relative min-h-100 flex flex-col items-center">
        
        {/* XP Floating Effect */}
        <AnimatePresence>
          {xpFloating.show && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -100 }}
              exit={{ opacity: 0 }}
              className="absolute z-50 flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full font-black shadow-xl"
            >
              <Sparkles className="h-4 w-4" /> +{xpFloating.val} XP
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-card border-2 border-primary/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 flex flex-col justify-center min-h-100 relative overflow-hidden"
        >
          {/* Tag de Lei Seca */}
          <div className="absolute top-6 left-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40">
            <Brain className="h-4 w-4" /> Modo Estudo Ativo
          </div>

          <div className="text-2xl md:text-3xl text-center leading-relaxed font-serif text-foreground selection:bg-primary/20">
            {renderContent(currentCard.front, isRevealed)}
          </div>

          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-10 pt-10 border-t-2 border-dashed border-primary/10 text-center"
              >
                <p className="text-xl md:text-2xl font-medium text-primary italic">
                  {currentCard.back}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Controles de Feedback */}
      <div className="max-w-2xl mx-auto w-full">
        {!isRevealed ? (
          <Button 
            className="w-full h-20 text-xl font-black uppercase tracking-tighter rounded-3xl shadow-lg hover:scale-[1.02] transition-transform"
            onClick={() => setIsRevealed(true)}
          >
            Mostrar Resposta <Eye className="ml-3 h-6 w-6" />
          </Button>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4">
            <Button onClick={() => handleFeedback(1)} variant="destructive" className="h-16 flex flex-col rounded-2xl">
              <span className="text-xs opacity-70">ERREI</span>
              <span className="font-bold">TECLA 1</span>
            </Button>
            <Button onClick={() => handleFeedback(2)} className="h-16 flex flex-col rounded-2xl bg-orange-500 hover:bg-orange-600">
              <span className="text-xs opacity-70">DIFÍCIL</span>
              <span className="font-bold">TECLA 2</span>
            </Button>
            <Button onClick={() => handleFeedback(3)} className="h-16 flex flex-col rounded-2xl bg-green-600 hover:bg-green-700">
              <span className="text-xs opacity-70">BOM</span>
              <span className="font-bold">TECLA 3</span>
            </Button>
            <Button onClick={() => handleFeedback(4)} className="h-16 flex flex-col rounded-2xl bg-blue-600 hover:bg-blue-700">
              <span className="text-xs opacity-70">FÁCIL</span>
              <span className="font-bold">TECLA 4</span>
            </Button>
          </div>
        )}
        
        <p className="text-center mt-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
          Dica: Use a BARRA DE ESPAÇO para revelar e os números 1 a 4 para responder
        </p>
      </div>
    </div>
  )
}