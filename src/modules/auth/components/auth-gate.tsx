import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { KeyRound, Mail } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

interface AuthGateProps {
  children: ReactNode
}

type AuthMode = 'sign-in' | 'sign-up'

export function AuthGate({ children }: AuthGateProps) {
  const session = useAuthStore((state) => state.session)
  const initialized = useAuthStore((state) => state.initialized)
  const loading = useAuthStore((state) => state.loading)
  const error = useAuthStore((state) => state.error)
  const initialize = useAuthStore((state) => state.initialize)
  const signIn = useAuthStore((state) => state.signIn)
  const signUp = useAuthStore((state) => state.signUp)
  const clearError = useAuthStore((state) => state.clearError)

  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void initialize()
  }, [initialize])

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setMessage(null)
    clearError()

    const success =
      mode === 'sign-in'
        ? await signIn(email, password)
        : await signUp(email, password)

    if (success && mode === 'sign-up') {
      setMessage('注册成功，正在进入 AgencyOS……')
    }
  }

  const changeMode = () => {
    setMode((current) =>
      current === 'sign-in' ? 'sign-up' : 'sign-in',
    )
    setMessage(null)
    clearError()
  }

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-agency-ink text-agency-cyan">
        <div className="font-mono text-sm uppercase tracking-[0.3em]">
          正在建立安全连接……
        </div>
      </div>
    )
  }

  if (session) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-agency-ink px-4 text-agency-cyan">
      <div className="w-full max-w-md rounded-xl border border-agency-cyan/30 bg-agency-panel p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-agency-cyan/10">
            <KeyRound className="h-7 w-7" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-red-500">
              Agency OS
            </p>
            <h1 className="mt-1 text-xl font-semibold text-white">
              {mode === 'sign-in' ? '机构身份认证' : '注册机构账户'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="auth-email"
              className="mb-2 block text-xs font-bold uppercase tracking-wider"
            >
              邮箱
            </label>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-agency-muted" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="w-full rounded border border-agency-border bg-agency-ink/50 px-3 py-2 text-sm text-white outline-none focus:border-agency-cyan"
                placeholder="gm@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-2 block text-xs font-bold uppercase tracking-wider"
            >
              密码
            </label>

            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-agency-muted" />
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  mode === 'sign-in'
                    ? 'current-password'
                    : 'new-password'
                }
                minLength={8}
                required
                className="w-full rounded border border-agency-border bg-agency-ink/50 px-3 py-2 text-sm text-white outline-none focus:border-agency-cyan"
                placeholder="至少 8 个字符"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded border border-red-500/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded border border-agency-cyan/40 bg-agency-cyan/10 px-3 py-2 text-sm">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded border border-agency-cyan bg-agency-cyan/10 px-4 py-2 text-sm font-bold uppercase tracking-wider transition hover:bg-agency-cyan/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? '处理中……'
              : mode === 'sign-in'
                ? '登录'
                : '注册'}
          </button>
        </form>

        <button
          type="button"
          onClick={changeMode}
          disabled={loading}
          className="mt-5 w-full text-center text-sm text-agency-muted hover:text-agency-cyan"
        >
          {mode === 'sign-in'
            ? '没有账户？创建账户'
            : '已有账户？返回登录'}
        </button>
      </div>
    </div>
  )
}