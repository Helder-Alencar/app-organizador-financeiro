'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Calendar, LogOut, PiggyBank, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import {
  supabase,
  type ContaFixa,
  type Entrada,
  type Gasto,
  type Meta,
  type PagamentoConta,
  type ReservaInvestimento,
} from '@/lib/supabase'
import { formatarMes, formatarMoeda, mesAtual, mesDe, mesDeTimestamp, somar } from '@/lib/formato'
import { calcularIntervalo, limites, ultimosMeses, type Intervalo, type PeriodoFiltro } from '@/lib/periodo'
import { avisarErro } from '@/lib/erros'
import { baixarCSV } from '@/lib/csv'
import { ResumoCard } from './components/ResumoCard'
import { FiltroPeriodo } from './components/FiltroPeriodo'
import { TabelaContas, TabelaEntradas, TabelaGastos, TabelaReservas } from './components/Tabelas'
import { Metas } from './components/Metas'
import { EvolucaoMensal, GastosPorCategoria, type FatiaCategoria, type MesResumo } from './components/Graficos'
import { ModalEntrada } from './components/ModalEntrada'
import { ModalGasto } from './components/ModalGasto'
import { ModalConta } from './components/ModalConta'
import { ModalReserva } from './components/ModalReserva'
import { ModalMeta } from './components/ModalMeta'

type ModalAberto =
  | { tipo: 'entrada'; item?: Entrada }
  | { tipo: 'gasto'; item?: Gasto }
  | { tipo: 'conta'; item?: ContaFixa }
  | { tipo: 'reserva'; item?: ReservaInvestimento }
  | { tipo: 'meta'; item?: Meta }
  | null

interface Historico {
  entradas: { data: string; valor: number }[]
  gastos: { data: string; valor: number }[]
  pagamentos: { data_pagamento: string; valor: number }[]
}

const MESES_HISTORICO = 6
const MAX_CATEGORIAS_GRAFICO = 7

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [nome, setNome] = useState('')

  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mes')
  const [personalizado, setPersonalizado] = useState<Intervalo>({ inicio: null, fim: null })
  const intervalo = useMemo(() => calcularIntervalo(periodo, personalizado), [periodo, personalizado])

  // Dados do período filtrado
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [reservas, setReservas] = useState<ReservaInvestimento[]>([])
  const [pagamentosPeriodo, setPagamentosPeriodo] = useState<PagamentoConta[]>([])

  // Dados que não dependem do filtro
  const [contas, setContas] = useState<ContaFixa[]>([])
  const [pagamentosMes, setPagamentosMes] = useState<PagamentoConta[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [guardadoPorMeta, setGuardadoPorMeta] = useState<Record<string, number>>({})
  const [historico, setHistorico] = useState<Historico>({ entradas: [], gastos: [], pagamentos: [] })

  const [modal, setModal] = useState<ModalAberto>(null)

  useEffect(() => {
    const carregarUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.replace('/login')

      const { data: perfil } = await supabase.from('users_profile').select('display_name').eq('user_id', user.id).maybeSingle()
      const nomeCadastro = (user.user_metadata?.display_name as string | undefined) || user.email?.split('@')[0] || ''

      // O perfil é criado no primeiro acesso (funciona também quando o cadastro exige confirmar o e-mail)
      if (!perfil) {
        await supabase.from('users_profile').insert({ user_id: user.id, display_name: nomeCadastro })
      }

      setNome(perfil?.display_name || nomeCadastro)
      setUser(user)
    }
    carregarUsuario()
  }, [router])

  const carregarPeriodo = useCallback(async () => {
    if (!user) return
    const { inicio, fim } = limites(intervalo)

    const [e, g, r, p] = await Promise.all([
      supabase.from('entradas').select('*').eq('user_id', user.id).gte('data', inicio).lte('data', fim).order('data', { ascending: false }),
      supabase.from('gastos').select('*').eq('user_id', user.id).gte('data', inicio).lte('data', fim).order('data', { ascending: false }),
      supabase.from('reservas_investimentos').select('*').eq('user_id', user.id).gte('data', inicio).lte('data', fim).order('data', { ascending: false }),
      supabase.from('contas_pagamentos').select('*').eq('user_id', user.id).gte('data_pagamento', inicio).lte('data_pagamento', fim),
    ])

    const erro = [e, g, r, p].find((resultado) => resultado.error)?.error
    if (erro) avisarErro('carregar os lançamentos', erro)

    setEntradas(e.data ?? [])
    setGastos(g.data ?? [])
    setReservas(r.data ?? [])
    setPagamentosPeriodo(p.data ?? [])
  }, [user, intervalo])

  const carregarGeral = useCallback(async () => {
    if (!user) return
    const meses = ultimosMeses(MESES_HISTORICO)
    const inicioHistorico = `${meses[0]}-01`
    const fimHistorico = calcularIntervalo('mes', { inicio: null, fim: null }).fim!

    const [c, pm, m, rm, he, hg, hp] = await Promise.all([
      supabase.from('contas_fixas').select('*').eq('user_id', user.id).eq('ativa', true).order('dia_vencimento'),
      supabase.from('contas_pagamentos').select('*').eq('user_id', user.id).eq('mes', mesAtual()),
      supabase.from('metas').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('reservas_investimentos').select('meta_id, valor').eq('user_id', user.id).not('meta_id', 'is', null),
      supabase.from('entradas').select('data, valor').eq('user_id', user.id).gte('data', inicioHistorico).lte('data', fimHistorico),
      supabase.from('gastos').select('data, valor').eq('user_id', user.id).gte('data', inicioHistorico).lte('data', fimHistorico),
      supabase.from('contas_pagamentos').select('data_pagamento, valor').eq('user_id', user.id).gte('data_pagamento', inicioHistorico).lte('data_pagamento', fimHistorico),
    ])

    const erro = [c, pm, m, rm, he, hg, hp].find((resultado) => resultado.error)?.error
    if (erro) avisarErro('carregar contas, metas e histórico', erro)

    setContas(c.data ?? [])
    setPagamentosMes(pm.data ?? [])
    setMetas(m.data ?? [])
    setGuardadoPorMeta(
      (rm.data ?? []).reduce<Record<string, number>>((acc, r) => {
        acc[r.meta_id] = (acc[r.meta_id] ?? 0) + Number(r.valor)
        return acc
      }, {})
    )
    setHistorico({ entradas: he.data ?? [], gastos: hg.data ?? [], pagamentos: hp.data ?? [] })
  }, [user])

  useEffect(() => {
    carregarPeriodo()
  }, [carregarPeriodo])

  useEffect(() => {
    carregarGeral()
  }, [carregarGeral])

  const recarregar = useCallback(() => {
    carregarPeriodo()
    carregarGeral()
  }, [carregarPeriodo, carregarGeral])

  const sair = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  // Totais do período. Saldo = o que entrou menos tudo que saiu ou foi guardado.
  const totalEntradas = somar(entradas)
  const totalGastos = somar(gastos)
  const totalContasPagas = somar(pagamentosPeriodo)
  const totalReservas = somar(reservas)
  const saldo = totalEntradas - totalGastos - totalContasPagas - totalReservas

  const mes = mesAtual()
  const pendentesMes = somar(
    contas.filter((c) => mesDeTimestamp(c.created_at) <= mes && !pagamentosMes.some((p) => p.conta_id === c.id))
  )

  // Evolução mensal e comparação com o mês anterior
  const evolucao: MesResumo[] = useMemo(
    () =>
      ultimosMeses(MESES_HISTORICO).map((m) => ({
        mes: formatarMes(m, 'curto'),
        entradas: somar(historico.entradas.filter((e) => mesDe(e.data) === m)),
        saidas:
          somar(historico.gastos.filter((g) => mesDe(g.data) === m)) +
          somar(historico.pagamentos.filter((p) => mesDe(p.data_pagamento) === m)),
      })),
    [historico]
  )
  const mesAnterior = ultimosMeses(2)[0]
  const comparar = periodo === 'mes'
  const entradasMesAnterior = somar(historico.entradas.filter((e) => mesDe(e.data) === mesAnterior))
  const gastosMesAnterior = somar(historico.gastos.filter((g) => mesDe(g.data) === mesAnterior))

  const gastosPorCategoria: FatiaCategoria[] = useMemo(() => {
    const porCategoria = new Map<string, number>()
    gastos.forEach((g) => {
      const categoria = g.categoria || 'Sem categoria'
      porCategoria.set(categoria, (porCategoria.get(categoria) ?? 0) + Number(g.valor))
    })
    const ordenado = [...porCategoria.entries()]
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor)

    if (ordenado.length <= MAX_CATEGORIAS_GRAFICO) return ordenado
    const outras = somar(ordenado.slice(MAX_CATEGORIAS_GRAFICO - 1))
    return [...ordenado.slice(0, MAX_CATEGORIAS_GRAFICO - 1), { categoria: 'Outras', valor: outras }]
  }, [gastos])

  const exportar = () => {
    const nomeConta = (id: string) => contas.find((c) => c.id === id)?.descricao ?? 'Conta fixa'
    const linhas: (string | number)[][] = [
      ...entradas.map((e) => ['Entrada', e.data, e.descricao, e.categoria ?? '', '', Number(e.valor)]),
      ...gastos.map((g) => ['Gasto', g.data, g.descricao, g.categoria ?? '', g.forma_pagamento ?? '', -Number(g.valor)]),
      ...pagamentosPeriodo.map((p) => ['Conta fixa', p.data_pagamento, `${nomeConta(p.conta_id)} (${p.mes})`, '', '', -Number(p.valor)]),
      ...reservas.map((r) => ['Reserva', r.data, r.descricao, r.categoria ?? '', '', -Number(r.valor)]),
    ].sort((a, b) => String(a[1]).localeCompare(String(b[1])))

    if (linhas.length === 0) return avisarErro('exportar', { message: 'Não há lançamentos no período.' })

    baixarCSV(
      `organizador-financeiro_${intervalo.inicio ?? 'inicio'}_${intervalo.fim ?? 'hoje'}.csv`,
      ['Tipo', 'Data', 'Descrição', 'Categoria', 'Forma de pagamento', 'Valor'],
      linhas.map((l) => [l[0], String(l[1]).split('-').reverse().join('/'), ...l.slice(2)])
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-emerald-600 text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">💰 Organizador Financeiro</h1>
              <p className="text-sm text-gray-600 mt-1">
                Olá, {nome}!
                <span className="ml-2 text-emerald-600 font-medium">
                  {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </p>
            </div>
            <button
              onClick={sair}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FiltroPeriodo
          periodo={periodo}
          intervalo={intervalo}
          onPeriodo={setPeriodo}
          onPersonalizado={(novo) => {
            setPersonalizado(novo)
            setPeriodo('personalizado')
          }}
          onExportar={exportar}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ResumoCard
            titulo="Entradas"
            valor={totalEntradas}
            icon={<TrendingUp className="w-6 h-6" />}
            cor="emerald"
            anterior={comparar ? entradasMesAnterior : undefined}
            rotuloAnterior="mês anterior"
          />
          <ResumoCard
            titulo="Gastos"
            valor={totalGastos}
            icon={<TrendingDown className="w-6 h-6" />}
            cor="red"
            anterior={comparar ? gastosMesAnterior : undefined}
            rotuloAnterior="mês anterior"
          />
          <ResumoCard
            titulo="Contas Fixas Pagas"
            valor={totalContasPagas}
            icon={<Calendar className="w-6 h-6" />}
            cor="orange"
            detalhe={`Pendentes em ${formatarMes(mes, 'curto')}: ${formatarMoeda(pendentesMes)}`}
          />
          <ResumoCard titulo="Reservas & Investimentos" valor={totalReservas} icon={<PiggyBank className="w-6 h-6" />} cor="blue" />
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1">Saldo do Período</p>
              <h2 className="text-4xl font-bold">{formatarMoeda(saldo)}</h2>
              <p className="text-emerald-100 text-xs mt-2">Entradas − gastos − contas pagas − reservas</p>
            </div>
            <Wallet className="w-16 h-16 text-emerald-200" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(
            [
              { tipo: 'entrada', rotulo: 'Nova Entrada', classe: 'bg-emerald-500 hover:bg-emerald-600' },
              { tipo: 'gasto', rotulo: 'Novo Gasto', classe: 'bg-red-500 hover:bg-red-600' },
              { tipo: 'conta', rotulo: 'Nova Conta', classe: 'bg-orange-500 hover:bg-orange-600' },
              { tipo: 'reserva', rotulo: 'Nova Reserva', classe: 'bg-blue-500 hover:bg-blue-600' },
            ] as const
          ).map(({ tipo, rotulo, classe }) => (
            <button
              key={tipo}
              onClick={() => setModal({ tipo })}
              className={`flex items-center justify-center gap-2 text-white px-4 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl ${classe}`}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">{rotulo}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <EvolucaoMensal dados={evolucao} />
          <GastosPorCategoria dados={gastosPorCategoria} />
        </div>

        <div className="space-y-6">
          <TabelaEntradas entradas={entradas} onEditar={(item) => setModal({ tipo: 'entrada', item })} onReload={recarregar} />
          <TabelaGastos gastos={gastos} onEditar={(item) => setModal({ tipo: 'gasto', item })} onReload={recarregar} />
          <TabelaContas
            userId={user.id}
            contas={contas}
            pagamentosMes={pagamentosMes}
            onEditar={(item) => setModal({ tipo: 'conta', item })}
            onReload={recarregar}
          />
          <TabelaReservas
            reservas={reservas}
            metas={metas}
            onEditar={(item) => setModal({ tipo: 'reserva', item })}
            onReload={recarregar}
          />
          <Metas
            metas={metas}
            guardadoPorMeta={guardadoPorMeta}
            onNova={() => setModal({ tipo: 'meta' })}
            onEditar={(item) => setModal({ tipo: 'meta', item })}
            onReload={recarregar}
          />
        </div>
      </main>

      {modal?.tipo === 'entrada' && <ModalEntrada userId={user.id} item={modal.item} onClose={() => setModal(null)} onSuccess={recarregar} />}
      {modal?.tipo === 'gasto' && <ModalGasto userId={user.id} item={modal.item} onClose={() => setModal(null)} onSuccess={recarregar} />}
      {modal?.tipo === 'conta' && <ModalConta userId={user.id} item={modal.item} onClose={() => setModal(null)} onSuccess={recarregar} />}
      {modal?.tipo === 'reserva' && (
        <ModalReserva userId={user.id} metas={metas} item={modal.item} onClose={() => setModal(null)} onSuccess={recarregar} />
      )}
      {modal?.tipo === 'meta' && <ModalMeta userId={user.id} item={modal.item} onClose={() => setModal(null)} onSuccess={recarregar} />}
    </div>
  )
}
