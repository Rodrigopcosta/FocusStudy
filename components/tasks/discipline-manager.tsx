"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Discipline } from "@/types/database"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Loader2, Settings2, AlertCircle } from "lucide-react"
import { toast } from "sonner" // Assumindo que você usa sonner, se não, use seu sistema de toast

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]
const ICONS = ["📚", "⚖️", "📊", "🏛️", "💼", "🔬", "📝", "🎯", "💡", "🗂️"]

interface DisciplineManagerProps {
  disciplines: Discipline[]
}

export function DisciplineManager({ disciplines }: DisciplineManagerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [icon, setIcon] = useState(ICONS[0])
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validação de Duplicidade (Case Insensitive)
    const isDuplicate = disciplines.some(
      (d) => d.name.toLowerCase().trim() === name.toLowerCase().trim()
    )

    if (isDuplicate) {
      setError("Já existe uma disciplina com este nome.")
      toast.error("Erro ao criar", { description: "Nome de disciplina já existe." })
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    const { error: dbError } = await supabase.from("disciplines").insert({
      user_id: user.id,
      name: name.trim(),
      color,
      icon,
    })

    if (dbError) {
      toast.error("Erro no banco de dados")
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setName("")
    toast.success("Disciplina criada com sucesso!")
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Isso excluirá a disciplina e poderá afetar tarefas vinculadas. Continuar?")) return
    
    const supabase = createClient()
    const { error } = await supabase.from("disciplines").delete().eq("id", id)
    
    if (error) {
      toast.error("Não foi possível excluir")
    } else {
      toast.success("Disciplina removida")
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) setError(null) // Limpa erro ao fechar
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
          <Settings2 className="h-3 w-3 mr-1" />
          Gerenciar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Disciplinas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discipline-name">Nome da disciplina</Label>
              <Input
                id="discipline-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="Ex: Direito Constitucional"
                required
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {error && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {error}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                      color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                      icon === i ? "bg-primary/20 ring-2 ring-primary scale-110" : "bg-muted hover:bg-muted/80 opacity-70"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !!error}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Adicionar Disciplina
            </Button>
          </form>

          {disciplines.length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-xs font-semibold text-muted-foreground mb-3 block uppercase tracking-wider">
                Minhas Disciplinas ({disciplines.length})
              </Label>
              <div className="space-y-2 max-h-50 overflow-y-auto pr-2">
                {disciplines.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/50 border border-transparent hover:border-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-6 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm font-medium">
                        {d.icon} {d.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(d.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}