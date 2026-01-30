'use client'

import type React from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  BookOpen,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [studyType, setStudyType] = useState('exam')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Erro ao conectar com Google.'
      )
      setIsGoogleLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    if (!termsAccepted) {
      setError('Você deve aceitar os termos de uso e a política de privacidade')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
          data: {
            name,
            birth_date: birthDate || null,
            gender: gender || null,
            study_type: studyType,
            terms_accepted_at: new Date().toISOString(),
          },
        },
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao criar conta. Tente novamente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background transition-colors duration-300">
        <div className="w-full max-w-sm">
          <Card className="border-primary/20 shadow-lg bg-card">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Conta criada com sucesso!
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Verifique seu e-mail para confirmar sua conta. Depois, você
                    poderá fazer login.
                  </p>
                </div>
                <Button asChild className="w-full mt-4 h-11">
                  <Link href="/login">Ir para Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10 bg-background transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Header com Navegação e Toggle de Tema */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="outline"
            asChild
            className="group px-4 border-muted-foreground/20 hover:border-primary/50 text-foreground shadow-sm transition-all"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Voltar ao início
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full border border-muted-foreground/20"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="font-bold text-3xl tracking-tight text-foreground">
              FocusStudy
            </span>
          </div>

          <Card className="shadow-2xl border-muted/50 bg-card">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
              <CardDescription>
                Comece a organizar seus estudos agora mesmo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                type="button"
                className="w-full mb-6 h-12 border-muted-foreground/20 hover:bg-accent hover:text-accent-foreground"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    className="mr-3 h-5 w-5"
                    aria-hidden="true"
                    focusable="false"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                )}
                Cadastrar com Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-medium">
                    Ou preencha seus dados
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    className="h-11 bg-background"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="h-11 bg-background"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="birthDate">Nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      className="h-11 bg-background"
                      value={birthDate}
                      onChange={e => setBirthDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="gender" className="h-11 bg-background">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                        <SelectItem value="prefer_not_say">
                          Prefiro não dizer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="studyType">Tipo de Estudo *</Label>
                  <Select value={studyType} onValueChange={setStudyType}>
                    <SelectTrigger
                      id="studyType"
                      className="h-11 bg-background"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Concurso Público</SelectItem>
                      <SelectItem value="college">
                        Faculdade / Universidade
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      className="h-11 bg-background"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="h-11 bg-background"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={checked =>
                      setTermsAccepted(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs text-muted-foreground leading-tight cursor-pointer"
                  >
                    Li e concordo com os{' '}
                    <Link
                      href="/terms"
                      className="text-primary font-medium hover:underline"
                      target="_blank"
                    >
                      Termos de Uso
                    </Link>{' '}
                    e a{' '}
                    <Link
                      href="/privacy"
                      className="text-primary font-medium hover:underline"
                      target="_blank"
                    >
                      Política de Privacidade
                    </Link>
                  </label>
                </div>

                {error && (
                  <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-2 rounded-md">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar minha conta'
                  )}
                </Button>

                <div className="text-center text-sm pt-2">
                  <span className="text-muted-foreground">
                    Já tem uma conta?
                  </span>{' '}
                  <Link
                    href="/login"
                    className="text-primary font-bold hover:underline underline-offset-4"
                  >
                    Entrar
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
