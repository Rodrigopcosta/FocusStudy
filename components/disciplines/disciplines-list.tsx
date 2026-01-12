"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Discipline, StudyType } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { EditDisciplineDialog } from "./edit-discipline-dialog"

interface DisciplinesListProps {
  disciplines: Discipline[]
  studyType: StudyType
}

export function DisciplinesList({ disciplines, studyType }: DisciplinesListProps) {
  const router = useRouter()
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null)
  const [deletingDiscipline, setDeletingDiscipline] = useState<Discipline | null>(null)

  const handleDelete = async () => {
    if (!deletingDiscipline) return

    const supabase = createClient()
    await supabase.from("disciplines").delete().eq("id", deletingDiscipline.id)
    setDeletingDiscipline(null)
    router.refresh()
  }

  if (disciplines.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Nenhuma disciplina criada ainda. Crie sua primeira disciplina para organizar seus estudos!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {disciplines.map((discipline) => (
          <Card key={discipline.id} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: discipline.color }} />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{discipline.icon}</span>
                  <div>
                    <h3 className="font-medium">{discipline.name}</h3>
                    {studyType === "college" && (discipline.course || discipline.subject) && (
                      <p className="text-sm text-muted-foreground">
                        {discipline.course && <span>{discipline.course}</span>}
                        {discipline.course && discipline.subject && <span> - </span>}
                        {discipline.subject && <span>{discipline.subject}</span>}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingDiscipline(discipline)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingDiscipline(discipline)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingDiscipline && (
        <EditDisciplineDialog
          discipline={editingDiscipline}
          studyType={studyType}
          open={!!editingDiscipline}
          onOpenChange={(open) => !open && setEditingDiscipline(null)}
        />
      )}

      <AlertDialog open={!!deletingDiscipline} onOpenChange={(open) => !open && setDeletingDiscipline(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir disciplina?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a disciplina "{deletingDiscipline?.name}"? As tarefas e notas vinculadas a
              ela não serão excluídas, mas perderão o vínculo com esta disciplina.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
