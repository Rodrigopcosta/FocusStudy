"use client"

import { useState } from "react"
import { Brain, Plus, Sparkles, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface Flashcard {
  front: string
  back: string
}

export default function FlashcardsPage() {
  const [content, setContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])

  const handleGenerate = async () => {
    if (!content) return
    setIsGenerating(true)

    try {
      const response = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        body: JSON.stringify({ text: content }),
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      // Esperamos que a IA retorne { flashcards: [...] }
      setFlashcards(data.flashcards || [])
    } catch (error) {
      console.error("Erro ao gerar flashcards:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Flashcards</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Lado Esquerdo: Input de IA */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Gerador com IA
            </CardTitle>
            <CardDescription>
              Cole o texto da sua aula ou lei para transformar em flashcards automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Ex: O poder executivo é exercido pelo Presidente da República..."
              className="min-h-50 resize-none text-black"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button 
              className="w-full" 
              onClick={handleGenerate} 
              disabled={isGenerating || !content}
            >
              {isGenerating ? "Processando com IA..." : "Gerar Flashcards"}
            </Button>
          </CardContent>
        </Card>

        {/* Lado Direito: Preview/Lista */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Preview dos Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-100 overflow-y-auto pr-2">
              {flashcards.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Nenhum card gerado ainda.
                </div>
              ) : (
                flashcards.map((card, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-accent/50 relative group">
                    <p className="text-sm font-semibold">F: {card.front}</p>
                    <p className="text-sm text-muted-foreground mt-1">V: {card.back}</p>
                  </div>
                ))
              )}
            </div>
            {flashcards.length > 0 && (
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                Salvar no Banco de Dados
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}