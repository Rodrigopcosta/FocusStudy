"use client"

import { useState, useEffect } from "react"
import { Brain, Plus, Sparkles, Trash2, Save, Loader2, CheckCircle, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { UpgradeModal } from "@/components/dashboard/upgrade-modal"

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
    const [planType, setPlanType] = useState<string | null>(null)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const [disciplinesRes, profileRes] = await Promise.all([
                supabase.from("disciplines").select("id, name, icon").eq("user_id", user.id).order("name"),
                supabase.from("profiles").select("plan_type").eq("id", user.id).single()
            ])

            if (disciplinesRes.data) setDisciplines(disciplinesRes.data)
            if (profileRes.data) setPlanType(profileRes.data.plan_type)
        }
        fetchData()
    }, [supabase])

    const handleGenerate = async () => {
        if (!content) return;

        if (planType !== 'pro' && planType !== 'ultimate') {
            setShowUpgradeModal(true);
            return;
        }

        setIsGenerating(true);
        setIsSaved(false);

        try {
            const response = await fetch("/api/ai/generate-flashcards", {
                method: "POST",
                body: JSON.stringify({ text: content }),
                headers: { "Content-Type": "application/json" },
            });

            // Tenta ler o corpo da resposta com segurança
            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                data = null;
            }

            // Se a resposta NÃO for OK (400, 401, 500, etc)
            if (!response.ok) {
                const errorMessage = data?.message || data?.error || "Erro desconhecido na geração";

                if (data?.error === 'invalid_content' || response.status === 400) {
                    toast.error("Conteúdo Inválido", {
                        description: data?.message || "O texto não possui informações claras para criar estudos."
                    });
                    return; // Interrompe a execução aqui de forma limpa
                }

                throw new Error(errorMessage);
            }

            // Se a resposta for OK (200)
            if (data?.flashcards) {
                setFlashcards(data.flashcards);
                toast.success(`${data.flashcards.length} cards gerados!`);
            } else {
                throw new Error("A IA retornou um formato inesperado.");
            }

        } catch (error: any) {
            console.error("Erro na Requisição:", error);
            toast.error("Falha ao gerar cards", {
                description: error.message || "Verifique sua conexão ou tente novamente."
            });
        } finally {
            setIsGenerating(false);
        }
    };

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

    const updateCard = (index: number, field: keyof Flashcard, value: string) => {
        const newCards = [...flashcards]
        newCards[index][field] = value
        setFlashcards(newCards)
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-400 mx-auto">
            <UpgradeModal isOpen={showUpgradeModal} onClose={setShowUpgradeModal} />

            <div className="flex flex-col gap-1">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase italic flex items-center gap-3 text-foreground">
                    <Layers className="h-7 w-7 md:h-8 md:w-8 text-primary" /> Flashcards
                </h2>
                <p className="text-muted-foreground text-sm md:text-base font-medium">Gere e gerencie seu material de estudo.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="lg:sticky lg:top-8 z-10 bg-background">
                    <Card className="border-2 shadow-sm">
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-black uppercase italic tracking-tighter">
                                <Sparkles className="h-5 w-5 text-blue-500" />
                                Entrada de Conteúdo
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm font-medium italic">Cole o texto para a IA processar.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                            <Textarea
                                placeholder="Cole aqui o conteúdo..."
                                className="min-h-62.5 lg:min-h-125 resize-none text-base leading-relaxed bg-background border-primary/20 focus-visible:ring-primary/30"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            <Button
                                className="w-full h-14 md:h-16 text-sm md:text-lg font-black uppercase tracking-tight cursor-pointer shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] bg-primary"
                                onClick={handleGenerate}
                                disabled={isGenerating || !content}
                            >
                                {isGenerating ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...</>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        <span className="hidden sm:inline italic font-black">Gerar Flashcards Inteligentes</span>
                                        <span className="sm:hidden">Gerar Flashcards</span>
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full">
                    <Card className="border-2 shadow-md min-h-100 flex flex-col">
                        <CardHeader className="border-b bg-muted/30 p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 uppercase tracking-tighter italic text-lg md:text-xl font-black">
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
                                    <p className="text-sm font-black uppercase tracking-widest text-center px-4">Aguardando geração inteligente...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="divide-y divide-border">
                                        {flashcards.map((card, index) => (
                                            <div key={index} className="p-5 md:p-8 hover:bg-accent/30 transition-colors border-b last:border-0">
                                                <div className="space-y-4">
                                                    {/* Campo da Frente com Máscara Visual */}
                                                    <div className="flex flex-col gap-2">
                                                        <span className="shrink-0 text-[10px] font-black bg-blue-500 text-white px-2 py-0.5 rounded w-fit shadow-sm uppercase">Frente</span>
                                                        <textarea
                                                            className="w-full bg-transparent border-none focus:ring-1 focus:ring-primary/30 rounded p-1 text-sm md:text-base font-bold leading-relaxed resize-none"
                                                            // Exibe ____ se não estiver focado, facilitando a leitura
                                                            value={card.front.replace(/\{\{.*?\}\}/g, "__________")}
                                                            onChange={(e) => {
                                                                updateCard(index, 'front', e.target.value)
                                                            }}
                                                            rows={2}
                                                            placeholder="Texto da frente..."
                                                        />
                                                    </div>

                                                    {/* Campo do Verso */}
                                                    <div className="flex flex-col gap-2">
                                                        <span className="shrink-0 text-[10px] font-black bg-purple-500 text-white px-2 py-0.5 rounded w-fit shadow-sm uppercase">Verso</span>
                                                        <input
                                                            className="w-full bg-transparent border-none focus:ring-1 focus:ring-primary/30 rounded p-1 text-sm md:text-base text-muted-foreground italic leading-relaxed"
                                                            value={card.back}
                                                            onChange={(e) => updateCard(index, 'back', e.target.value)}
                                                            placeholder="Resposta do verso..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 md:p-6 bg-muted/20 border-t mt-auto">
                                        <Button
                                            onClick={handleSaveToDatabase}
                                            disabled={isSaving || isSaved}
                                            className={`w-full h-14 md:h-16 text-sm md:text-lg font-black uppercase transition-all shadow-xl cursor-pointer ${isSaved ? "bg-green-500 hover:bg-green-500" : "bg-green-600 hover:bg-green-700"}`}
                                        >
                                            {isSaving ? (
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            ) : isSaved ? (
                                                <><CheckCircle className="mr-2 h-5 w-5" /> Salvo!</>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-5 w-5" />
                                                    <span>Salvar Cards</span>
                                                </>
                                            )}
                                        </Button>
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