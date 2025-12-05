'use client'

import { type ContaFixa } from '@/lib/supabase'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface TabelaContasProps {
  contas: ContaFixa[]
  onReload: () => void
}

export function TabelaContas({ contas, onReload }: TabelaContasProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta conta?')) return
    
    await supabase.from('contas_fixas').delete().eq('id', id)
    onReload()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-orange-500">📅</span> Contas Fixas
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-orange-100">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Data</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Descrição</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Categoria</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Valor</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {contas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhuma conta fixa cadastrada
                </td>
              </tr>
            ) : (
              contas.map((conta) => (
                <tr key={conta.id} className="border-b border-gray-100 hover:bg-orange-50 transition-colors">
                  <td className="py-3 px-2 text-sm text-gray-600">
                    {conta.data ? new Date(conta.data).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-900 font-medium">{conta.descricao}</td>
                  <td className="py-3 px-2 text-sm text-gray-600">{conta.categoria || '-'}</td>
                  <td className="py-3 px-2 text-sm text-right font-semibold text-orange-600">
                    R$ {Number(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleDelete(conta.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
