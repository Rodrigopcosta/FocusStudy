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
    <div className="flex justify-end items-center gap-2 mb-4">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <ArrowUpDown className="h-3 w-3" /> Ordenar por:
      </span>
      <Select value={value} onValueChange={(v) => onValueChange(v as SortOption)}>
        <SelectTrigger className="w-47.5 h-8 text-xs bg-background">
          <SelectValue placeholder="Ordenar por..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority-desc">Prioridade: Alta para Baixa</SelectItem>
          <SelectItem value="priority-asc">Prioridade: Baixa para Alta</SelectItem>
          <SelectItem value="newest">Criação: Mais Recentes</SelectItem>
          <SelectItem value="oldest">Criação: Mais Antigas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}