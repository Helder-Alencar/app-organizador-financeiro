// Datas são tratadas como texto YYYY-MM-DD no fuso local. Nunca usar
// toISOString() para isso: ele converte para UTC e, no Brasil, depois das 21h
// já devolve o dia seguinte.

const pad = (n: number) => String(n).padStart(2, '0')

export function paraISO(data: Date): string {
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`
}

export function hojeISO(): string {
  return paraISO(new Date())
}

// "2025-12-06" -> Date local (new Date("2025-12-06") seria meia-noite UTC = dia anterior no Brasil)
export function deISO(iso: string): Date {
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// "2026-10" (mês de referência)
export function mesDe(iso: string): string {
  return iso.slice(0, 7)
}

// Mês local de um timestamp do banco (ex.: created_at)
export function mesDeTimestamp(timestamp: string): string {
  return mesDe(paraISO(new Date(timestamp)))
}

export function mesAtual(): string {
  return mesDe(hojeISO())
}

export function formatarMes(mes: string, estilo: 'curto' | 'longo' = 'longo'): string {
  const [ano, m] = mes.split('-').map(Number)
  const nome = new Date(ano, m - 1, 1).toLocaleDateString('pt-BR', { month: estilo === 'curto' ? 'short' : 'long' })
  return estilo === 'curto' ? `${nome.replace('.', '')}/${String(ano).slice(2)}` : `${nome} de ${ano}`
}

// Soma meses mantendo o dia; se o mês de destino for menor, usa o último dia dele (31/01 + 1 = 28/02).
export function somarMeses(iso: string, meses: number): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  const ultimoDia = new Date(ano, mes - 1 + meses + 1, 0).getDate()
  return paraISO(new Date(ano, mes - 1 + meses, Math.min(dia, ultimoDia)))
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatarMoeda(valor: number): string {
  return moeda.format(valor)
}

// Eixos de gráfico: R$ 0 / R$ 1,5 mil / R$ 12 mil
export function formatarMoedaCompacta(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(valor)
}

export function somar<T extends { valor: number }>(itens: T[]): number {
  return itens.reduce((total, item) => total + Number(item.valor), 0)
}
