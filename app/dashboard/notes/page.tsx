'use client'

import { createClient } from '@/lib/supabase/client'
import { NotesList } from '@/components/notes/notes-list'
import { CreateNoteDialog } from '@/components/notes/create-note-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import type { Note, Discipline } from '@/types/database'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const [notesResponse, disciplinesResponse] = await Promise.all([
      supabase
        .from('notes')
        .select('*, discipline:disciplines(*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false }),
      supabase
        .from('disciplines')
        .select('*')
        .eq('user_id', user.id)
        .order('name'),
    ])

    setNotes(notesResponse.data || [])
    setDisciplines(disciplinesResponse.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anotações</h1>
          <p className="text-muted-foreground">
            Suas anotações de estudo organizadas
          </p>
        </div>

        <CreateNoteDialog disciplines={disciplines}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Anotação
          </Button>
        </CreateNoteDialog>
      </div>

      <NotesList notes={notes} disciplines={disciplines} />
    </div>
  )
}
