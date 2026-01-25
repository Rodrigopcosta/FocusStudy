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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, FilePlus2 } from "lucide-react"

interface CreateNoteDialogProps {
  disciplines: Discipline[]
  children: React.ReactNode
}

export function CreateNoteDialog({ disciplines, children }: CreateNoteDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [disciplineId, setDisciplineId] = useState<string>("")
  const [topic, setTopic] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase.from("notes").insert({
      user_id: user.id,
      title,
      discipline_id: disciplineId || null,
      topic: topic || null,
    }).select().single()

    setIsLoading(false)
    
    if (error) {
      console.error("Erro ao criar anotação:", error.message)
      return
    }

    setOpen(false)
    setTitle("")
    setDisciplineId("")
    setTopic("")

    if (data) {
      router.push(`/dashboard/notes/${data.id}`)
    } else {
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus2 className="h-5 w-5 text-primary" /> Nova Anotação
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-title" className="font-bold uppercase text-[10px] text-muted-foreground">
              Título da Anotação *
            </Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Resumo de Direito Administrativo"
              required
              className="font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold uppercase text-[10px] text-muted-foreground">
              Disciplina
            </Label>
            <Select value={disciplineId} onValueChange={setDisciplineId}>
              <SelectTrigger className="font-medium">
                <SelectValue placeholder="Selecione uma disciplina..." />
              </SelectTrigger>
              <SelectContent>
                {disciplines.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.icon} {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-topic" className="font-bold uppercase text-[10px] text-muted-foreground">
              Tópico / Assunto
            </Label>
            <Input
              id="note-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Atos Administrativos"
              className="font-medium"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="font-bold uppercase text-xs"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !title}
              className="font-bold uppercase text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...
                </>
              ) : (
                "Criar e Editar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}