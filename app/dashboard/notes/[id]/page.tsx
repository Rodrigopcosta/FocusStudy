import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NoteEditor } from "@/components/notes/note-editor"

export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: note } = await supabase
    .from("notes")
    .select("*, discipline:disciplines(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!note) redirect("/dashboard/notes")

  const { data: disciplines } = await supabase.from("disciplines").select("*").eq("user_id", user.id).order("name")

  return <NoteEditor note={note} disciplines={disciplines || []} />
}
