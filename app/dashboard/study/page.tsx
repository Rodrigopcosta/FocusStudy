'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GamificationService } from '@/lib/gamification/service'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

// Novos componentes
import { FlashcardView } from '@/components/study/flashcard-view'
import { StudyDashboard } from '@/components/study/study-dashboard'
import { StudyControls } from '@/components/study/study-controls'

const BATCH_SIZE = 5
const MAX_DAILY_NEW = 10
const MAX_DAILY_REVIEWS = 20

export default function StudyPage() {
  const [cards, setCards] = useState<any[]>([])
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
    facil: { count: 0 },
  })

  const supabase = createClient()

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data: logs } = await supabase
      .from('study_logs')
      .select('type')
      .eq('user_id', user.id)
      .gte('created_at', today)
    const typedLogs = (logs as any[]) || []
    setDailyStats({
      newDone: typedLogs.filter(l => l.type === 'new').length,
      reviewsDone: typedLogs.filter(l => l.type === 'review').length,
    })
    const { data: allCards } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', user.id)
    if (allCards) {
      setCategories({
        recent: {
          count: allCards.filter((c: any) => c.repetition_count === 0).length,
        },
        errei: {
          count: allCards.filter(
            (c: any) => c.repetition_count > 0 && c.ease_factor <= 1.5
          ).length,
        },
        dificil: {
          count: allCards.filter(
            (c: any) =>
              c.repetition_count > 0 &&
              c.ease_factor > 1.5 &&
              c.ease_factor <= 2.0
          ).length,
        },
        bom: {
          count: allCards.filter(
            (c: any) =>
              c.repetition_count > 0 &&
              c.ease_factor > 2.0 &&
              c.ease_factor <= 2.5
          ).length,
        },
        facil: {
          count: allCards.filter(
            (c: any) => c.repetition_count > 0 && c.ease_factor > 2.5
          ).length,
        },
      })
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData, version])

  const startSession = async (filter: string) => {
    if (filter === 'recent' && dailyStats.newDone >= MAX_DAILY_NEW)
      return toast.error('Limite atingido!')
    if (filter !== 'recent' && dailyStats.reviewsDone >= MAX_DAILY_REVIEWS)
      return toast.error('Limite atingido!')
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    let query = supabase.from('flashcards').select('*').eq('user_id', user?.id)
    if (filter === 'recent')
      query = query
        .eq('repetition_count', 0)
        .order('created_at', { ascending: false })
    else {
      query = query.gt('repetition_count', 0)
      if (filter === 'errei') query = query.lte('ease_factor', 1.5)
      else if (filter === 'dificil')
        query = query.gt('ease_factor', 1.5).lte('ease_factor', 2.0)
      else if (filter === 'bom')
        query = query.gt('ease_factor', 2.0).lte('ease_factor', 2.5)
      else if (filter === 'facil') query = query.gt('ease_factor', 2.5)
    }
    const { data } = await query.limit(BATCH_SIZE)
    if (data?.length) {
      setCards(data)
      setSessionStarted(true)
      setCurrentIndex(0)
      setIsRevealed(false)
    }
    setLoading(false)
  }

  const handleFeedback = async (quality: number) => {
    if (isProcessing) return
    setIsProcessing(true)
    const card = cards[currentIndex]
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !card) return setIsProcessing(false)
    try {
      const nextEase =
        quality === 1 ? 1.3 : quality === 2 ? 1.8 : quality === 3 ? 2.3 : 3.0
      const nextInt =
        quality === 1 ? 1 : quality === 2 ? 2 : quality === 3 ? 4 : 7
      await supabase
        .from('flashcards')
        .update({
          ease_factor: nextEase,
          interval: nextInt,
          next_review: new Date(Date.now() + nextInt * 86400000).toISOString(),
          repetition_count: card.repetition_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', card.id)
      await supabase.from('study_logs').insert({
        user_id: user.id,
        card_id: card.id,
        type: card.repetition_count === 0 ? 'new' : 'review',
      })
      const xp = await GamificationService.addXP(user.id, quality * 15)
      if (xp) setXpFloating({ show: true, val: xp.boostedAmount })
      setTimeout(() => setXpFloating({ show: false, val: 0 }), 800)
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(v => v + 1)
        setIsRevealed(false)
      } else {
        setSessionStarted(false)
        setVersion(v => v + 1)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading && !sessionStarted)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    )

  if (!sessionStarted)
    return (
      <StudyDashboard
        dailyStats={dailyStats}
        categories={categories}
        onStart={startSession}
        MAX_DAILY_NEW={MAX_DAILY_NEW}
        MAX_DAILY_REVIEWS={MAX_DAILY_REVIEWS}
      />
    )

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col justify-center">
      <header className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => setSessionStarted(false)}
          className="font-black"
        >
          ← VOLTAR
        </Button>
        <div className="font-black text-primary bg-primary/10 px-4 py-1 rounded-full">
          {currentIndex + 1} / {cards.length}
        </div>
      </header>
      <Progress
        value={(currentIndex / cards.length) * 100}
        className="h-2 mb-8"
      />
      <div className="relative">
        <AnimatePresence>
          {xpFloating.show && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -100 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 -translate-x-1/2 z-50 bg-yellow-400 text-black px-6 py-2 rounded-full font-black border-2 border-black"
            >
              +{xpFloating.val} XP
            </motion.div>
          )}
        </AnimatePresence>
        <FlashcardView card={cards[currentIndex]} isRevealed={isRevealed} />
      </div>
      <StudyControls
        isRevealed={isRevealed}
        onReveal={() => setIsRevealed(true)}
        onFeedback={handleFeedback}
        isProcessing={isProcessing}
      />
    </div>
  )
}
