'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Modo = 'login' | 'signup' | 'recuperar'

export default function LoginPage() {
  const router = useRouter()
  const [modo, setModo] = useState<Modo>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  })

  // Link de e-mail inválido ou expirado volta para cá com ?erro=link
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('erro') === 'link') {
      setError('O link expirou ou já foi usado. Peça um novo.')
    }
  }, [])

  const trocarModo = (novo: Modo) => {
    setModo(novo)
    setError('')
    setAviso('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setAviso('')

    const urlCallback = `${window.location.origin}/auth/callback`

    try {
      if (modo === 'signup') {
        // O nome vai nos metadados; o perfil é criado no primeiro acesso ao painel
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { display_name: formData.displayName },
            emailRedirectTo: urlCallback,
          },
        })
        if (signUpError) throw signUpError

        if (data.session) {
          router.replace('/')
        } else {
          setAviso('Conta criada! Enviamos um link de confirmação para o seu e-mail.')
        }
      } else if (modo === 'recuperar') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${urlCallback}?next=/redefinir-senha`,
        })
        if (resetError) throw resetError
        setAviso('Se este e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (signInError) throw signInError
        router.replace('/')
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : ''
      setError(mensagem === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : mensagem || 'Erro ao processar solicitação')
    }

    setLoading(false)
  }

  const textoBotao = { login: 'Entrar', signup: 'Criar Conta', recuperar: 'Enviar link' }[modo]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Organizador Financeiro</h1>
            <p className="text-gray-600">
              {modo === 'recuperar' ? 'Informe seu e-mail para criar uma nova senha' : 'Controle suas finanças de forma inteligente'}
            </p>
          </div>

          {modo !== 'recuperar' && (
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => trocarModo(m)}
                  className={`flex-1 py-2 rounded-md font-medium transition-all ${
                    modo === m ? 'bg-white text-emerald-600 shadow' : 'text-gray-600'
                  }`}
                >
                  {m === 'login' ? 'Entrar' : 'Cadastrar'}
                </button>
              ))}
            </div>
          )}

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
          {aviso && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">{aviso}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Como quer ser chamado? *</label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: João, Maria..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="seu@email.com"
              />
            </div>

            {modo !== 'recuperar' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
                <input
                  type="password"
                  required
                  autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-all font-medium disabled:opacity-50"
            >
              {loading ? 'Processando...' : textoBotao}
            </button>
          </form>

          <div className="text-center mt-4">
            {modo === 'login' && (
              <button onClick={() => trocarModo('recuperar')} className="text-sm text-emerald-600 hover:underline">
                Esqueci minha senha
              </button>
            )}
            {modo === 'recuperar' && (
              <button onClick={() => trocarModo('login')} className="text-sm text-emerald-600 hover:underline">
                Voltar para o login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
