import { Skeleton } from "@/components/ui/skeleton"

export default function FocusLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      {/* Botão de fechar (topo direito) */}
      <Skeleton className="absolute top-4 right-4 h-10 w-10 rounded-md" />

      <div className="text-center space-y-8">
        {/* Badge de modo (Foco/Descanso) */}
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Círculo do Timer */}
        <div className="relative">
          <Skeleton className="w-80 h-80 rounded-full border-8 border-muted" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Skeleton className="h-16 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Botões de controle */}
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-11 w-32 rounded-md" />
          <Skeleton className="h-11 w-32 rounded-md" />
        </div>
      </div>
    </div>
  )
}