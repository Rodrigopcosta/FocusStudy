"use client"

import { LayoutDashboard, ArrowRight, AlertCircle, Zap, Star, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function StudyDashboard({ dailyStats, categories, onStart, MAX_DAILY_NEW, MAX_DAILY_REVIEWS }: any) {
  return (
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
        onClick={() => onStart('recent')}
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
        <PerformanceItem title="Errei" count={categories.errei.count} icon={<AlertCircle />} color="red" disabled={dailyStats.reviewsDone >= MAX_DAILY_REVIEWS} onClick={() => onStart('errei')} />
        <PerformanceItem title="Difícil" count={categories.dificil.count} icon={<Zap />} color="orange" disabled={dailyStats.reviewsDone >= MAX_DAILY_REVIEWS} onClick={() => onStart('dificil')} />
        <PerformanceItem title="Bom" count={categories.bom.count} icon={<Star />} color="green" disabled={dailyStats.reviewsDone >= MAX_DAILY_REVIEWS} onClick={() => onStart('bom')} />
        <PerformanceItem title="Fácil" count={categories.facil.count} icon={<CheckCircle2 />} color="blue" disabled={dailyStats.reviewsDone >= MAX_DAILY_REVIEWS} onClick={() => onStart('facil')} />
      </div>
    </div>
  )
}

function PerformanceItem({ title, count, icon, color, onClick, disabled }: any) {
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