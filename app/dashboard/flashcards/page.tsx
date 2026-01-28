"use client"

import { useState, useEffect } from "react"
import { Brain, Plus, Sparkles, Trash2, Save, Loader2, CheckCircle, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Flashcard {
    front: string
    back: string
}

interface Discipline {
    id: string
    name: string
    icon: string
}

export default function FlashcardsPage() {
    const [content, setContent] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [flashcards, setFlashcards] = useState<Flashcard[]>([])
    const [disciplines, setDisciplines] = useState<Discipline[]>([])
    const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("")

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function fetchDisciplines() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase.from("disciplines").select("id, name, icon").eq("user_id", user.id).order("name")
            if (data) setDisciplines(data)
        }
        fetchDisciplines()
    }, [supabase])

    const handleGenerate = async () => {
        if (!content) return
        setIsGenerating(true)
        setIsSaved(false)

        try {
            const response = await fetch("/api/ai/generate-flashcards", {
                method: "POST",
                body: JSON.stringify({ text: content }),
                headers: { "Content-Type": "application/json" },
            })

            const data = await response.json()
            setFlashcards(data.flashcards || [])
            toast.success(`${data.flashcards?.length || 0} cards gerados!`)
        } catch (error) {
            toast.error("Falha ao gerar cards.")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveToDatabase = async () => {

        setIsSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Não autenticado")

            const cardsWithUser = flashcards.map(card => ({
                ...card,
                user_id: user.id,
                next_review: new Date().toISOString(),
            }))

            const { error } = await supabase.from("flashcards").insert(cardsWithUser)
            if (error) throw error

            setIsSaved(true)
            toast.success("Cards salvos com sucesso!")
            setTimeout(() => {
                setFlashcards([])
                setIsSaved(false)
            }, 3000)
        } catch (error) {
            toast.error("Erro ao salvar no banco.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-400 mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase italic flex items-center gap-3 text-foreground">
                    <Layers className="h-7 w-7 md:h-8 md:w-8 text-primary" /> Flashcards
                </h2>
                <p className="text-muted-foreground text-sm md:text-base font-medium">Gere e gerencie seu material de estudo.</p>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Seção 1: Entrada de Texto - Sticky APENAS no Desktop (lg) */}
                <div className="lg:sticky lg:top-8 z-10 bg-background">
                    <Card className="border-2 shadow-sm">
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                <Sparkles className="h-5 w-5 text-blue-500" />
                                Entrada de Conteúdo
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm font-medium">Cole o texto para a IA processar.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                            <Textarea
                                placeholder="Cole aqui o conteúdo..."
                                className="min-h-62.5 lg:min-h-125 resize-none text-base leading-relaxed bg-background border-primary/20 focus-visible:ring-primary/30"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            <Button
                                className="w-full h-14 md:h-16 text-sm md:text-lg font-black uppercase tracking-tight cursor-pointer shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
                                onClick={handleGenerate}
                                disabled={isGenerating || !content}
                            >
                                {isGenerating ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...</>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        <span className="hidden sm:inline">Gerar Flashcards Inteligentes</span>
                                        <span className="sm:hidden">Gerar Flashcards</span>
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Seção 2: Preview dos Cards */}
                <div className="w-full">
                    <Card className="border-2 shadow-md min-h-100 flex flex-col">
                        <CardHeader className="border-b bg-muted/30 p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 uppercase tracking-tighter italic text-lg md:text-xl">
                                    <Brain className="h-5 w-5 text-purple-500" />
                                    Cards {flashcards.length > 0 && `(${flashcards.length})`}
                                </CardTitle>
                                {flashcards.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={() => setFlashcards([])} className="h-8 px-2 text-xs md:text-sm font-bold text-destructive hover:text-destructive/80 cursor-pointer">
                                        <Trash2 className="h-4 w-4 mr-1" /> Limpar
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col">
                            {flashcards.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-24 text-muted-foreground/50 italic">
                                    <Plus className="h-12 w-12 mb-3 opacity-20" />
                                    <p className="text-sm font-black uppercase tracking-widest">Aguardando geração...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="divide-y divide-border">
                                        {flashcards.map((card, index) => (
                                            <div key={index} className="p-5 md:p-8 hover:bg-accent/30 transition-colors">
                                                <div className="space-y-4">
                                                    <div className="flex gap-4">
                                                        <span className="shrink-0 text-[10px] font-black bg-blue-500 text-white px-2 py-0.5 rounded h-fit mt-1 shadow-sm">FRENTE</span>
                                                        <p className="text-sm md:text-base font-bold leading-relaxed text-foreground">{card.front}</p>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <span className="shrink-0 text-[10px] font-black bg-purple-500 text-white px-2 py-0.5 rounded h-fit mt-1 shadow-sm">VERSO</span>
                                                        <p className="text-sm md:text-base text-muted-foreground italic leading-relaxed">{card.back}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Botão de Salvar - Sticky apenas dentro deste card se necessário, mas aqui fixamos no final da lista */}
                                    <div className="p-4 md:p-6 bg-muted/20 border-t mt-auto">
                                        <Button
                                            onClick={handleSaveToDatabase}
                                            disabled={isSaving || isSaved}
                                            className={`w-full h-14 md:h-16 text-sm md:text-lg font-black uppercase transition-all shadow-xl cursor-pointer ${isSaved ? "bg-green-500 hover:bg-green-500" : "bg-green-600 hover:bg-green-700"
                                                }`}
                                        >
                                            {isSaving ? (
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            ) : isSaved ? (
                                                <><CheckCircle className="mr-2 h-5 w-5" /> Salvo!</>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-5 w-5" />
                                                    <span className="hidden sm:inline">Salvar no Banco de Dados</span>
                                                    <span className="sm:hidden">Salvar Agora</span>
                                                </>
                                            )}
                                        </Button>
                                        {isSaved && (
                                            <Button
                                                variant="link"
                                                className="w-full mt-4 text-green-600 font-black underline uppercase text-xs tracking-widest cursor-pointer"
                                                onClick={() => router.push("/dashboard/study")}
                                            >
                                                Ir para Estudos →
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}