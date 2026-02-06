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
import { Loader2, Save, LogOut, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

// Estendendo a interface Profile localmente para incluir o cpf_hash
interface ExtendedProfile extends Profile {
  cpf_hash?: string | null
}

interface SettingsFormProps {
  profile: ExtendedProfile | null
  userEmail: string
}

export function SettingsForm({ profile, userEmail }: SettingsFormProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>(
    (profile?.pomodoro_mode as PomodoroMode) || '25/5'
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
            <Input id="email" value={userEmail} disabled className="bg-muted/30" />
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf" className="flex items-center gap-2">
              CPF 
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            </Label>
            <div className="relative">
              <Input 
                id="cpf" 
                value={profile?.cpf_hash ? "DOCUMENTO VERIFICADO E PROTEGIDO" : "Não informado"} 
                disabled 
                className="bg-muted/50 font-medium text-[11px] tracking-wider pr-10 border-green-500/20"
              />
              {profile?.cpf_hash && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Identificador criptografado para sua segurança
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
                <SelectItem value="system">Sistema</SelectItem>
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
        <Button onClick={handleSave} disabled={isLoading} className="bg-primary">
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