'use client'

import { motion } from 'framer-motion'

interface FlashcardViewProps {
  card: {
    id: string
    front: string
    back: string
  }
  isRevealed: boolean
}

export function FlashcardView({ card, isRevealed }: FlashcardViewProps) {
  return (
    <motion.div
      key={card?.id}
      className="bg-card border-4 border-accent rounded-[2.5rem] p-8 min-h-75 flex flex-col justify-center items-center text-center"
    >
      <div className="text-2xl md:text-3xl font-medium mb-6">
        {card?.front.replace(/\{\{|\}\}/g, '')}
      </div>
      {isRevealed && (
        <div className="pt-6 border-t w-full italic text-muted-foreground text-xl">
          {card?.back}
        </div>
      )}
    </motion.div>
  )
}
