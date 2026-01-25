import { createClient } from "@/lib/supabase/client"

export const GamificationService = {
  // Adiciona XP e verifica subida de nível
  async addXP(userId: string, amount: number) {
    const supabase = createClient()
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', userId)
      .single()

    if (!profile) return

    const newXP = profile.xp + amount
    const newLevel = Math.floor(newXP / 1000) + 1

    await supabase
      .from('profiles')
      .update({ 
        xp: newXP, 
        level: newLevel,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)

    return { newXP, newLevel, leveledUp: newLevel > profile.level }
  },

  // Desbloqueia uma medalha
  async unlockBadge(userId: string, badgeId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('user_badges')
      .insert({ user_id: userId, badge_id: badgeId })

    if (!error) {
      // Bônus por conquista: 500 XP
      await this.addXP(userId, 500)
    }
  }
}