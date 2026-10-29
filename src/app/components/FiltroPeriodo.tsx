'use client'

import { useState } from 'react'
import { Download, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { PERIODOS, type Intervalo, type PeriodoFiltro } from '@/lib/periodo'
import { formatarData } from '@/lib/formato'
import { classeInput, classeLabel } from './estilos'

interface FiltroPeriodoProps {
  periodo: PeriodoFiltro
  intervalo: Intervalo
  onPeriodo: (periodo: PeriodoFiltro) => void
  onPersonalizado: (intervalo: Intervalo) => void
  onExportar: () => void
}

export function FiltroPeriodo({ periodo, intervalo, onPeriodo, onPersonalizado, onExportar }: FiltroPeriodoProps) {
  const [mostrarDatas, setMostrarDatas] = useState(false)
  const [inicio, setInicio] = useState(intervalo.inicio ?? '')
  const [fim, setFim] = useState(intervalo.fim ?? '')

  // O período personalizado só é aplicado no botão, não a cada data digitada
  const aplicar = () => {
    if (inicio > fim) return toast.error('A data de início precisa ser antes da data de fim')
    onPersonalizado({ inicio, fim })
    setMostrarDatas(false)
  }

  const descricaoIntervalo =
    intervalo.inicio && intervalo.fim
      ? intervalo.inicio === intervalo.fim
        ? formatarData(intervalo.inicio)
        : `${formatarData(intervalo.inicio)} a ${formatarData(intervalo.fim)}`
      : 'Todo o histórico'

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Período:</span>
        <div className="flex gap-2 flex-wrap">
          {PERIODOS.map(({ valor, rotulo }) => {
            const ativo = valor === 'personalizado' ? periodo === valor || mostrarDatas : periodo === valor && !mostrarDatas
            return (
              <button
                key={valor}
                onClick={() => {
                  if (valor === 'personalizado') {
                    setMostrarDatas(true)
                  } else {
                    setMostrarDatas(false)
                    onPeriodo(valor)
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  ativo ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={ativo}
              >
                {rotulo}
              </button>
            )
          })}
        </div>
        <button
          onClick={onExportar}
          className="ml-auto flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          title="Baixa os lançamentos do período em CSV (abre no Excel)"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">{descricaoIntervalo}</p>

      {mostrarDatas && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={classeLabel}>Data Início</label>
              <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className={classeInput('emerald')} />
            </div>
            <div>
              <label className={classeLabel}>Data Fim</label>
              <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className={classeInput('emerald')} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={aplicar}
              disabled={!inicio || !fim}
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar Filtro
            </button>
            <button
              onClick={() => setMostrarDatas(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
