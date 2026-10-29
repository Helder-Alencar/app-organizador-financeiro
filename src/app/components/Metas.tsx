'use client'

import { Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { type Meta } from '@/lib/supabase'
import { formatarMoeda } from '@/lib/formato'
import { avisarErro } from '@/lib/erros'
import { excluirRegistro } from '@/lib/lancamentos'

interface MetasProps {
  metas: Meta[]
  // Total guardado por meta (todas as reservas, de qualquer período)
  guardadoPorMeta: Record<string, number>
  onNova: () => void
  onEditar: (meta: Meta) => void
  onReload: () => void
}

export function Metas({ metas, guardadoPorMeta, onNova, onEditar, onReload }: MetasProps) {
  const excluir = async (meta: Meta) => {
    if (!confirm(`Excluir a meta "${meta.nome}"? As reservas continuam salvas, só deixam de estar ligadas a ela.`)) return
    const { error } = await excluirRegistro('metas', meta.id)
    if (error) return avisarErro('excluir a meta', error)
    toast.success('Meta excluída')
    onReload()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-600" /> Metas
        </h2>
        <button
          onClick={onNova}
          className="flex items-center gap-1 px-3 py-1.5 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova meta
        </button>
      </div>

      {metas.length === 0 ? (
        <p className="text-center py-6 text-gray-500">
          Nenhuma meta ainda. Crie uma e associe suas reservas a ela para acompanhar o progresso.
        </p>
      ) : (
        <ul className="space-y-4">
          {metas.map((meta) => {
            const guardado = guardadoPorMeta[meta.id] ?? 0
            const alvo = Number(meta.valor_alvo)
            const percentual = Math.min(100, (guardado / alvo) * 100)

            return (
              <li key={meta.id}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-gray-900">{meta.nome}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span className="text-sm text-gray-600 tabular-nums">
                      {formatarMoeda(guardado)} de {formatarMoeda(alvo)}
                    </span>
                    <button onClick={() => onEditar(meta)} className="p-1 text-gray-500 hover:text-gray-800" aria-label="Editar meta">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => excluir(meta)} className="p-1 text-red-500 hover:text-red-700" aria-label="Excluir meta">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </span>
                </div>
                <div
                  className="h-2.5 rounded-full bg-violet-100 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={Math.round(percentual)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progresso da meta ${meta.nome}`}
                >
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${percentual}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {guardado >= alvo
                    ? 'Meta atingida! 🎉'
                    : `${percentual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}% · faltam ${formatarMoeda(alvo - guardado)}`}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
