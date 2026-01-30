'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, PomodoroMode, Theme } from '@/types/database'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

interface SettingsFormProps {
  profile: Profile | null
  userEmail: string
}

export function SettingsForm({ profile, userEmail }: SettingsFormProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>(
    profile?.pomodoro_mode || '25/5'
  )
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile?.notifications_enabled ?? true
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        pomodoro_mode: pomodoroMode,
        theme: theme as Theme,
        notifications_enabled: notificationsEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Erro ao salvar configurações')
    } else {
      toast.success('Configurações atualizadas!')
      router.refresh()
    }

    setIsLoading(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={userEmail} disabled />
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>Personalize sua experiência</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tema</Label>
              <p className="text-sm text-muted-foreground">
                Escolha a aparência do app
              </p>
            </div>
            <Select value={theme} onValueChange={value => setTheme(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo Pomodoro Padrão</Label>
              <p className="text-sm text-muted-foreground">
                Duração padrão das sessões
              </p>
            </div>
            <Select
              value={pomodoroMode}
              onValueChange={v => setPomodoroMode(v as PomodoroMode)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25/5">25/5 minutos</SelectItem>
                <SelectItem value="50/10">50/10 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações</Label>
              <p className="text-sm text-muted-foreground">
                Receber lembretes de estudo
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="destructive" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair da Conta
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Alterações
        </Button>
      </div>
    </div>
  )
}
