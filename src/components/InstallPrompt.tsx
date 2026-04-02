import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type Platform = 'ios' | 'android' | null

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream
  const isAndroid = /Android/.test(ua)
  if (isIOS) return 'ios'
  if (isAndroid) return 'android'
  return null
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<Platform>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone()) return

    const detected = detectPlatform()
    if (!detected) return

    setPlatform(detected)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (!dismissed) setVisible(true)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  function handleDismiss() {
    localStorage.setItem('pwa-install-dismissed', '1')
    setVisible(false)
  }

  async function handleAndroidInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferredPrompt(null)
  }

  if (!platform || !visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background">
      {/* Top hero */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/10">
          <img src="/skip.png" alt="App icon" className="h-16 w-16 rounded-2xl object-cover" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard ADM</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Instale o app na sua tela inicial para acesso rápido e a melhor experiência possível.
          </p>
        </div>

        {/* Benefits */}
        <div className="w-full max-w-xs space-y-3 rounded-2xl bg-muted/40 px-5 py-4 text-left">
          {[
            { icon: '⚡', text: 'Abre instantaneamente, sem navegador' },
            { icon: '🔔', text: 'Receba notificações importantes' },
            { icon: '📱', text: 'Tela cheia, experiência nativa' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm">
              <span className="text-lg">{icon}</span>
              <span className="text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions + actions fixed at bottom */}
      <div className="px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 space-y-4">
        {platform === 'ios' && (
          <div className="space-y-3 rounded-2xl bg-muted/40 px-5 py-4 text-sm">
            <p className="font-semibold text-center text-foreground">Como instalar no iPhone</p>
            <ol className="space-y-2.5">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                <span>
                  Toque no ícone{' '}
                  <strong className="text-foreground">Compartilhar ⎙</strong>{' '}
                  na barra inferior do Safari
                </span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                <span>
                  Role e toque em{' '}
                  <strong className="text-foreground">"Adicionar à Tela de Início"</strong>
                </span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                <span>
                  Confirme tocando em{' '}
                  <strong className="text-foreground">"Adicionar"</strong>
                </span>
              </li>
            </ol>
          </div>
        )}

        {platform === 'android' && deferredPrompt && (
          <Button className="w-full h-12 text-base font-semibold" onClick={handleAndroidInstall}>
            Instalar app
          </Button>
        )}

        {platform === 'android' && !deferredPrompt && (
          <div className="space-y-3 rounded-2xl bg-muted/40 px-5 py-4 text-sm">
            <p className="font-semibold text-center text-foreground">Como instalar no Android</p>
            <ol className="space-y-2.5">
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                <span>
                  Toque no menu{' '}
                  <strong className="text-foreground">⋮</strong>{' '}
                  do Chrome (canto superior direito)
                </span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                <span>
                  Toque em{' '}
                  <strong className="text-foreground">"Adicionar à tela inicial"</strong>
                </span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                <span>
                  Confirme tocando em{' '}
                  <strong className="text-foreground">"Adicionar"</strong>
                </span>
              </li>
            </ol>
          </div>
        )}

        <button
          onClick={handleDismiss}
          className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Continuar pelo navegador
        </button>
      </div>
    </div>
  )
}
