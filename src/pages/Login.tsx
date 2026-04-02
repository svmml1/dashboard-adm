import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useMainStore from '@/stores/main'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowRight, Ticket } from 'lucide-react'
import { authService } from '@/services/authService'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useMainStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authService.login({ email, password })
      const { token, refreshToken, user: userData } = response.data
      login(userData, token, refreshToken)
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo, ${userData.name}!`,
      })
      navigate('/')
    } catch (err) {
      let message = 'Verifique suas credenciais e tente novamente.'
      if (axios.isAxiosError(err)) {
        const serverMsg = err.response?.data?.message as string | undefined
        if (serverMsg) message = serverMsg
        else if (err.response?.status === 401) message = 'E-mail ou senha incorretos.'
        else if (err.response?.status === 429) message = 'Muitas tentativas. Aguarde um momento.'
      }
      toast({
        title: 'Erro ao entrar',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex md:w-1/2 lg:w-[60%] relative flex-col justify-between p-10 text-white overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/80 z-10 mix-blend-multiply" />
        <img
          src="https://img.usecurling.com/p/1920/1080?q=rodeo&color=black"
          alt="Vaquejada"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-20">
          <div className="font-bold text-3xl flex items-center gap-2 text-primary">
            <Ticket className="h-8 w-8" />
            Vaquejadapro
          </div>
        </div>
        <div className="relative z-20 max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">
            Gestão inteligente para sua vaquejada.
          </h1>
          <p className="text-lg text-slate-300">
            Acompanhe vendas de senhas, solicite saques e tenha total controle financeiro do seu
            evento em tempo real.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative">
        <div className="md:hidden absolute top-6 left-6 font-bold text-2xl flex items-center gap-2 text-primary">
          <Ticket className="h-6 w-6" /> Vaquejadapro
        </div>
        <Card className="w-full max-w-md border-0 shadow-none md:border md:shadow-sm animate-fade-in-up mt-12 md:mt-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Entrar na sua conta</CardTitle>
            <CardDescription>Insira seu e-mail e senha para acessar o painel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@evento.com.br"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Esqueceu a senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Entrar <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
