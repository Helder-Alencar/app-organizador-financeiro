import { formatarMoeda } from '@/lib/formato'
import { cores, type Cor } from './estilos'

interface ResumoCardProps {
  titulo: string
  valor: number
  icon: React.ReactNode
  cor: Cor
  // Valor do período anterior, para mostrar a variação
  anterior?: number
  rotuloAnterior?: string
  detalhe?: React.ReactNode
}

export function ResumoCard({ titulo, valor, icon, cor, anterior, rotuloAnterior, detalhe }: ResumoCardProps) {
  const variacao = anterior ? ((valor - anterior) / anterior) * 100 : null

  return (
    <div className={`bg-gradient-to-br ${cores[cor].gradiente} rounded-xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium opacity-90">{titulo}</h3>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-bold">{formatarMoeda(valor)}</p>
      {variacao !== null && (
        <p className="text-xs mt-2 opacity-90">
          {variacao >= 0 ? '▲' : '▼'} {Math.abs(variacao).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}% vs{' '}
          {rotuloAnterior}
        </p>
      )}
      {detalhe && <p className="text-xs mt-2 opacity-90">{detalhe}</p>}
    </div>
  )
}
