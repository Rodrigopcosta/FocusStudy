import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Note } from "@/types/database"
import { FileText, Plus, ArrowRight, Star } from "lucide-react"

interface RecentNotesProps {
  notes: Note[]
}

export function RecentNotes({ notes }: RecentNotesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Notas Recentes</CardTitle>
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
          <div className="grid gap-4 sm:grid-cols-2">
            {notes.map((note) => (
              <Link key={note.id} href={`/dashboard/notes/${note.id}`} className="group">
                <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">{note.title}</p>
                        {note.is_important && <Star className="h-4 w-4 text-chart-4 fill-chart-4 flex-shrink-0" />}
                      </div>
                      {note.discipline && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
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
