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
import { toast } from "sonner"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]
const ICONS = ["📚", "⚖️", "📊", "🏛️", "💼", "🔬", "📝", "🎯", "💡", "🗂️"]

interface DisciplineManagerProps {
  disciplines: Discipline[]
  mode?: "manage" | "create"
  onOpenChange?: (open: boolean) => void
}

export function DisciplineManager({ disciplines, mode = "manage", onOpenChange }: DisciplineManagerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [icon, setIcon] = useState(ICONS[0])
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (onOpenChange) onOpenChange(val)
  }

  const handleCreate = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // CRÍTICO: Impede que o clique chegue no formulário pai

    if (!name.trim()) {
      setError("O nome é obrigatório")
      return
    }

    const isDuplicate = disciplines.some(
      (d) => d.name.toLowerCase().trim() === name.toLowerCase().trim()
    )

    if (isDuplicate) {
      setError("Já existe uma disciplina com este nome.")
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
    if (mode === "create") handleOpenChange(false)
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-primary font-bold gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Plus className="h-3 w-3" /> Nova
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <Settings2 className="h-3 w-3 mr-1" /> Gerenciar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent 
        className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.stopPropagation()} 
      >
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nova Disciplina" : "Gerenciar Disciplinas"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* DIV em vez de FORM para evitar submissão acidental do pai */}
          <div className="space-y-4">
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
              <div className="grid grid-cols-5 sm:flex sm:flex-wrap gap-2 justify-items-center">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full transition-all hover:scale-110 flex-shrink-0 ${
                      color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="grid grid-cols-5 sm:flex sm:flex-wrap gap-2 justify-items-center">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-11 h-11 sm:w-10 sm:h-10 rounded-lg text-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      icon === i ? "bg-primary/20 ring-2 ring-primary scale-110" : "bg-muted hover:bg-muted/80 opacity-70"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              type="button" // MUITO IMPORTANTE: type="button" não envia formulários
              onClick={handleCreate}
              className="w-full h-11 sm:h-10" 
              disabled={isLoading || !!error}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Salvar Disciplina
            </Button>
          </div>

          {mode === "manage" && disciplines.length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-xs font-semibold text-muted-foreground mb-3 block uppercase tracking-wider">
                Minhas Disciplinas ({disciplines.length})
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {disciplines.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 sm:p-2 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-6 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm font-medium">{d.icon} {d.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
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