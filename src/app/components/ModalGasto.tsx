'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Plus } from 'lucide-react'

interface ModalGastoProps {
  onClose: () => void
  onSuccess: () => void
}

export function ModalGasto({ onClose, onSuccess }: ModalGastoProps) {
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<string[]>([])
  const [mostrarNovaCat, setMostrarNovaCat] = useState(false)
  const [novaCat, setNovaCat] = useState('')
  const [formData, setFormData] = useState({
    descricao: '',
    valorDisplay: 'R$ 0,00',
    valorCentavos: 0,
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    forma_pagamento: '',
  })

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('gastos')
      .select('categoria')
      .eq('user_id', user.id)
      .not('categoria', 'is', null)

    if (data) {
      const cats = [...new Set(data.map(d => d.categoria).filter(Boolean))]
      setCategorias(cats)
    }
  }

  const adicionarCategoria = () => {
    if (novaCat.trim() && !categorias.includes(novaCat.trim())) {
      setCategorias([...categorias, novaCat.trim()])
      setFormData({ ...formData, categoria: novaCat.trim() })
      setNovaCat('')
      setMostrarNovaCat(false)
    }
  }

  const formatarMoeda = (centavos: number) => {
    const reais = centavos / 100
    return `R$ ${reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '')
    const centavos = parseInt(input || '0')
    
    setFormData({
      ...formData,
      valorCentavos: centavos,
      valorDisplay: formatarMoeda(centavos)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Converter data para formato correto sem timezone
    const [ano, mes, dia] = formData.data.split('-')
    const dataCorreta = `${ano}-${mes}-${dia}`

    const { error } = await supabase.from('gastos').insert({
      user_id: user.id,
      descricao: formData.descricao,
      valor: formData.valorCentavos / 100,
      data: dataCorreta,
      categoria: formData.categoria || null,
      forma_pagamento: formData.forma_pagamento || null,
    })

    setLoading(false)

    if (!error) {
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Novo Gasto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              required
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Ex: Mercado, Combustível..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor *
            </label>
            <input
              type="text"
              required
              value={formData.valorDisplay}
              onChange={handleValorChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-semibold"
              placeholder="R$ 0,00"
            />
            <p className="text-xs text-gray-500 mt-1">Digite apenas números. Ex: 12345 = R$ 123,45</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <input
              type="date"
              required
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            {!mostrarNovaCat ? (
              <div className="flex gap-2">
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Selecione...</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setMostrarNovaCat(true)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  title="Adicionar nova categoria"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaCat}
                  onChange={(e) => setNovaCat(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Nome da nova categoria..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={adicionarCategoria}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarNovaCat(false)
                    setNovaCat('')
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forma de Pagamento
            </label>
            <select
              value={formData.forma_pagamento}
              onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Selecione...</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Débito">Débito</option>
              <option value="Crédito">Crédito</option>
              <option value="PIX">PIX</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
