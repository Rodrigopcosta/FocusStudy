"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Note, Discipline } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Star, MoreHorizontal, Trash2, Search, X } from "lucide-react"

interface NotesListProps {
  notes: Note[]
  disciplines: Discipline[]
}

export function NotesList({ notes, disciplines }: NotesListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")

  const disciplineFilter = searchParams.get("discipline") || "all"
  const importantFilter = searchParams.get("important") || "all"

  const filteredNotes = notes.filter((note) => {
    if (disciplineFilter !== "all" && note.discipline_id !== disciplineFilter) return false
    if (importantFilter === "true" && !note.is_important) return false
    if (
      searchQuery &&
      !note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all" || value === "") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/dashboard/notes?${params.toString()}`)
  }

  const handleToggleImportant = async (noteId: string, isImportant: boolean) => {
    const supabase = createClient()
    await supabase.from("notes").update({ is_important: !isImportant }).eq("id", noteId)
    router.refresh()
  }

  const handleDeleteNote = async (noteId: string) => {
    const supabase = createClient()
    await supabase.from("notes").delete().eq("id", noteId)
    router.refresh()
  }

  const clearFilters = () => {
    setSearchQuery("")
    router.push("/dashboard/notes")
  }

  const hasFilters = searchParams.has("discipline") || searchParams.has("important") || searchQuery

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={disciplineFilter} onValueChange={(v) => updateFilter("discipline", v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Disciplina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas disciplinas</SelectItem>
            {disciplines.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.icon} {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={importantFilter} onValueChange={(v) => updateFilter("important", v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Importancia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="true">Importantes</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {notes.length === 0
                ? "Nenhuma nota criada ainda. Crie sua primeira nota!"
                : "Nenhuma nota encontrada com os filtros selecionados."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="group hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/dashboard/notes/${note.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium truncate group-hover:text-primary transition-colors">{note.title}</h3>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleImportant(note.id, note.is_important)}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          note.is_important ? "text-chart-4 fill-chart-4" : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteNote(note.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                  {note.content || "Sem conteudo"}
                </p>
                <div className="flex items-center justify-between">
                  {note.discipline ? (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${note.discipline.color}20`,
                        color: note.discipline.color,
                      }}
                    >
                      {note.discipline.icon} {note.discipline.name}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.updated_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
