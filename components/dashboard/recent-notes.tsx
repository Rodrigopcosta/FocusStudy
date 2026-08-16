import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Note } from '@/types/database'
import { FileText, Plus, ArrowRight, Star } from 'lucide-react'

interface RecentNotesProps {
  notes: Note[]
}

export function RecentNotes({ notes }: RecentNotesProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex min-w-0 flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="min-w-0 text-lg">Notas Recentes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/notes">
            Ver todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Nenhuma nota ainda</p>
            <Button asChild>
              <Link href="/dashboard/notes">
                <Plus className="mr-2 h-4 w-4" />
                Criar nota
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {notes.map(note => (
              <Link
                key={note.id}
                href={`/dashboard/notes/${note.id}`}
                className="group block min-w-0"
              >
                <div className="min-w-0 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="min-w-0 flex-1 truncate font-medium transition-colors group-hover:text-primary">
                          {note.title}
                        </p>
                        {note.is_important && (
                          <Star className="h-4 w-4 text-chart-4 fill-chart-4 shrink-0" />
                        )}
                      </div>
                      {note.discipline && (
                        <span
                          className="mt-1 inline-block max-w-full truncate rounded-full px-2 py-0.5 text-xs"
                          style={{
                            backgroundColor: `${note.discipline.color}20`,
                            color: note.discipline.color,
                          }}
                        >
                          {note.discipline.icon} {note.discipline.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
