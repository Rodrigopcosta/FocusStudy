"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Discipline, StudyType } from "@/types/database"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]
const ICONS = ["📚", "⚖️", "📊", "🏛️", "💼", "🔬", "📝", "🎯", "💡", "🗂️", "🧮", "🌍", "📖", "💻", "🎨"]

interface EditDisciplineDialogProps {
  discipline: Discipline
  studyType: StudyType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditDisciplineDialog({ discipline, studyType, open, onOpenChange }: EditDisciplineDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [name, setName] = useState(discipline.name)
  const [color, setColor] = useState(discipline.color)
  const [icon, setIcon] = useState(discipline.icon)
  const [course, setCourse] = useState(discipline.course || "")
  const [subject, setSubject] = useState(discipline.subject || "")

  // UX: Estado para exibir erro de duplicidade no formulário
  const [duplicateError, setDuplicateError] = useState<string | null>(null)

  // Sincroniza os estados quando o dialog abre com uma disciplina diferente
  useEffect(() => {
    if (open) {
      setName(discipline.name)
      setColor(discipline.color)
      setIcon(discipline.icon)
      setCourse(discipline.course || "")
      setSubject(discipline.subject || "")
      setDuplicateError(null)
    }
  }, [open, discipline])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    setDuplicateError(null)
    setIsLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    // 1. Validação de Duplicidade:
    // Busca se existe OUTRA disciplina (id diferente) com o mesmo nome (ilike)
    const { data: existing } = await supabase
      .from("disciplines")
      .select("id")
      .eq("user_id", user.id)
      .ilike("name", trimmedName)
      .neq("id", discipline.id)
      .maybeSingle()

    if (existing) {
      const errorMsg = `Já existe outra disciplina chamada "${trimmedName}"`
      setDuplicateError(errorMsg)
      toast.error(errorMsg, {
        icon: <AlertCircle className="h-4 w-4" />
      })
      setIsLoading(false)
      return
    }

    // 2. Atualização
    const { error } = await supabase
      .from("disciplines")
      .update({
        name: trimmedName,
        color,
        icon,
        course: studyType === "college" ? course || null : null,
        subject: studyType === "college" ? subject || null : null,
      })
      .eq("id", discipline.id)

    if (error) {
      toast.error("Erro ao atualizar disciplina")
    } else {
      toast.success("Disciplina atualizada!")
      onOpenChange(false)
      router.refresh()
    }
    
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md w-[95vw] rounded-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Editar Disciplina</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label 
              htmlFor="edit-name"
              className={duplicateError ? "text-destructive" : ""}
            >
              Nome da disciplina *
            </Label>
            <Input 
              id="edit-name" 
              value={name} 
              onChange={(e) => {
                setName(e.target.value)
                if (duplicateError) setDuplicateError(null)
              }} 
              className={duplicateError ? "border-destructive focus-visible:ring-destructive" : ""}
              required 
            />
            {duplicateError && (
              <p className="text-[11px] text-destructive font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" /> {duplicateError}
              </p>
            )}
          </div>

          {studyType === "college" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-course">Curso</Label>
                <Input
                  id="edit-course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Ex: Engenharia de Software"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Matéria / Área</Label>
                <Input
                  id="edit-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Matemática"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
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
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-transform ${
                    icon === i ? "bg-primary/20 ring-2 ring-primary scale-110" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}