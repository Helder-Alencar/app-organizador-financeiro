'use client'

import { AlertTriangle, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  supabase,
  TIPOS_RESERVA,
  type ContaFixa,
  type Entrada,
  type Gasto,
  type Meta,
  type PagamentoConta,
  type ReservaInvestimento,
} from '@/lib/supabase'
import { formatarData, formatarMes, formatarMoeda, hojeISO, mesAtual, mesDeTimestamp } from '@/lib/formato'
import { avisarErro } from '@/lib/erros'
import { Tabela, type Coluna } from './Tabela'

const valor = (classe: string) => ({ titulo: 'Valor', alinhar: 'right' as const, classe: `font-semibold tabular-nums ${classe}` })

const colunasBase = <T extends { data: string; descricao: string; categoria?: string | null }>(): Coluna<T>[] => [
  { titulo: 'Data', valor: (item) => formatarData(item.data), classe: 'text-gray-600 whitespace-nowrap' },
  { titulo: 'Descrição', valor: (item) => item.descricao, classe: 'text-gray-900 font-medium' },
  { titulo: 'Categoria', valor: (item) => item.categoria || '-' },
]

interface PropsComuns<T> {
  onEditar: (item: T) => void
  onReload: () => void
}

export function TabelaEntradas({ entradas, ...props }: PropsComuns<Entrada> & { entradas: Entrada[] }) {
  return (
    <Tabela
      titulo="Entradas"
      emoji="💵"
      cor="emerald"
      itens={entradas}
      tabela="entradas"
      nomeItem="esta entrada"
      mensagemVazio="Nenhuma entrada no período"
      colunas={[...colunasBase<Entrada>(), { ...valor('text-emerald-600'), valor: (e) => formatarMoeda(Number(e.valor)) }]}
      {...props}
    />
  )
}

export function TabelaGastos({ gastos, ...props }: PropsComuns<Gasto> & { gastos: Gasto[] }) {
  return (
    <Tabela
      titulo="Gastos"
      emoji="💸"
      cor="red"
      itens={gastos}
      tabela="gastos"
      nomeItem="este gasto"
      mensagemVazio="Nenhum gasto no período"
      colunas={[
        ...colunasBase<Gasto>(),
        { titulo: 'Pagamento', valor: (g) => g.forma_pagamento || '-' },
        { ...valor('text-red-600'), valor: (g) => formatarMoeda(Number(g.valor)) },
      ]}
      {...props}
    />
  )
}

export function TabelaReservas({ reservas, metas, ...props }: PropsComuns<ReservaInvestimento> & { reservas: ReservaInvestimento[]; metas: Meta[] }) {
  const nomeMeta = (id?: string | null) => metas.find((m) => m.id === id)?.nome ?? '-'

  return (
    <Tabela
      titulo="Reservas & Investimentos"
      emoji="🏦"
      cor="blue"
      itens={reservas}
      tabela="reservas_investimentos"
      nomeItem="esta reserva"
      mensagemVazio="Nenhuma reserva ou investimento no período"
      colunas={[
        ...colunasBase<ReservaInvestimento>(),
        { titulo: 'Tipo', valor: (r) => TIPOS_RESERVA[r.tipo] ?? r.tipo },
        { titulo: 'Meta', valor: (r) => nomeMeta(r.meta_id) },
        { ...valor('text-blue-600'), valor: (r) => formatarMoeda(Number(r.valor)) },
      ]}
      {...props}
    />
  )
}

interface TabelaContasProps extends PropsComuns<ContaFixa> {
  userId: string
  contas: ContaFixa[]
  // Pagamentos do mês atual
  pagamentosMes: PagamentoConta[]
}

export function TabelaContas({ userId, contas, pagamentosMes, onEditar, onReload }: TabelaContasProps) {
  const mes = mesAtual()
  const diaHoje = Number(hojeISO().slice(8, 10))

  const marcarPaga = async (conta: ContaFixa) => {
    const { error } = await supabase.from('contas_pagamentos').insert({
      user_id: userId,
      conta_id: conta.id,
      mes,
      valor: conta.valor,
      data_pagamento: hojeISO(),
    })
    if (error) return avisarErro('marcar a conta como paga', error)
    toast.success(`${conta.descricao} marcada como paga`)
    onReload()
  }

  const desfazerPagamento = async (pagamento: PagamentoConta) => {
    const { error } = await supabase.from('contas_pagamentos').delete().eq('id', pagamento.id)
    if (error) return avisarErro('desfazer o pagamento', error)
    onReload()
  }

  const situacao = (conta: ContaFixa) => {
    // Conta cadastrada depois deste mês (só acontece com relógio do aparelho atrasado)
    if (mesDeTimestamp(conta.created_at) > mes) {
      return <span className="text-gray-500">A partir de {formatarMes(mesDeTimestamp(conta.created_at), 'curto')}</span>
    }

    const pagamento = pagamentosMes.find((p) => p.conta_id === conta.id)
    if (pagamento) {
      return (
        <button
          onClick={() => desfazerPagamento(pagamento)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium hover:bg-emerald-200"
          title="Clique para desfazer"
        >
          <Check className="w-3.5 h-3.5" /> Paga em {formatarData(pagamento.data_pagamento).slice(0, 5)}
        </button>
      )
    }

    const atrasada = conta.dia_vencimento != null && diaHoje > conta.dia_vencimento
    return (
      <span className="inline-flex items-center gap-2">
        {atrasada && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
            <AlertTriangle className="w-3.5 h-3.5" /> Atrasada
          </span>
        )}
        <button
          onClick={() => marcarPaga(conta)}
          className="px-2 py-1 rounded-full border border-orange-300 text-orange-700 text-xs font-medium hover:bg-orange-50"
        >
          Marcar como paga
        </button>
      </span>
    )
  }

  return (
    <Tabela
      titulo="Contas Fixas"
      emoji="📅"
      cor="orange"
      itens={contas}
      tabela="contas_fixas"
      nomeItem="esta conta"
      mensagemVazio="Nenhuma conta fixa cadastrada"
      subtitulo={<>Situação em {formatarMes(mes)}</>}
      colunas={[
        {
          titulo: 'Vencimento',
          valor: (c) => (c.dia_vencimento ? `Dia ${c.dia_vencimento}` : '-'),
          classe: 'text-gray-600 whitespace-nowrap',
        },
        { titulo: 'Descrição', valor: (c) => c.descricao, classe: 'text-gray-900 font-medium' },
        { titulo: 'Categoria', valor: (c) => c.categoria || '-' },
        { titulo: 'Situação', valor: situacao },
        { ...valor('text-orange-600'), valor: (c) => formatarMoeda(Number(c.valor)) },
      ]}
      onEditar={onEditar}
      onReload={onReload}
    />
  )
}
