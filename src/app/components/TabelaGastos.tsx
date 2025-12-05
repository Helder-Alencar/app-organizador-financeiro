'use client'

import { type Gasto } from '@/lib/supabase'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface TabelaGastosProps {
  gastos: Gasto[]
  onReload: () => void
}

export function TabelaGastos({ gastos, onReload }: TabelaGastosProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este gasto?')) return
    
    await supabase.from('gastos').delete().eq('id', id)
    onReload()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-red-500">💸</span> Gastos
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-red-100">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Data</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Descrição</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Categoria</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Pagamento</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Valor</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {gastos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhum gasto cadastrado
                </td>
              </tr>
            ) : (
              gastos.map((gasto) => (
                <tr key={gasto.id} className="border-b border-gray-100 hover:bg-red-50 transition-colors">
                  <td className="py-3 px-2 text-sm text-gray-600">
                    {new Date(gasto.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-900 font-medium">{gasto.descricao}</td>
                  <td className="py-3 px-2 text-sm text-gray-600">{gasto.categoria || '-'}</td>
                  <td className="py-3 px-2 text-sm text-gray-600">{gasto.forma_pagamento || '-'}</td>
                  <td className="py-3 px-2 text-sm text-right font-semibold text-red-600">
                    R$ {Number(gasto.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleDelete(gasto.id)}
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
