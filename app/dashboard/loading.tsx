// arquivo: app/dashboard/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-50" />
        <Skeleton className="h-10 w-30" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Cards de estatísticas */}
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Áreas de conteúdo principal */}
        <Skeleton className="h-100 w-full rounded-xl" /> {/* Atualizado para h-100 */}
        <Skeleton className="h-100 w-full rounded-xl" />
      </div>
    </div>
  )
}