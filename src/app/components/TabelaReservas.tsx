'use client'

import { type ReservaInvestimento } from '@/lib/supabase'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface TabelaReservasProps {
  reservas: ReservaInvestimento[]
  onReload: () => void
}

const tipoLabels = {
  reserva_emergencia: 'Reserva de Emergência',
  meta: 'Meta',
  investimento: 'Investimento',
}

export function TabelaReservas({ reservas, onReload }: TabelaReservasProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta reserva/investimento?')) return
    
    await supabase.from('reservas_investimentos').delete().eq('id', id)
    onReload()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-blue-500">🏦</span> Reservas & Investimentos
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-blue-100">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Data</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Descrição</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Categoria</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Valor</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhuma reserva ou investimento cadastrado
                </td>
              </tr>
            ) : (
              reservas.map((reserva) => (
                <tr key={reserva.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="py-3 px-2 text-sm text-gray-600">
                    {new Date(reserva.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-900 font-medium">{reserva.descricao}</td>
                  <td className="py-3 px-2 text-sm text-gray-600">{reserva.categoria || '-'}</td>
                  <td className="py-3 px-2 text-sm text-right font-semibold text-blue-600">
                    R$ {Number(reserva.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleDelete(reserva.id)}
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
