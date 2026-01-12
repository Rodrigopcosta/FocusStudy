"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface TasksChartProps {
  completed: number
  pending: number
}

export function TasksChart({ completed, pending }: TasksChartProps) {
  const total = completed + pending

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progresso das Tarefas</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-50">
          <p className="text-muted-foreground text-sm text-center">Crie tarefas para ver seu progresso aqui</p>
        </CardContent>
      </Card>
    )
  }

  const data = [
    { name: "Concluídas", value: completed, color: "hsl(var(--chart-2))" },
    { name: "Pendentes", value: pending, color: "hsl(var(--chart-4))" },
  ]

  const percentage = Math.round((completed / total) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Progresso das Tarefas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-35 h-35">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} tarefas`, name]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            <div className="text-center">
              <p className="text-3xl font-bold">{percentage}%</p>
              <p className="text-sm text-muted-foreground">Concluído</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-chart-2" />
                <span className="text-muted-foreground">Concluídas:</span>
                <span className="font-medium">{completed}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-chart-4" />
                <span className="text-muted-foreground">Pendentes:</span>
                <span className="font-medium">{pending}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
