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
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [noteRes, disciplinesRes] = await Promise.all([
    supabase
      .from("notes")
      .select("*, discipline:disciplines(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("disciplines")
      .select("*")
      .eq("user_id", user.id)
      .order("name")
  ])

  if (!noteRes.data) redirect("/dashboard/notes")

  return <NoteEditor note={noteRes.data} disciplines={disciplinesRes.data || []} />
}