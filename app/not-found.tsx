// Força a página a ser entregue como um HTML estático, sem processamento de servidor.
export const dynamic = 'force-static'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <head>
        {/* Redirecionamento via navegador: o método mais rápido que existe */}
        <meta httpEquiv="refresh" content="2;url=/dashboard" />
      </head>

      <div className="max-w-sm w-full space-y-6">
        {/* Header no seu padrão: Black + Italic */}
        <div className="space-y-1 text-center">
          <h1 className="text-7xl font-black italic tracking-tighter leading-none opacity-20">
            404
          </h1>
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            Fora do <span className="text-primary">Mapa</span>
          </h2>
        </div>

        {/* Card Simplificado (Padrão 3xl) */}
        <div className="bg-card border-2 border-primary/10 p-8 rounded-4xl shadow-2xl relative overflow-hidden">
          <p className="text-sm font-medium text-muted-foreground text-center relative z-10">
            Sua sessão está sendo reencaminhada para a base principal.
          </p>

          {/* Barra de progresso em CSS puro (Zero JS) */}
          <div className="mt-6 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-progress-fast" />
          </div>
        </div>

        {/* Footer Minimalista */}
        <p className="text-[10px] font-bold text-center text-muted-foreground/30 uppercase tracking-[0.4em]">
          FocusStudy // Redirecionando
        </p>
      </div>

      {/* CSS injetado diretamente para evitar carregar arquivos extras */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes progress-fast {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 2s linear forwards;
        }
      `,
        }}
      />
    </div>
  )
}
