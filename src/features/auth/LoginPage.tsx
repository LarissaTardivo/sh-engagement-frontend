import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login as loginApi } from '../../shared/lib/api'
import { useAuth } from './authContext'
import { Input } from '../../shared/components/Input'
import { Button } from '../../shared/components/Button'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => loginApi(email, password),
    onSuccess: (token) => {
      login(token)
      navigate('/admin', { replace: true })
    },
    onError: () => {
      setError('Email ou senha inválidos.')
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <img src="/sh-icon.png" alt="SH" className="w-16 h-16 rounded-2xl object-cover mb-4 shadow-lg mx-auto" />
          <h1 className="text-3xl font-bold text-gray-600">SH GRU - Engajamento</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-6">

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@exemplo.com"
              required
              autoFocus
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button
              type="submit"
              variant="primary"
              loading={mutation.isPending}
              className="w-full"
            >
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
