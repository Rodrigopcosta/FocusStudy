'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Aqui carregamos o seu componente de 100 linhas apenas no navegador
const TasksChart = dynamic(
  () => import('./tasks-chart').then(mod => mod.TasksChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-75 w-full rounded-xl" />,
  }
)

interface TasksChartClientProps {
  completed: number
  pending: number
}

export function TasksChartClient({
  completed,
  pending,
}: TasksChartClientProps) {
  return <TasksChart completed={completed} pending={pending} />
}
