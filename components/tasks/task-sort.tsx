"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"

export type SortOption = "priority-desc" | "priority-asc" | "newest" | "oldest"

interface TaskSortProps {
  value: string
  onValueChange: (value: SortOption) => void
}

export function TaskSort({ value, onValueChange }: TaskSortProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
        <ArrowUpDown className="h-3 w-3" /> Ordenar por:
      </span>
      <Select value={value} onValueChange={(v) => onValueChange(v as SortOption)}>
        <SelectTrigger className="w-47.5 h-9 text-xs bg-background shadow-sm">
          <SelectValue placeholder="Selecione a ordem..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest" className="text-xs font-medium">
            Data/Hora: Mais Recentes
          </SelectItem>
          <SelectItem value="oldest" className="text-xs font-medium">
            Data/Hora: Mais Antigas
          </SelectItem>
          <SelectItem value="priority-desc" className="text-xs font-medium">
            Prioridade: Alta para Baixa
          </SelectItem>
          <SelectItem value="priority-asc" className="text-xs font-medium">
            Prioridade: Baixa para Alta
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}