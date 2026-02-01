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
import Link from 'next/link' // Corrigido aqui
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  BookOpen,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [studyType, setStudyType] = useState('administrativa')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [nameTouched, setNameTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [birthDateTouched, setBirthDateTouched] = useState(false)
  const [genderTouched, setGenderTouched] = useState(false)
  
  const validateAge = (dateString: string) => {
    if (!dateString) return false
    const today = new Date()
    const birth = new Date(dateString)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age >= 18
  }

  const isNameInvalid = nameTouched && name.trim().length > 0 && name.trim().length < 2
  const isEmailInvalid = emailTouched && email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isBirthDateInvalid = birthDateTouched && (birthDate === '' || !validateAge(birthDate))
  const isGenderInvalid = genderTouched && !gender

  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([])
  const emailDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'icloud.com']

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const passwordRules = {
    length: password.length >= 6,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  useEffect(() => {
    if (email.includes('@')) {
      const [local, domain] = email.split('@')
      if (local && !domain) {
        setEmailSuggestions(emailDomains.map(d => `${local}@${d}`))
      } else if (local && domain) {
        const filtered = emailDomains
          .filter(d => d.startsWith(domain) && d !== domain)
          .map(d => `${local}@${d}`)
        setEmailSuggestions(filtered)
      } else {
        setEmailSuggestions([])
      }
    } else {
      setEmailSuggestions([])
    }
  }, [email])

  const handleGoogleSignUp = async () => {
    if (isGoogleLoading) return
    setIsGoogleLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro ao conectar com Google.')
      setIsGoogleLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameTouched(true)
    setEmailTouched(true)
    setBirthDateTouched(true)
    setGenderTouched(true)
    
    setIsLoading(true)
    setError(null)

    if (name.trim().length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres.')
      setIsLoading(false)
      return
    }

    if (isEmailInvalid || email.length === 0) {
      setError('Por favor, insira um e-mail válido.')
      setIsLoading(false)
      return
    }

    if (!validateAge(birthDate)) {
      setError('Você precisa ter pelo menos 18 anos para se cadastrar.')
      setIsLoading(false)
      return
    }

    if (!gender) {
      setError('O gênero é obrigatório.')
      setIsLoading(false)
      return
    }

    if (!passwordRules.length || !passwordRules.upper || !passwordRules.special) {
      setError('A senha não atende aos requisitos (mín. 6 caracteres, maiúscula e caractere especial).')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (!termsAccepted) {
      setError('Você deve aceitar os termos de uso')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name,
            birth_date: birthDate || null,
            gender: gender || null,
            study_type: studyType,
            terms_accepted_at: new Date().toISOString(),
          },
        },
      })

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          setError('Este e-mail já está cadastrado. Por favor, faça login.')
          return
        }
        throw error
      }

      // Redirecionamento direto se a confirmação de e-mail estiver desativada
      if (data?.session) {
        router.push('/onboarding')
        return
      }

      if (data?.user?.identities?.length === 0) {
        setError('Este e-mail já está cadastrado. Por favor, faça login.')
        return
      }

      setSuccess(true)
    } catch (error: any) {
      if (error.message?.includes('rate limit')) {
        setError('Muitas tentativas. Aguarde um pouco antes de tentar novamente.')
      } else {
        setError(error instanceof Error ? error.message : 'Erro ao criar conta.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const RuleItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${met ? 'text-green-500' : 'text-muted-foreground'}`}>
      {met ? <Check className="h-3 w-3 stroke-[3px]" /> : <X className="h-3 w-3 opacity-50" />}
      <span>{text}</span>
    </div>
  )

  if (success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background transition-colors duration-300">
        <div className="w-full max-sm:max-w-sm">
          <Card className="border-primary/20 shadow-lg bg-card animate-in fade-in zoom-in duration-300">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Conta criada com sucesso!</h2>
                <p className="text-muted-foreground text-sm">Verifique seu e-mail para confirmar sua conta.</p>
                <Button asChild className="w-full mt-4 h-11 cursor-pointer">
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
        <div className="mb-8 flex items-center justify-between">
          <Button variant="outline" asChild className="group px-4 border-muted-foreground/20 text-foreground cursor-pointer">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Voltar ao início
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full border border-muted-foreground/20 cursor-pointer">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="font-bold text-3xl tracking-tight text-foreground">FocusStudy</span>
          </div>

          <Card className="shadow-2xl border-muted/50 bg-card">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
              <CardDescription>Sua jornada rumo à aprovação começa aqui</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                type="button"
                className="w-full mb-6 h-12 border-muted-foreground/20 cursor-pointer transition-all active:scale-[0.98]"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                )}
                Cadastrar com Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground font-medium">Ou preencha seus dados</span></div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className={`cursor-pointer ${isNameInvalid ? "text-destructive" : ""}`}>Nome completo *</Label>
                  <Input 
                    id="name" 
                    placeholder="Seu nome" 
                    className={`h-11 ${isNameInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`} 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    onBlur={() => setNameTouched(true)}
                  />
                  {isNameInvalid && (
                    <p className="text-[11px] font-medium text-destructive animate-in fade-in slide-in-from-top-1">O nome deve ter pelo menos 2 caracteres.</p>
                  )}
                </div>
                
                <div className="grid gap-2 relative">
                  <Label htmlFor="email" className={`cursor-pointer ${isEmailInvalid ? "text-destructive" : ""}`}>E-mail *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    className={`h-11 ${isEmailInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`} 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    onBlur={() => setEmailTouched(true)}
                    autoComplete="off" 
                  />
                  {isEmailInvalid && (
                    <p className="text-[11px] font-medium text-destructive animate-in fade-in slide-in-from-top-1">Insira um endereço de e-mail válido.</p>
                  )}
                  {emailSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full z-50 mt-1 bg-card border border-muted rounded-md shadow-lg overflow-hidden">
                      {emailSuggestions.map((suggestion) => (
                        <button key={suggestion} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors cursor-pointer" onClick={() => { setEmail(suggestion); setEmailSuggestions([]) }}>{suggestion}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="birthDate" className={`cursor-pointer ${isBirthDateInvalid ? "text-destructive" : ""}`}>Nascimento *</Label>
                    <Input 
                      id="birthDate" 
                      type="date" 
                      className={`h-11 cursor-pointer ${isBirthDateInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`} 
                      required 
                      value={birthDate} 
                      onChange={e => setBirthDate(e.target.value)}
                      onBlur={() => setBirthDateTouched(true)}
                    />
                    {isBirthDateInvalid && (
                      <p className="text-[11px] font-medium text-destructive animate-in fade-in slide-in-from-top-1">Mínimo 18 anos.</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gender" className="cursor-pointer">Gênero *</Label>
                    <Select value={gender} onValueChange={(val) => { setGender(val); setGenderTouched(true) }}>
                      <SelectTrigger className={`h-11 cursor-pointer ${isGenderInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male" className="cursor-pointer">Masculino</SelectItem>
                        <SelectItem value="female" className="cursor-pointer">Feminino</SelectItem>
                        <SelectItem value="other" className="cursor-pointer">Outro</SelectItem>
                        <SelectItem value="prefer_not_say" className="cursor-pointer">Prefiro não dizer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="studyType" className="cursor-pointer">Área de Concurso *</Label>
                  <Select value={studyType} onValueChange={setStudyType}>
                    <SelectTrigger className="h-11 cursor-pointer"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrativa" className="cursor-pointer">Administrativa</SelectItem>
                      <SelectItem value="policial" className="cursor-pointer">Policial</SelectItem>
                      <SelectItem value="tribunais" className="cursor-pointer">Tribunais / Judiciária</SelectItem>
                      <SelectItem value="fiscal" className="cursor-pointer">Fiscal / Controle</SelectItem>
                      <SelectItem value="saude" className="cursor-pointer">Saúde</SelectItem>
                      <SelectItem value="educacao" className="cursor-pointer">Educação</SelectItem>
                      <SelectItem value="outros" className="cursor-pointer">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password" title="Clique para focar na senha" className="cursor-pointer">Senha *</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} className="h-11 pr-10" required value={password} onChange={e => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 bg-muted/30 p-3 rounded-lg border border-muted">
                    <RuleItem met={passwordRules.length} text="Mín. 6 caracteres" />
                    <RuleItem met={passwordRules.upper} text="Letra maiúscula" />
                    <RuleItem met={passwordRules.lower} text="Letra minúscula" />
                    <RuleItem met={passwordRules.special} text="Caractere especial" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" title="Confirme sua senha" className="cursor-pointer">Confirmar Senha *</Label>
                    <div className="relative">
                      <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} className="h-11 pr-10" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox id="terms" checked={termsAccepted} onCheckedChange={checked => setTermsAccepted(checked as boolean)} className="cursor-pointer" />
                  <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer select-none">
                    Li e concordo com os <Link href="/terms" className="text-primary font-medium hover:underline cursor-pointer">Termos de Uso</Link> e a <Link href="/privacy" className="text-primary font-medium hover:underline cursor-pointer">Política de Privacidade</Link>
                  </label>
                </div>

                {error && <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-2 rounded-md animate-in fade-in zoom-in">{error}</p>}

                <Button type="submit" className={`w-full h-11 text-base font-semibold transition-all active:scale-[0.98] ${isLoading || isGoogleLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`} disabled={isLoading || isGoogleLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...</> : 'Criar minha conta'}
                </Button>

                <div className="text-center text-sm pt-2">
                  <span className="text-muted-foreground">Já tem uma conta?</span>{' '}
                  <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4 cursor-pointer">Entrar</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}