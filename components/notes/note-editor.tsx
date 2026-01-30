'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Note, Discipline } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Star,
  Loader2,
  Pin,
  Palette,
  Save,
  Check,
} from 'lucide-react'
import Link from 'next/link'
import { useDebouncedCallback } from 'use-debounce'

interface NoteEditorProps {
  note: Note
  disciplines: Discipline[]
}

const noteColors = [
  { name: 'Padrão', value: 'bg-background' },
  { name: 'Azul', value: 'bg-blue-100 dark:bg-blue-900/60' },
  { name: 'Verde', value: 'bg-emerald-100 dark:bg-emerald-900/60' },
  { name: 'Amarelo', value: 'bg-amber-100 dark:bg-amber-900/60' },
  { name: 'Roxo', value: 'bg-violet-100 dark:bg-violet-900/60' },
  { name: 'Vermelho', value: 'bg-red-100 dark:bg-red-900/60' },
]

export function NoteEditor({ note, disciplines }: NoteEditorProps) {
  const router = useRouter()
  const titleRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content || '')
  const [disciplineId, setDisciplineId] = useState(note.discipline_id || '')
  const [topic, setTopic] = useState(note.topic || '')
  const [isImportant, setIsImportant] = useState(note.is_important)
  const [isPinned, setIsPinned] = useState((note as any).is_pinned || false)
  const [color, setColor] = useState((note as any).color || 'bg-background')

  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Ajusta a altura do título automaticamente conforme o texto cresce
  const adjustTitleHeight = useCallback(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto'
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`
    }
  }, [])

  useEffect(() => {
    adjustTitleHeight()
  }, [title, adjustTitleHeight])

  const saveNote = useCallback(
    async (manualUpdates?: any) => {
      setIsSaving(true)
      const supabase = createClient()

      const dataToSave = {
        title,
        content,
        discipline_id: disciplineId || null,
        topic: topic || null,
        is_important: isImportant,
        is_pinned: isPinned,
        color: color,
        ...manualUpdates,
      }

      const { error } = await supabase
        .from('notes')
        .update({ ...dataToSave, updated_at: new Date().toISOString() })
        .eq('id', note.id)

      if (!error) {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        router.refresh()
      }
      setIsSaving(false)
    },
    [
      note.id,
      title,
      content,
      disciplineId,
      topic,
      isImportant,
      isPinned,
      color,
      router,
    ]
  )

  const debouncedSave = useDebouncedCallback(() => {
    saveNote()
  }, 2000)

  const handleChange = (type: string, value: any) => {
    setHasUnsavedChanges(true)
    if (type === 'title') setTitle(value)
    if (type === 'content') setContent(value)
    debouncedSave()
  }

  return (
    <div
      className={`min-h-[calc(100vh-8rem)] flex flex-col transition-all duration-500 rounded-xl p-4 md:p-8 border-2 shadow-sm ${color}`}
    >
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 pb-4 border-b border-black/10 dark:border-white/10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="shrink-0 h-10 w-10 mt-1"
            >
              <Link href="/dashboard/notes">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>

            {/* Título com Quebra de Linha Automática */}
            <textarea
              ref={titleRef}
              rows={1}
              value={title}
              onChange={e => handleChange('title', e.target.value)}
              className="w-full text-xl md:text-3xl font-black border-none shadow-none focus:outline-none bg-transparent uppercase placeholder:opacity-30 resize-none overflow-hidden py-1 leading-tight"
              placeholder="TÍTULO DA ANOTAÇÃO"
              style={{ minHeight: '40px' }}
            />
          </div>

          <div className="flex items-center justify-end gap-1 md:gap-2 shrink-0 bg-black/5 dark:bg-white/5 p-1 rounded-lg md:bg-transparent">
            <Button
              variant={hasUnsavedChanges ? 'default' : 'ghost'}
              size="sm"
              onClick={() => saveNote()}
              disabled={isSaving}
              className="h-9 font-bold uppercase text-[10px] px-3"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : hasUnsavedChanges ? (
                <Save className="h-3 w-3 mr-1" />
              ) : (
                <Check className="h-3 w-3 mr-1 text-green-500" />
              )}
              <span className="xs:inline ml-1">
                {hasUnsavedChanges ? 'Salvar' : 'Salvo'}
              </span>
            </Button>

            <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1 md:hidden" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Palette className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="p-3 grid grid-cols-3 gap-3"
                align="end"
              >
                {noteColors.map(c => (
                  <button
                    key={c.value}
                    onClick={() => {
                      setColor(c.value)
                      saveNote({ color: c.value })
                    }}
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${c.value} ${color === c.value ? 'border-primary shadow-md' : 'border-transparent'}`}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                setIsPinned(!isPinned)
                saveNote({ is_pinned: !isPinned })
              }}
            >
              <Pin
                className={`h-5 w-5 ${isPinned ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
              />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                setIsImportant(!isImportant)
                saveNote({ is_important: !isImportant })
              }}
            >
              <Star
                className={`h-5 w-5 ${isImportant ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Meta Dados */}
      <div className="grid grid-cols-1 md:flex md:flex-wrap items-center gap-4 md:gap-8 py-4 md:py-6 border-b border-black/5 dark:border-white/5">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          <span className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">
            Disciplina
          </span>
          <Select
            value={disciplineId}
            onValueChange={v => {
              setDisciplineId(v)
              saveNote({ discipline_id: v || null })
            }}
          >
            <SelectTrigger className="w-full md:w-48 h-9 bg-white/40 dark:bg-black/20 border-black/5 font-bold text-xs rounded-lg">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {disciplines.map(d => (
                <SelectItem key={d.id} value={d.id}>
                  {d.icon} {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          <span className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">
            Tópico
          </span>
          <Input
            value={topic}
            onChange={e => {
              setTopic(e.target.value)
              setHasUnsavedChanges(true)
              debouncedSave()
            }}
            className="h-9 w-full md:w-64 bg-white/40 dark:bg-black/20 border-black/5 font-bold text-xs rounded-lg"
            placeholder="Assunto da anotação..."
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 py-4 md:py-8">
        <Textarea
          value={content}
          onChange={e => handleChange('content', e.target.value)}
          placeholder="Comece a escrever..."
          className="h-full min-h-75 md:min-h-100 resize-none border-none shadow-none focus-visible:ring-0 text-base md:text-xl leading-relaxed bg-transparent font-medium placeholder:opacity-20"
        />
      </div>
    </div>
  )
}
