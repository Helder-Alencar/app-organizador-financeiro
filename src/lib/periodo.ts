import { paraISO } from './formato'

export type PeriodoFiltro = 'dia' | 'semana' | 'mes' | 'ano' | 'todos' | 'personalizado'

// null = sem limite
export interface Intervalo {
  inicio: string | null
  fim: string | null
}

export const PERIODOS: { valor: PeriodoFiltro; rotulo: string }[] = [
  { valor: 'dia', rotulo: 'Hoje' },
  { valor: 'semana', rotulo: 'Esta Semana' },
  { valor: 'mes', rotulo: 'Este Mês' },
  { valor: 'ano', rotulo: 'Este Ano' },
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'personalizado', rotulo: 'Personalizado' },
]

// O fim é o último dia do período (e não "2100-12-31"), para que parcelas
// futuras não entrem no total de hoje, desta semana ou deste mês.
export function calcularIntervalo(periodo: PeriodoFiltro, personalizado: Intervalo): Intervalo {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()

  switch (periodo) {
    case 'dia':
      return { inicio: paraISO(hoje), fim: paraISO(hoje) }
    case 'semana': {
      const domingo = new Date(ano, mes, hoje.getDate() - hoje.getDay())
      const sabado = new Date(ano, mes, domingo.getDate() + 6)
      return { inicio: paraISO(domingo), fim: paraISO(sabado) }
    }
    case 'mes':
      return { inicio: paraISO(new Date(ano, mes, 1)), fim: paraISO(new Date(ano, mes + 1, 0)) }
    case 'ano':
      return { inicio: `${ano}-01-01`, fim: `${ano}-12-31` }
    case 'personalizado':
      return personalizado
    default:
      return { inicio: null, fim: null }
  }
}

// Últimos `quantidade` meses, do mais antigo ao atual, no formato YYYY-MM
export function ultimosMeses(quantidade: number): string[] {
  const hoje = new Date()
  return Array.from({ length: quantidade }, (_, i) =>
    paraISO(new Date(hoje.getFullYear(), hoje.getMonth() - (quantidade - 1 - i), 1)).slice(0, 7)
  )
}

// Limites concretos para usar em .gte()/.lte() nas consultas
export function limites({ inicio, fim }: Intervalo): { inicio: string; fim: string } {
  return { inicio: inicio ?? '0001-01-01', fim: fim ?? '9999-12-31' }
}

export function dentroDoIntervalo(iso: string, intervalo: Intervalo): boolean {
  const { inicio, fim } = limites(intervalo)
  return iso >= inicio && iso <= fim
}
