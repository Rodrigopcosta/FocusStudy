'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Note, Discipline } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreHorizontal,
  Trash2,
  Search,
  Pin,
  PinOff,
  Pencil,
  Move,
  ArrowUpDown,
  Palette,
} from 'lucide-react'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type OrderType = 'custom' | 'title' | 'date-desc' | 'date-asc'

interface NotesListProps {
  notes: Note[]
  disciplines: Discipline[]
}

const noteColors = [
  { name: 'Padrão', value: 'bg-card' },
  {
    name: 'Azul',
    value:
      'bg-blue-100 border-blue-300 dark:bg-blue-900/40 dark:border-blue-700',
  },
  {
    name: 'Verde',
    value:
      'bg-emerald-100 border-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-700',
  },
  {
    name: 'Amarelo',
    value:
      'bg-amber-100 border-amber-300 dark:bg-amber-900/40 dark:border-amber-700',
  },
  {
    name: 'Roxo',
    value:
      'bg-violet-100 border-violet-300 dark:bg-violet-900/40 dark:border-violet-700',
  },
  {
    name: 'Vermelho',
    value: 'bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700',
  },
]

function SortableNoteCard({
  note,
  handleUpdateNote,
  setNoteToDelete,
  isReorderMode,
  isDraggingAny,
  onMove,
  index,
  isLastInGroup,
}: any) {
  const [colorMenuOpen, setColorMenuOpen] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: note.id,
    disabled: typeof window !== 'undefined' && window.innerWidth < 768,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.4 : 1,
  }

  const router = useRouter()

  const handleNoteClick = (e: React.MouseEvent) => {
    // Se o usuário estiver tentando clicar em botões, não navega
    if (isDraggingAny || isReorderMode) {
      e.preventDefault()
      return
    }
    router.push(`/dashboard/notes/${note.id}`)
  }

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col h-full">
      <Card
        {...attributes}
        {...listeners}
        className={`relative h-full transition-all border-2 ${note.color || 'bg-card'} 
        ${note.is_pinned ? 'ring-2 ring-primary border-primary/40' : 'border-border'}`}
      >
        <CardContent className="p-4 md:p-5 flex flex-col h-full">
          {/* Topo: Título e Ações de Fixar/Menu */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div
              className="flex-1 min-w-0 z-30 relative"
              onClick={handleNoteClick}
            >
              <h3 className="font-black text-xs md:text-sm uppercase leading-tight whitespace-normal wrap-break-word group-hover:text-primary transition-colors">
                {note.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 z-40 relative shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-full active:scale-95 transition-transform ${note.is_pinned ? 'text-primary bg-primary/10' : 'text-muted-foreground opacity-50'}`}
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  handleUpdateNote(note.id, { is_pinned: !note.is_pinned })
                }}
              >
                {note.is_pinned ? (
                  <Pin className="h-4 w-4 fill-current" />
                ) : (
                  <PinOff className="h-4 w-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-black/5 active:bg-black/10"
                    onClick={e => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56"
                  onClick={e => e.stopPropagation()}
                >
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/notes/${note.id}`}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setNoteToDelete(note.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Conteúdo Meio */}
          <div
            onClick={handleNoteClick}
            className="flex-1 z-30 relative cursor-pointer mb-4"
          >
            <p className="text-xs text-muted-foreground line-clamp-3">
              {note.content || 'Sem descrição...'}
            </p>
          </div>

          {/* Rodapé: Data e Seletor de Cores */}
          <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5 z-40 relative">
            <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">
              {new Date(note.updated_at || note.created_at).toLocaleDateString(
                'pt-BR'
              )}
            </span>

            <DropdownMenu open={colorMenuOpen} onOpenChange={setColorMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-black/5 active:bg-black/10"
                  onClick={e => e.stopPropagation()}
                >
                  <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="p-3 grid grid-cols-3 gap-3"
                align="end"
                onClick={e => e.stopPropagation()}
              >
                {noteColors.map(c => (
                  <button
                    key={c.value}
                    title={c.name}
                    onClick={e => {
                      e.stopPropagation()
                      handleUpdateNote(note.id, { color: c.value })
                      setColorMenuOpen(false) // Fecha o menu após selecionar
                    }}
                    className={`h-7 w-7 rounded-full border border-black/10 transition-transform active:scale-125 ${c.value} ${note.color === c.value ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Reordenador Mobile */}
      {isReorderMode && !isLastInGroup && (
        <div className="flex justify-center -mb-6 mt-2 z-60 relative md:hidden">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-10 w-10 shadow-xl border-2 border-primary bg-background hover:bg-secondary animate-in zoom-in duration-200"
            onClick={() => onMove(index, index + 1)}
          >
            <ArrowUpDown className="h-5 w-5 text-primary" />
          </Button>
        </div>
      )}
      {isReorderMode && !isLastInGroup && <div className="h-4 md:hidden" />}
    </div>
  )
}

export function NotesList({
  notes: initialNotes,
  disciplines,
}: NotesListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [localNotes, setLocalNotes] = useState(initialNotes)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )
  const [orderBy, setOrderBy] = useState<OrderType>('custom')
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    setLocalNotes(initialNotes)
  }, [initialNotes])

  const processedNotes = useMemo(() => {
    const filtered = localNotes.filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return filtered.sort((a: any, b: any) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      if (orderBy === 'title') return a.title.localeCompare(b.title)
      if (orderBy === 'date-desc')
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      if (orderBy === 'date-asc')
        return (
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        )
      return (a.position || 0) - (b.position || 0)
    })
  }, [localNotes, searchQuery, orderBy])

  const saveNewOrder = async (newOrder: Note[]) => {
    setLocalNotes(newOrder)
    const updates = newOrder.map((note, index) => ({
      id: note.id,
      position: index,
      user_id: note.user_id,
    }))
    await supabase.from('notes').upsert(updates)
  }

  const handleManualMove = (oldIndex: number, newIndex: number) => {
    const updatedProcessed = arrayMove(processedNotes, oldIndex, newIndex)
    const newLocalNotes = [...localNotes]

    updatedProcessed.forEach((note, idx) => {
      const originalIdx = newLocalNotes.findIndex(n => n.id === note.id)
      if (originalIdx > -1) newLocalNotes[originalIdx].position = idx
    })

    saveNewOrder(
      newLocalNotes.sort(
        (a: any, b: any) => (a.position || 0) - (b.position || 0)
      )
    )
  }

  const handleUpdateNote = async (noteId: string, updates: any) => {
    setLocalNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, ...updates } : n))
    )
    await supabase.from('notes').update(updates).eq('id', noteId)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-11"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={orderBy}
            onValueChange={(v: OrderType) => setOrderBy(v)}
          >
            <SelectTrigger className="w-45 h-11">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Ordem Personalizada</SelectItem>
              <SelectItem value="title">Título (A-Z)</SelectItem>
              <SelectItem value="date-desc">Mais Recentes</SelectItem>
              <SelectItem value="date-asc">Mais Antigas</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={isReorderMode ? 'default' : 'outline'}
            onClick={() => {
              setIsReorderMode(!isReorderMode)
              if (!isReorderMode) setOrderBy('custom')
            }}
            className="md:hidden gap-2 h-11 font-bold uppercase text-[10px]"
          >
            <Move className="h-4 w-4" />
            {isReorderMode ? 'Salvar' : 'Mudar Ordem'}
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={e => {
          const { active, over } = e
          if (over && active.id !== over.id) {
            const oldIndex = processedNotes.findIndex(n => n.id === active.id)
            const newIndex = processedNotes.findIndex(n => n.id === over.id)
            if (
              processedNotes[oldIndex].is_pinned ===
              processedNotes[newIndex].is_pinned
            ) {
              handleManualMove(oldIndex, newIndex)
            }
          }
        }}
      >
        <SortableContext
          items={processedNotes.map(n => n.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {processedNotes.map(note => {
              const group = processedNotes.filter(
                n => n.is_pinned === note.is_pinned
              )
              const isLastInGroup = group[group.length - 1].id === note.id

              return (
                <SortableNoteCard
                  key={note.id}
                  note={note}
                  index={processedNotes.indexOf(note)}
                  isLastInGroup={isLastInGroup}
                  isReorderMode={isReorderMode}
                  onMove={handleManualMove}
                  handleUpdateNote={handleUpdateNote}
                  setNoteToDelete={setNoteToDelete}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      <AlertDialog
        open={!!noteToDelete}
        onOpenChange={() => setNoteToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Anotação?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await supabase.from('notes').delete().eq('id', noteToDelete)
                setLocalNotes(prev => prev.filter(n => n.id !== noteToDelete))
                setNoteToDelete(null)
                router.refresh()
              }}
              className="bg-destructive"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
