"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Note, Discipline } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Star, Loader2 } from "lucide-react"
import Link from "next/link"
import { useDebouncedCallback } from "use-debounce"

interface NoteEditorProps {
  note: Note
  disciplines: Discipline[]
}

export function NoteEditor({ note, disciplines }: NoteEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [disciplineId, setDisciplineId] = useState(note.discipline_id || "")
  const [topic, setTopic] = useState(note.topic || "")
  const [isImportant, setIsImportant] = useState(note.is_important)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const saveNote = useCallback(
    async (updates: Partial<Note>) => {
      setIsSaving(true)
      const supabase = createClient()
      await supabase
        .from("notes")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", note.id)
      setLastSaved(new Date())
      setIsSaving(false)
    },
    [note.id],
  )

  const debouncedSave = useDebouncedCallback(saveNote, 1000)

  const handleContentChange = (value: string) => {
    setContent(value)
    debouncedSave({ content: value })
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    debouncedSave({ title: value })
  }

  const handleTopicChange = (value: string) => {
    setTopic(value)
    debouncedSave({ topic: value || null })
  }

  const handleDisciplineChange = (value: string) => {
    setDisciplineId(value)
    saveNote({ discipline_id: value || null })
  }

  const handleToggleImportant = () => {
    const newValue = !isImportant
    setIsImportant(newValue)
    saveNote({ is_important: newValue })
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/notes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
            placeholder="Título da nota"
          />
        </div>
        <div className="flex items-center gap-2">
          {isSaving ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Salvando...
            </span>
          ) : lastSaved ? (
            <span className="text-xs text-muted-foreground">Salvo às {lastSaved.toLocaleTimeString("pt-BR")}</span>
          ) : null}
          <Button variant="ghost" size="icon" onClick={handleToggleImportant}>
            <Star className={`h-4 w-4 ${isImportant ? "text-chart-4 fill-chart-4" : "text-muted-foreground"}`} />
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 py-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Disciplina:</span>
          <Select value={disciplineId} onValueChange={handleDisciplineChange}>
            <SelectTrigger className="w-45 h-8">
              <SelectValue placeholder="Selecione..." />
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tópico:</span>
          <Input
            value={topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="h-8 w-50"
            placeholder="Ex: Art. 5"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 py-4">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={`Comece a escrever suas anotações...

Dica: use Markdown para formatar seu texto:
- **negrito** para destacar
- *itálico* para ênfase
- # Títulos para organizar
- - listas para enumerar`}
          className="h-full resize-none border-none shadow-none focus-visible:ring-0 text-base leading-relaxed"
        />
      </div>
    </div>
  )
}
