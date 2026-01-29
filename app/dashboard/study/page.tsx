"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { GamificationService } from "@/lib/gamification/service"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain, CheckCircle2, Loader2,
  Flame, ArrowRight,
  AlertCircle, Star, Zap, Plus,
  LayoutDashboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const BATCH_SIZE = 5;
const MAX_DAILY_NEW = 10;
const MAX_DAILY_REVIEWS = 20;

interface Flashcard {
  id: string
  front: string
  back: string
  interval: number
  ease_factor: number
  repetition_count: number
  next_review: string
  created_at: string
  subject?: string
}

interface StudyLog {
  type: 'new' | 'review'
}

export default function StudyPage() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [version, setVersion] = useState(0)
  const [xpFloating, setXpFloating] = useState({ show: false, val: 0 })
  const [dailyStats, setDailyStats] = useState({ newDone: 0, reviewsDone: 0 })

  const [categories, setCategories] = useState({
    recent: { count: 0 },
    errei: { count: 0 },
    dificil: { count: 0 },
    bom: { count: 0 },
    facil: { count: 0 }
  })

  const supabase = createClient()

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0];

    // Busca logs com tipagem correta
    const { data: logs } = await supabase
      .from("study_logs")
      .select("type")
      .eq("user_id", user.id)
      .gte("created_at", today)

    const typedLogs = (logs as StudyLog[]) || [];
    const newDoneCount = typedLogs.filter((l: StudyLog) => l.type === 'new').length;
    const reviewsDoneCount = typedLogs.filter((l: StudyLog) => l.type === 'review').length;
    
    setDailyStats({ newDone: newDoneCount, reviewsDone: reviewsDoneCount });

    const { data: allCards } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", user.id)

    if (allCards) {
      const typedCards = allCards as Flashcard[];
      setCategories({
        recent: { count: typedCards.filter((c: Flashcard) => c.repetition_count === 0).length },
        errei: { count: typedCards.filter((c: Flashcard) => c.repetition_count > 0 && c.ease_factor <= 1.5).length },
        dificil: { count: typedCards.filter((c: Flashcard) => c.repetition_count > 0 && c.ease_factor > 1.5 && c.ease_factor <= 2.0).length },
        bom: { count: typedCards.filter((c: Flashcard) => c.repetition_count > 0 && c.ease_factor > 2.0 && c.ease_factor <= 2.5).length },
        facil: { count: typedCards.filter((c: Flashcard) => c.repetition_count > 0 && c.ease_factor > 2.5).length }
      })
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData, version])

  const startSession = async (filter: string) => {
    if (filter === 'recent' && dailyStats.newDone >= MAX_DAILY_NEW) {
      toast.error("Limite de novos cards atingido!");
      return;
    }
    if (filter !== 'recent' && dailyStats.reviewsDone >= MAX_DAILY_REVIEWS) {
      toast.error("Limite de revisões atingido!");
      return;
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    let query = supabase.from("flashcards").select("*").eq("user_id", user?.id)

    if (filter === 'recent') {
      query = query.eq('repetition_count', 0).order('created_at', { ascending: false })
    } else {
      query = query.gt('repetition_count', 0)
      if (filter === 'errei') query = query.lte('ease_factor', 1.5)
      else if (filter === 'dificil') query = query.gt('ease_factor', 1.5).lte('ease_factor', 2.0)
      else if (filter === 'bom') query = query.gt('ease_factor', 2.0).lte('ease_factor', 2.5)
      else if (filter === 'facil') query = query.gt('ease_factor', 2.5)
    }

    const { data } = await query.limit(BATCH_SIZE)
    if (data && data.length > 0) {
      setCards(data)
      setSessionStarted(true)
      setCurrentIndex(0)
      setIsRevealed(false)
    }
    setLoading(false)
  }

  const handleFeedback = async (quality: number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const card = cards[currentIndex]
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !card) { setIsProcessing(false); return; }

    const isNewStudy = card.repetition_count === 0;

    try {
      let nextEase = card.ease_factor;
      let nextInterval = card.interval;
      if (quality === 1) { nextEase = 1.3; nextInterval = 1; }
      else if (quality === 2) { nextEase = 1.8; nextInterval = 2; }
      else if (quality === 3) { nextEase = 2.3; nextInterval = 4; }
      else if (quality === 4) { nextEase = 3.0; nextInterval = 7; }

      await supabase.from("flashcards").update({
        ease_factor: nextEase,
        interval: nextInterval,
        next_review: new Date(Date.now() + nextInterval * 86400000).toISOString(),
        repetition_count: card.repetition_count + 1,
        updated_at: new Date().toISOString()
      }).eq("id", card.id);

      await supabase.from("study_logs").insert({
        user_id: user.id,
        card_id: card.id,
        type: isNewStudy ? 'new' : 'review'
      });

      setDailyStats(prev => ({
        newDone: isNewStudy ? prev.newDone + 1 : prev.newDone,
        reviewsDone: !isNewStudy ? prev.reviewsDone + 1 : prev.reviewsDone
      }));

      const xpResult = await GamificationService.addXP(user.id, quality * 15)
      if (xpResult) setXpFloating({ show: true, val: xpResult.boostedAmount });
      setTimeout(() => setXpFloating({ show: false, val: 0 }), 800);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsRevealed(false);
      } else {
        finishSession();
      }
    } catch (e) {
      toast.error("Erro ao salvar.");
    } finally {
      setIsProcessing(false);
    }
  }

  const finishSession = () => {
    setSessionStarted(false);
    setVersion(v => v + 1);
    setIsProcessing(false);
  }

  if (loading && !sessionStarted) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  if (!sessionStarted) return (
    <div className="max-w-5xl mx-auto p-6 space-y-10 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-black uppercase italic flex items-center gap-3 tracking-tighter">
          <LayoutDashboard className="text-primary" size={28} /> Painel
        </h1>
        <div className="bg-accent/20 p-3 rounded-2xl border text-right">
          <p className="text-[10px] font-black uppercase opacity-50">Sessão Diária</p>
          <p className="text-xs font-bold text-primary italic">
            Novos: {dailyStats.newDone}/{MAX_DAILY_NEW} | Rev: {dailyStats.reviewsDone}/{MAX_DAILY_REVIEWS}
          </p>
        </div>
      </header>

      <Card 
        className={cn(
          "bg-accent/10 border-2 rounded-4xl cursor-pointer overflow-hidden transition-all",
          dailyStats.newDone >= MAX_DAILY_NEW && "opacity-50 grayscale pointer-events-none"
        )} 
        onClick={() => startSession('recent')}
      >
        <CardContent className="p-12 space-y-6">
          <h3 className="text-5xl font-black uppercase tracking-tighter">
            {dailyStats.newDone >= MAX_DAILY_NEW ? "Meta Batida!" : "Estudar Novos"}
          </h3>
          <p className="text-muted-foreground font-medium italic">
             {dailyStats.newDone >= MAX_DAILY_NEW 
              ? "Você já estudou os 10 cards novos de hoje." 
              : `Faltam ${MAX_DAILY_NEW - dailyStats.newDone} cards para a meta.`}
          </p>
          <Button className="bg-primary font-black rounded-2xl px-10 h-14 text-lg">
             {dailyStats.newDone >= MAX_DAILY_NEW ? "CONCLUÍDO" : "INICIAR"} <ArrowRight className="ml-2" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerformanceCard title="Errei" count={categories.errei.count} icon={<AlertCircle />} color="red" disabled={dailyStats.reviewsDone >= MAX_DAILY_REVIEWS} onClick={() => startSession('errei')} />
        <PerformanceCard title="Difícil" count={categories.dificil.count} icon={<Zap />} color="orange" disabled={dailyStats.reviewsDone >= MAX_DAILY_REVIEWS} onClick={() => startSession('dificil')} />
        <PerformanceCard title="Bom" count={categories.bom.count} icon={<Star />} color="green" disabled={dailyStats.reviewsDone >= MAX_DAILY_REVIEWS} onClick={() => startSession('bom')} />
        <PerformanceCard title="Fácil" count={categories.facil.count} icon={<CheckCircle2 />} color="blue" disabled={dailyStats.reviewsDone >= MAX_DAILY_REVIEWS} onClick={() => startSession('facil')} />
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col justify-center">
      <header className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={finishSession} className="font-black cursor-pointer">← VOLTAR</Button>
        <div className="font-black text-primary bg-primary/10 px-4 py-1 rounded-full">{currentIndex + 1} / {cards.length}</div>
      </header>
      <Progress value={(currentIndex / cards.length) * 100} className="h-2 mb-8" />
      <div className="relative">
        <AnimatePresence>
          {xpFloating.show && (
            <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -100 }} exit={{ opacity: 0 }} className="absolute left-1/2 -translate-x-1/2 z-50 bg-yellow-400 text-black px-6 py-2 rounded-full font-black border-2 border-black">
              +{xpFloating.val} XP
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div key={cards[currentIndex]?.id} className="bg-card border-4 border-accent rounded-[2.5rem] p-8 min-h-75 flex flex-col justify-center items-center text-center">
          <div className="text-2xl md:text-3xl font-medium mb-6">{cards[currentIndex]?.front.replace(/\{\{|\}\}/g, '')}</div>
          {isRevealed && <div className="pt-6 border-t w-full italic text-muted-foreground text-xl">{cards[currentIndex]?.back}</div>}
        </motion.div>
      </div>
      <footer className="mt-8 h-24">
        {!isRevealed ? (
          <Button onClick={() => setIsRevealed(true)} className="w-full h-full text-xl font-black rounded-3xl bg-primary uppercase italic">Mostrar Resposta</Button>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 h-full">
            <FeedbackBtn onClick={() => handleFeedback(1)} label="Errei" color="bg-red-500" disabled={isProcessing} />
            <FeedbackBtn onClick={() => handleFeedback(2)} label="Difícil" color="bg-orange-500" disabled={isProcessing} />
            <FeedbackBtn onClick={() => handleFeedback(3)} label="Bom" color="bg-green-600" disabled={isProcessing} />
            <FeedbackBtn onClick={() => handleFeedback(4)} label="Fácil" color="bg-blue-600" disabled={isProcessing} />
          </div>
        )}
      </footer>
    </div>
  )
}

function PerformanceCard({ title, count, icon, color, onClick, disabled }: any) {
  const styles: any = {
    red: "hover:border-red-500 text-red-500 bg-red-500/5",
    orange: "hover:border-orange-500 text-orange-500 bg-orange-500/5",
    green: "hover:border-green-500 text-green-500 bg-green-500/5",
    blue: "hover:border-blue-500 text-blue-500 bg-blue-500/5",
  }
  return (
    <Card className={cn("border-2 transition-all cursor-pointer bg-card rounded-3xl", styles[color], disabled && "opacity-40 grayscale pointer-events-none")} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-foreground/5 rounded-lg">{icon}</div>
        </div>
        <p className="text-3xl font-black text-foreground">{count}</p>
        <p className="text-[10px] font-black text-muted-foreground uppercase">{title}</p>
      </CardContent>
    </Card>
  )
}

function FeedbackBtn({ onClick, label, color, disabled }: any) {
  return (
    <Button disabled={disabled} onClick={onClick} className={cn("h-full font-black rounded-2xl text-white cursor-pointer uppercase italic text-sm", color)}>{label}</Button>
  )
}