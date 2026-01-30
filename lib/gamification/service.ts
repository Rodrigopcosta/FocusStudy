import { createClient } from '@/lib/supabase/client'

export const GamificationService = {
  async addXP(userId: string, amount: number) {
    const supabase = createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level, streak_current')
      .eq('id', userId)
      .single()

    if (!profile) return null

    // Lógica de Multiplicador (Sincronizada com a UI da Jornada)
    let multiplier = 1.0
    if (profile.streak_current >= 15) multiplier = 2.0
    else if (profile.streak_current >= 7) multiplier = 1.5
    else if (profile.streak_current >= 3) multiplier = 1.2

    const boostedAmount = Math.round(amount * multiplier)
    const newXP = profile.xp + boostedAmount
    const newLevel = Math.floor(newXP / 1000) + 1

    const { error } = await supabase
      .from('profiles')
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error

    return {
      newXP,
      newLevel,
      leveledUp: newLevel > profile.level,
      boostedAmount, // Esta é a propriedade que o TS estava reclamando
    }
  },

  async unlockBadge(userId: string, badgeId: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('user_badges')
      .insert({ user_id: userId, badge_id: badgeId })

    if (!error) {
      await this.addXP(userId, 500) // Bônus fixo por conquista
    }
  },
}
