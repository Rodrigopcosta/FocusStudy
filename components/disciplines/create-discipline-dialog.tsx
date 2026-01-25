"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { StudyType } from "@/types/database"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]
const ICONS = ["📚", "⚖️", "📊", "🏛️", "💼", "🔬", "📝", "🎯", "💡", "🗂️", "🧮", "🌍", "📖", "💻", "🎨"]

interface CreateDisciplineDialogProps {
  children: React.ReactNode
  studyType: StudyType
}

export function CreateDisciplineDialog({ children, studyType }: CreateDisciplineDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [icon, setIcon] = useState(ICONS[0])
  const [course, setCourse] = useState("")
  const [subject, setSubject] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    // 1. Validação de Duplicidade (Case Insensitive)
    const { data: existing } = await supabase
      .from("disciplines")
      .select("id, name")
      .eq("user_id", user.id)
      .ilike("name", name.trim())
      .maybeSingle()

    if (existing) {
      toast.error(`A disciplina "${name}" já existe!`, {
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      })
      setIsLoading(false)
      return
    }

    // 2. Inserção
    const { error } = await supabase.from("disciplines").insert({
      user_id: user.id,
      name: name.trim(),
      color,
      icon,
      course: studyType === "college" ? course || null : null,
      subject: studyType === "college" ? subject || null : null,
    })

    if (error) {
      toast.error("Erro ao criar disciplina.")
    } else {
      toast.success("Disciplina criada!")
      setOpen(false)
      setName("")
      setCourse("")
      setSubject("")
      router.refresh()
    }
    
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent 
        className="max-w-md w-[95vw] rounded-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Nova Disciplina</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da disciplina *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={studyType === "college" ? "Ex: Cálculo I" : "Ex: Direito Constitucional"}
              required
            />
          </div>

          {studyType === "college" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="course">Curso</Label>
                <Input
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Ex: Engenharia de Software"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Matéria / Área</Label>
                <Input
                  id="subject"
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}