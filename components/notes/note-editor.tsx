"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Note, Discipline } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Star, Loader2, Pin, Palette, Save, Check } from "lucide-react"
import Link from "next/link"
import { useDebouncedCallback } from "use-debounce"

interface NoteEditorProps {
  note: Note
  disciplines: Discipline[]
}

const noteColors = [
  { name: "Padrão", value: "bg-background" },
  { name: "Azul", value: "bg-blue-100 dark:bg-blue-900/60" },
  { name: "Verde", value: "bg-emerald-100 dark:bg-emerald-900/60" },
  { name: "Amarelo", value: "bg-amber-100 dark:bg-amber-900/60" },
  { name: "Roxo", value: "bg-violet-100 dark:bg-violet-900/60" },
  { name: "Vermelho", value: "bg-red-100 dark:bg-red-900/60" },
]

export function NoteEditor({ note, disciplines }: NoteEditorProps) {
  const router = useRouter()
  
  // Estados locais inicializados com os valores vindos do banco (note)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content || "")
  const [disciplineId, setDisciplineId] = useState(note.discipline_id || "")
  const [topic, setTopic] = useState(note.topic || "")
  const [isImportant, setIsImportant] = useState(note.is_important)
  const [isPinned, setIsPinned] = useState((note as any).is_pinned || false)
  const [color, setColor] = useState((note as any).color || "bg-background")
  
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Função centralizada para salvar no Supabase
  const saveNote = useCallback(async (manualUpdates?: any) => {
    setIsSaving(true)
    const supabase = createClient()
    
    // Unifica o estado local com atualizações disparadas por clique (como cor ou pin)
    const dataToSave = {
      title,
      content,
      discipline_id: disciplineId || null,
      topic: topic || null,
      is_important: isImportant,
      is_pinned: isPinned,
      color: color,
      ...manualUpdates
    }

    const { error } = await supabase
      .from("notes")
      .update({ ...dataToSave, updated_at: new Date().toISOString() })
      .eq("id", note.id)

    if (!error) {
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      router.refresh() // Força a atualização dos dados do servidor para manter o F5 íntegro
    }
    setIsSaving(false)
  }, [note.id, title, content, disciplineId, topic, isImportant, isPinned, color, router])

  // Debounce para evitar excesso de requisições ao digitar
  const debouncedSave = useDebouncedCallback(() => {
    saveNote()
  }, 2000)

  // Handler para inputs de texto
  const handleChange = (type: string, value: any) => {
    setHasUnsavedChanges(true)
    if (type === 'title') setTitle(value)
    if (type === 'content') setContent(value)
    debouncedSave()
  }

  // Handler para troca de cor com salvamento imediato
  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    saveNote({ color: newColor })
  }

  return (
    <div className={`min-h-[calc(100vh-10rem)] flex flex-col transition-all duration-500 rounded-xl p-4 md:p-8 border-2 shadow-sm ${color}`}>
      
      {/* Toolbar Superior */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2 flex-1">
          <Button variant="ghost" size="icon" asChild className="shrink-0 hover:bg-black/5 cursor-pointer">
            <Link href="/dashboard/notes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Input
            value={title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="text-2xl font-black border-none shadow-none focus-visible:ring-0 px-0 h-auto bg-transparent uppercase placeholder:opacity-30 cursor-text"
            placeholder="Título da Anotação"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status de Salvamento */}
          <div className="hidden md:flex flex-col items-end mr-2">
            {isSaving ? (
              <span className="text-[10px] font-black text-primary flex items-center gap-1 uppercase">
                <Loader2 className="h-3 w-3 animate-spin" /> Salvando...
              </span>
            ) : hasUnsavedChanges ? (
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">Alterações pendentes</span>
            ) : lastSaved && (
              <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Salvo às {lastSaved.toLocaleTimeString("pt-BR")}</span>
            )}
          </div>

          <Button 
            variant={hasUnsavedChanges ? "default" : "outline"} 
            size="sm" 
            onClick={() => saveNote()}
            disabled={isSaving}
            className="h-9 font-bold uppercase text-[10px] px-4 shadow-sm cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : hasUnsavedChanges ? <Save className="h-3 w-3 mr-1" /> : <Check className="h-3 w-3 mr-1 text-green-500" />}
            {hasUnsavedChanges ? "Salvar Agora" : "Sincronizado"}
          </Button>

          <div className="h-6 w-px bg-black/10 dark:bg-white/10 mx-2" />

          {/* Seletor de Cores */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-black/5 cursor-pointer"><Palette className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-3 grid grid-cols-3 gap-3" align="end">
              {noteColors.map((c) => (
                <button
                  key={c.value}
                  title={c.name}
                  onClick={() => handleColorChange(c.value)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${c.value} ${color === c.value ? 'border-primary shadow-md' : 'border-transparent'}`}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fixar e Importante */}
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-black/5 cursor-pointer" onClick={() => { setIsPinned(!isPinned); saveNote({ is_pinned: !isPinned }) }}>
            <Pin className={`h-5 w-5 ${isPinned ? "text-primary fill-primary" : "text-muted-foreground"}`} />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-black/5 cursor-pointer" onClick={() => { setIsImportant(!isImportant); saveNote({ is_important: !isImportant }) }}>
            <Star className={`h-5 w-5 ${isImportant ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
          </Button>
        </div>
      </div>

      {/* Meta Dados */}
      <div className="flex flex-wrap items-center gap-8 py-6 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Disciplina</span>
          <Select value={disciplineId} onValueChange={(v) => { setDisciplineId(v); saveNote({ discipline_id: v || null }) }}>
            <SelectTrigger className="w-48 h-9 bg-white/50 dark:bg-black/30 border-black/5 font-bold text-xs rounded-lg cursor-pointer">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {disciplines.map((d) => <SelectItem key={d.id} value={d.id} className="cursor-pointer">{d.icon} {d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Tópico</span>
          <Input
            value={topic}
            onChange={(e) => { setTopic(e.target.value); setHasUnsavedChanges(true); debouncedSave() }}
            className="h-9 w-64 bg-white/50 dark:bg-black/30 border-black/5 font-bold text-xs rounded-lg cursor-text"
            placeholder="Assunto da anotação..."
          />
        </div>
      </div>

      {/* Área do Conteúdo */}
      <div className="flex-1 py-8">
        <Textarea
          value={content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Comece a escrever seu conhecimento aqui..."
          className="h-full min-h-100 resize-none border-none shadow-none focus-visible:ring-0 text-xl leading-relaxed bg-transparent font-medium placeholder:opacity-20 cursor-text"
        />
      </div>
    </div>
  )
}