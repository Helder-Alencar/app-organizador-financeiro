'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { supabase, type TipoCategoria } from '@/lib/supabase'
import { formatarMoeda } from '@/lib/formato'
import { avisarErro } from '@/lib/erros'
import { classeInput, classeLabel, cores, type Cor } from './estilos'

export function CampoTexto({
  rotulo,
  valor,
  onChange,
  cor,
  placeholder,
  obrigatorio = true,
}: {
  rotulo: string
  valor: string
  onChange: (valor: string) => void
  cor: Cor
  placeholder?: string
  obrigatorio?: boolean
}) {
  return (
    <div>
      <label className={classeLabel}>
        {rotulo}
        {obrigatorio && ' *'}
      </label>
      <input
        type="text"
        required={obrigatorio}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={classeInput(cor)}
        placeholder={placeholder}
      />
    </div>
  )
}

export function CampoData({
  rotulo = 'Data',
  valor,
  onChange,
  cor,
}: {
  rotulo?: string
  valor: string
  onChange: (valor: string) => void
  cor: Cor
}) {
  return (
    <div>
      <label className={classeLabel}>{rotulo} *</label>
      <input type="date" required value={valor} onChange={(e) => onChange(e.target.value)} className={classeInput(cor)} />
    </div>
  )
}

// Valor em centavos: digitar 12345 mostra R$ 123,45
export function CampoValor({
  rotulo = 'Valor',
  centavos,
  onChange,
  cor,
}: {
  rotulo?: string
  centavos: number
  onChange: (centavos: number) => void
  cor: Cor
}) {
  return (
    <div>
      <label className={classeLabel}>{rotulo} *</label>
      <input
        type="text"
        inputMode="numeric"
        required
        value={formatarMoeda(centavos / 100)}
        onChange={(e) => onChange(parseInt(e.target.value.replace(/\D/g, '') || '0', 10))}
        className={`${classeInput(cor)} text-lg font-semibold`}
      />
      <p className="text-xs text-gray-500 mt-1">Digite apenas números. Ex: 12345 = R$ 123,45</p>
    </div>
  )
}

// Tabela de onde vêm as categorias já usadas em lançamentos antigos
const tabelaPorTipo: Record<TipoCategoria, string> = {
  entrada: 'entradas',
  gasto: 'gastos',
  conta: 'contas_fixas',
  reserva: 'reservas_investimentos',
}

// Junta as categorias cadastradas com as que já aparecem nos lançamentos
function useCategorias(tipo: TipoCategoria, userId: string) {
  const [categorias, setCategorias] = useState<string[]>([])

  useEffect(() => {
    const carregar = async () => {
      const [cadastradas, usadas] = await Promise.all([
        supabase.from('categorias').select('nome').eq('user_id', userId).eq('tipo', tipo),
        supabase.from(tabelaPorTipo[tipo]).select('categoria').eq('user_id', userId).not('categoria', 'is', null),
      ])
      const nomes = [
        ...(cadastradas.data ?? []).map((c: { nome: string }) => c.nome),
        ...(usadas.data ?? []).map((c: { categoria: string }) => c.categoria),
      ]
      setCategorias([...new Set(nomes.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')))
    }
    carregar()
  }, [tipo, userId])

  const adicionar = async (nome: string) => {
    const { error } = await supabase.from('categorias').insert({ user_id: userId, nome, tipo })
    if (error) {
      avisarErro('salvar a categoria', error)
      return false
    }
    setCategorias((atuais) => [...atuais, nome].sort((a, b) => a.localeCompare(b, 'pt-BR')))
    return true
  }

  return { categorias, adicionar }
}

export function CampoCategoria({
  tipo,
  userId,
  valor,
  onChange,
  cor,
}: {
  tipo: TipoCategoria
  userId: string
  valor: string
  onChange: (valor: string) => void
  cor: Cor
}) {
  const { categorias, adicionar } = useCategorias(tipo, userId)
  const [criando, setCriando] = useState(false)
  const [nova, setNova] = useState('')

  const confirmarNova = async () => {
    const nome = nova.trim()
    if (!nome) return
    if (categorias.includes(nome) || (await adicionar(nome))) {
      onChange(nome)
      setNova('')
      setCriando(false)
    }
  }

  // Uma categoria do lançamento que está sendo editado sempre aparece na lista
  const opcoes = valor && !categorias.includes(valor) ? [valor, ...categorias] : categorias

  return (
    <div>
      <label className={classeLabel}>Categoria</label>
      {!criando ? (
        <div className="flex gap-2">
          <select value={valor} onChange={(e) => onChange(e.target.value)} className={`flex-1 ${classeInput(cor)}`}>
            <option value="">Selecione...</option>
            {opcoes.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setCriando(true)}
            className={`px-3 py-2 rounded-lg transition-colors ${cores[cor].suave}`}
            title="Adicionar nova categoria"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                confirmarNova()
              }
            }}
            className={`flex-1 ${classeInput(cor)}`}
            placeholder="Nome da nova categoria..."
            autoFocus
          />
          <button
            type="button"
            onClick={confirmarNova}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${cores[cor].botao}`}
          >
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => {
              setCriando(false)
              setNova('')
            }}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            aria-label="Cancelar nova categoria"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
