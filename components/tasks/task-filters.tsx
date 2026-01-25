"use client"

import { useRouter, useSearchParams } from "next/navigation"
import type { Discipline } from "@/types/database"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, Filter } from "lucide-react"

interface TaskFiltersProps {
  disciplines: Discipline[]
}

export function TaskFilters({ disciplines }: TaskFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/dashboard/tasks?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/dashboard/tasks")
  }

  const hasFilters = searchParams.has("status") || searchParams.has("discipline") || searchParams.has("priority")

  return (
    <div className="flex flex-wrap items-center gap-3 bg-accent/20 p-2 rounded-lg">
      <div className="flex items-center gap-2 text-muted-foreground mr-2">
        <Filter className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">Filtrar:</span>
      </div>

      <Select value={searchParams.get("status") || "all"} onValueChange={(value) => updateFilter("status", value)}>
        <SelectTrigger className="w-35 bg-card">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Status</SelectItem>
          <SelectItem value="pending">Pendentes</SelectItem>
          <SelectItem value="completed">Concluídas</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("discipline") || "all"}
        onValueChange={(value) => updateFilter("discipline", value)}
      >
        <SelectTrigger className="w-45 bg-card">
          <SelectValue placeholder="Disciplina" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas disciplinas</SelectItem>
          {disciplines.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              <span className="flex items-center gap-2">
                <span>{d.icon}</span>
                <span className="truncate">{d.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("priority") || "all"} onValueChange={(value) => updateFilter("priority", value)}>
        <SelectTrigger className="w-35 bg-card">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas Prioridades</SelectItem>
          <SelectItem value="urgent" className="text-red-600 font-bold">Urgente</SelectItem>
          <SelectItem value="high" className="text-orange-500 font-medium">Alta</SelectItem>
          <SelectItem value="medium" className="text-yellow-600">Média</SelectItem>
          <SelectItem value="low" className="text-blue-500">Baixa</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="destructive" size="sm" onClick={clearFilters} className="h-9 px-3">
          <X className="mr-1 h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  )
}