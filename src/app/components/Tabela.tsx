'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatarMoeda } from '@/lib/formato'
import { avisarErro } from '@/lib/erros'
import { excluirRegistro } from '@/lib/lancamentos'
import { cores, type Cor } from './estilos'

export interface Coluna<T> {
  titulo: string
  valor: (item: T) => React.ReactNode
  alinhar?: 'left' | 'right' | 'center'
  classe?: string
}

interface TabelaProps<T extends { id: string; valor: number }> {
  titulo: string
  emoji: string
  cor: Cor
  itens: T[]
  colunas: Coluna<T>[]
  mensagemVazio: string
  // Tabela do banco e nome do item, usados na exclusão ("Excluir este gasto?")
  tabela: string
  nomeItem: string
  subtitulo?: React.ReactNode
  onEditar: (item: T) => void
  onReload: () => void
}

const alinhamento = { left: 'text-left', right: 'text-right', center: 'text-center' }

export function Tabela<T extends { id: string; valor: number }>({
  titulo,
  emoji,
  cor,
  itens,
  colunas,
  mensagemVazio,
  tabela,
  nomeItem,
  subtitulo,
  onEditar,
  onReload,
}: TabelaProps<T>) {
  const excluir = async (id: string) => {
    if (!confirm(`Deseja realmente excluir ${nomeItem}?`)) return
    const { error } = await excluirRegistro(tabela, id)
    if (error) return avisarErro(`excluir ${nomeItem}`, error)
    toast.success('Excluído')
    onReload()
  }

  const total = itens.reduce((soma, item) => soma + Number(item.valor), 0)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>{emoji}</span> {titulo}
        </h2>
        {subtitulo && <div className="text-sm text-gray-600 mt-1">{subtitulo}</div>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b-2 ${cores[cor].borda}`}>
              {colunas.map((coluna) => (
                <th
                  key={coluna.titulo}
                  className={`py-3 px-2 text-sm font-semibold text-gray-700 whitespace-nowrap ${alinhamento[coluna.alinhar ?? 'left']}`}
                >
                  {coluna.titulo}
                </th>
              ))}
              <th className="py-3 px-2 text-sm font-semibold text-gray-700 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (
              <tr>
                <td colSpan={colunas.length + 1} className="text-center py-8 text-gray-500">
                  {mensagemVazio}
                </td>
              </tr>
            ) : (
              itens.map((item) => (
                <tr key={item.id} className={`border-b border-gray-100 transition-colors ${cores[cor].linha}`}>
                  {colunas.map((coluna) => (
                    <td
                      key={coluna.titulo}
                      className={`py-3 px-2 text-sm ${alinhamento[coluna.alinhar ?? 'left']} ${coluna.classe ?? 'text-gray-600'}`}
                    >
                      {coluna.valor(item)}
                    </td>
                  ))}
                  <td className="py-3 px-2 text-center whitespace-nowrap">
                    <button
                      onClick={() => onEditar(item)}
                      className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
                      aria-label="Editar"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => excluir(item.id)}
                      className="p-1 ml-1 text-red-500 hover:text-red-700 transition-colors"
                      aria-label="Excluir"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {itens.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={colunas.length - 1} className="py-3 px-2 text-sm font-semibold text-gray-700">
                  Total ({itens.length})
                </td>
                <td className="py-3 px-2 text-sm text-right font-bold text-gray-900 tabular-nums">{formatarMoeda(total)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
