'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  })

  useEffect(() => {
    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!supabase) {
      setError('Supabase não configurado')
      setLoading(false)
      return
    }

    try {
      if (mode === 'signup') {
        // Cadastro
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (signUpError) throw signUpError

        // Criar perfil do usuário com o nome
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users_profile')
            .insert({
              user_id: data.user.id,
              display_name: formData.displayName,
            })

          if (profileError) throw profileError
        }

        router.push('/')
      } else {
        // Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (signInError) throw signInError
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação')
    }

    setLoading(false)
  }

  // Se Supabase não está configurado
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4 text-orange-600">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Configuração Necessária</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Para usar o Organizador Financeiro, você precisa configurar o Supabase:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
            <li>Crie um projeto em <a href="https://supabase.com" target="_blank" className="text-emerald-600 hover:underline">supabase.com</a></li>
            <li>Copie a URL e a chave anon/public</li>
            <li>Cole as credenciais aqui no chat ou configure via OAuth</li>
          </ol>
          <button
            onClick={() => window.open('https://supabase.com', '_blank')}
            className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-all font-medium"
          >
            Criar Projeto no Supabase
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💰 Organizador Financeiro
            </h1>
            <p className="text-gray-600">
              Controle suas finanças de forma inteligente
            </p>
          </div>

          {/* Toggle Login/Cadastro */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-emerald-600 shadow'
                  : 'text-gray-600'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white text-emerald-600 shadow'
                  : 'text-gray-600'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Como quer ser chamado? *
                </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-all font-medium disabled:opacity-50"
            >
              {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
