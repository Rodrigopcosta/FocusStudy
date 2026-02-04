"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Sparkles, Copy, Trash2, 
  ChevronRight, Brain, Loader2, ListChecks,
  AlignLeft, MessageSquareQuote, Download,
  ArrowLeft, Hash, ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Limite Premium: 50.000 caracteres (Aprox. 10k a 12k tokens)
const MAX_CHARS = 50000 

export default function SummaryPage() {
  const [inputText, setInputText] = useState("")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'short' | 'detailed' | 'bullets' | 'lines'>('bullets')
  const [lineCount, setLineCount] = useState(5)
  const [showLineOptions, setShowLineOptions] = useState(false)

  const lineOptions = [5, 12, 15, 20, 25, 30]

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      toast.error("Insira um texto para resumir.")
      return
    }

    setLoading(true)
    setSummary("")

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          mode: mode,
          lines: mode === 'lines' ? lineCount : undefined
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Erro na IA")

      setSummary(data.summary)
      toast.success("Resumo gerado!")
    } catch (error: any) {
      toast.error(error.message || "Falha ao gerar resumo.")
    } finally {
      setLoading(false)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    
    if (text.length > MAX_CHARS) {
      setInputText(text.substring(0, MAX_CHARS))
      toast.warning(`Limite Premium de ${MAX_CHARS.toLocaleString()} caracteres atingido. O excesso foi removido.`)
    } else {
      setInputText(text)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    toast.success("Copiado!")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20 animate-in fade-in duration-700">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <Link 
              href="/dashboard" 
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={12} /> Voltar ao Painel
            </Link>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Sparkles className="text-primary" size={32} /> Resumo Inteligente
            </h1>
            <p className="text-muted-foreground font-semibold">Sintetize conteúdos extensos com precisão acadêmica.</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => { setInputText(""); setSummary(""); }}
            className="rounded-xl border-2 font-black gap-2 hover:bg-destructive/10 cursor-pointer transition-all active:scale-95"
          >
            <Trash2 size={18} /> LIMPAR TUDO
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 px-2">
              <FileText size={14} /> Texto de Origem (Até 50k)
            </h2>
            
            <Card className="border-2 border-border bg-accent/5 rounded-4xl overflow-hidden focus-within:border-primary/50 transition-colors shadow-inner relative">
              <CardContent className="p-0 flex flex-col min-h-100">
                <div className="relative flex-1 flex flex-col">
                  <Textarea 
                    placeholder="Cole seu conteúdo acadêmico, artigos ou capítulos de livros aqui..."
                    className="flex-1 border-none bg-transparent resize-none p-8 text-lg font-medium focus-visible:ring-0 text-foreground cursor-text min-h-[450px]"
                    value={inputText}
                    onChange={handleTextChange}
                  />
                  
                  <div className="absolute bottom-4 right-6 pointer-events-none">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black border-2 backdrop-blur-md transition-all",
                      inputText.length >= MAX_CHARS 
                        ? "bg-destructive/10 border-destructive text-destructive" 
                        : "bg-background/50 border-border opacity-70"
                    )}>
                      {inputText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-border flex flex-wrap items-center gap-2 bg-accent/20">
                  <ModeTab active={mode === 'bullets'} onClick={() => setMode('bullets')} icon={<ListChecks size={16} />} label="Tópicos" />
                  <ModeTab active={mode === 'short'} onClick={() => setMode('short')} icon={<AlignLeft size={16} />} label="Curto" />
                  <ModeTab active={mode === 'detailed'} onClick={() => setMode('detailed')} icon={<MessageSquareQuote size={16} />} label="Completo" />
                  
                  <div className="relative">
                    <button
                      onClick={() => { setMode('lines'); setShowLineOptions(!showLineOptions); }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 cursor-pointer",
                        mode === 'lines' ? "bg-primary border-primary text-primary-foreground shadow-md" : "bg-transparent border-border text-muted-foreground hover:bg-accent/50"
                      )}
                    >
                      <Hash size={16} /> {mode === 'lines' ? `${lineCount} Linhas` : "Linhas"} <ChevronDown size={14} className={cn("transition-transform", showLineOptions && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {showLineOptions && mode === 'lines' && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowLineOptions(false)} />
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full mb-3 left-0 z-20 bg-card border-2 border-border p-2 rounded-2xl shadow-2xl min-w-[140px]"
                          >
                            <p className="text-[9px] font-black text-center mb-2 opacity-50 uppercase tracking-tighter">Escolha a extensão</p>
                            <div className="grid grid-cols-2 gap-1">
                              {lineOptions.map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => { setLineCount(opt); setShowLineOptions(false); }}
                                  className={cn(
                                    "p-2 rounded-lg text-xs font-black transition-colors cursor-pointer",
                                    lineCount === opt ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"
                                  )}
                                >
                                  {opt} lins.
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleSummarize} 
              disabled={loading || !inputText}
              className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl shadow-xl cursor-pointer disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2 italic uppercase tracking-widest">
                  <Loader2 className="animate-spin" /> Sintetizando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  GERAR RESUMO PREMIUM <ChevronRight />
                </span>
              )}
            </Button>
          </section>

          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 px-2">
              <Brain size={14} /> Resultado da Síntese
            </h2>

            <Card className="border-2 border-primary/20 bg-card rounded-[2.5rem] min-h-125 flex flex-col relative shadow-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                {summary ? (
                  <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col">
                    <div className="p-8 md:p-10 flex-1 text-xl font-serif leading-relaxed overflow-y-auto text-foreground/90 whitespace-pre-wrap selection:bg-primary/30">
                      {summary}
                    </div>
                    <div className="p-6 bg-accent/10 border-t border-border flex gap-3">
                      <Button onClick={copyToClipboard} variant="outline" className="flex-1 rounded-xl font-black gap-2 h-12 border-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all">
                        <Copy size={18} /> COPIAR
                      </Button>
                      <Button variant="outline" className="flex-1 rounded-xl font-black gap-2 h-12 border-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all">
                        <Download size={18} /> SALVAR
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                    <div className={cn(
                      "p-8 rounded-full bg-primary/5 transition-all duration-1000",
                      loading && "animate-pulse bg-primary/20 scale-110"
                    )}>
                      <Sparkles size={64} className={cn("text-primary transition-all", loading && "animate-spin")} />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest opacity-20 italic">
                      {loading ? "Processando grande volume de dados..." : "Aguardando seu conteúdo"}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}

function ModeTab({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 cursor-pointer",
        active 
          ? "bg-primary border-primary text-primary-foreground shadow-md scale-105" 
          : "bg-transparent border-border text-muted-foreground hover:bg-accent/50"
      )}
    >
      {icon} {label}
    </button>
  )
}