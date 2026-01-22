import { Skeleton } from "@/components/ui/skeleton"

export default function PomodoroLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[624px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}