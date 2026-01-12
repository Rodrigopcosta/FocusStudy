"use client"

import { useRouter, useSearchParams } from "next/navigation"
import type { Discipline } from "@/types/database"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

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
    <div className="flex flex-wrap items-center gap-3">
      <Select value={searchParams.get("status") || "all"} onValueChange={(value) => updateFilter("status", value)}>
        <SelectTrigger className="w-35">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pending">Pendentes</SelectItem>
          <SelectItem value="completed">Concluídas</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("discipline") || "all"}
        onValueChange={(value) => updateFilter("discipline", value)}
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Disciplina" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas disciplinas</SelectItem>
          {disciplines.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.icon} {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("priority") || "all"} onValueChange={(value) => updateFilter("priority", value)}>
        <SelectTrigger className="w-35">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="high">Alta</SelectItem>
          <SelectItem value="medium">Média</SelectItem>
          <SelectItem value="low">Baixa</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
