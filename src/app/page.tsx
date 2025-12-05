'use client'

import { useEffect, useState } from 'react'
import { supabase, type Entrada, type Gasto, type ContaFixa, type ReservaInvestimento, type UserProfile } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  LogOut,
  Calendar,
  AlertCircle,
  Filter
} from 'lucide-react'
import { ResumoCard } from './components/ResumoCard'
import { TabelaEntradas } from './components/TabelaEntradas'
import { TabelaGastos } from './components/TabelaGastos'
import { TabelaContas } from './components/TabelaContas'
import { TabelaReservas } from './components/TabelaReservas'
import { ModalEntrada } from './components/ModalEntrada'
import { ModalGasto } from './components/ModalGasto'
import { ModalConta } from './components/ModalConta'
import { ModalReserva } from './components/ModalReserva'

type PeriodoFiltro = 'dia' | 'semana' | 'mes' | 'ano' | 'todos' | 'personalizado'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>('mes')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false)
  
  // Estados dos dados
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [contas, setContas] = useState<ContaFixa[]>([])
  const [reservas, setReservas] = useState<ReservaInvestimento[]>([])
  
  // Estados dos modais
  const [modalEntrada, setModalEntrada] = useState(false)
  const [modalGasto, setModalGasto] = useState(false)
  const [modalConta, setModalConta] = useState(false)
  const [modalReserva, setModalReserva] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    checkUser()
    loadData()
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [periodoFiltro, dataInicio, dataFim, user])

  const checkUser = async () => {
    if (!supabase) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        
        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from('users_profile')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
    }
    setLoading(false)
  }

  const getDataInicio = () => {
    const hoje = new Date()
    
    switch (periodoFiltro) {
      case 'dia':
        return hoje.toISOString().split('T')[0]
      case 'semana':
        const primeiroDiaSemana = new Date(hoje)
        primeiroDiaSemana.setDate(hoje.getDate() - hoje.getDay())
        return primeiroDiaSemana.toISOString().split('T')[0]
      case 'mes':
        return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      case 'ano':
        return new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0]
      case 'personalizado':
        return dataInicio || '1900-01-01'
      default:
        return '1900-01-01'
    }
  }

  const getDataFim = () => {
    if (periodoFiltro === 'personalizado' && dataFim) {
      return dataFim
    }
    return '2100-12-31'
  }

  const loadData = async () => {
    if (!supabase || !user) return
    
    try {
      const inicio = getDataInicio()
      const fim = getDataFim()

      const [entradasData, gastosData, contasData, reservasData] = await Promise.all([
        supabase
          .from('entradas')
          .select('*')
          .eq('user_id', user.id)
          .gte('data', inicio)
          .lte('data', fim)
          .order('data', { ascending: false }),
        supabase
          .from('gastos')
          .select('*')
          .eq('user_id', user.id)
          .gte('data', inicio)
          .lte('data', fim)
          .order('data', { ascending: false }),
        supabase
          .from('contas_fixas')
          .select('*')
          .eq('user_id', user.id)
          .eq('ativa', true),
        supabase
          .from('reservas_investimentos')
          .select('*')
          .eq('user_id', user.id)
          .gte('data', inicio)
          .lte('data', fim)
          .order('data', { ascending: false }),
      ])

      if (entradasData.data) setEntradas(entradasData.data)
      if (gastosData.data) setGastos(gastosData.data)
      if (contasData.data) setContas(contasData.data)
      if (reservasData.data) setReservas(reservasData.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handlePeriodoChange = (periodo: PeriodoFiltro) => {
    setPeriodoFiltro(periodo)
    if (periodo === 'personalizado') {
      setMostrarDatePicker(true)
    } else {
      setMostrarDatePicker(false)
      setDataInicio('')
      setDataFim('')
    }
  }

  const aplicarFiltroPersonalizado = () => {
    if (dataInicio && dataFim) {
      loadData()
      setMostrarDatePicker(false)
    }
  }

  // Cálculos
  const totalEntradas = entradas.reduce((sum, e) => sum + Number(e.valor), 0)
  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.valor), 0)
  const totalContas = contas.reduce((sum, c) => sum + Number(c.valor), 0)
  const totalReservas = reservas.reduce((sum, r) => sum + Number(r.valor), 0)
  const saldo = totalEntradas - totalGastos - totalContas

  // Se Supabase não está configurado
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4 text-orange-600">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Configuração Necessária</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Para usar o Organizador Financeiro, você precisa configurar o Supabase:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
            <li>Crie um projeto em <a href="https://supabase.com" target="_blank" className="text-emerald-600 hover:underline">supabase.com</a></li>
            <li>Copie a URL e a chave anon/public</li>
            <li>Configure nas variáveis de ambiente ou conecte via OAuth</li>
          </ol>
          <button
            onClick={() => window.open('https://supabase.com', '_blank')}
            className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-all font-medium"
          >
            Criar Projeto no Supabase
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-emerald-600 text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                💰 Organizador Financeiro
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Olá, {userProfile?.display_name || user?.email?.split('@')[0]}! 
                <span className="ml-2 text-emerald-600 font-medium">
                  {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtro de Período */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtrar por período:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handlePeriodoChange('dia')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  periodoFiltro === 'dia'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => handlePeriodoChange('semana')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  periodoFiltro === 'semana'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Esta Semana
              </button>
              <button
                onClick={() => handlePeriodoChange('mes')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  periodoFiltro === 'mes'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Este Mês
              </button>
              <button
                onClick={() => handlePeriodoChange('ano')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  periodoFiltro === 'ano'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Este Ano
              </button>
              <button
                onClick={() => handlePeriodoChange('todos')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  periodoFiltro === 'todos'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => handlePeriodoChange('personalizado')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  periodoFiltro === 'personalizado'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Personalizado
              </button>
            </div>
          </div>

          {/* Date Picker para Período Personalizado */}
          {mostrarDatePicker && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={aplicarFiltroPersonalizado}
                  disabled={!dataInicio || !dataFim}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aplicar Filtro
                </button>
                <button
                  onClick={() => {
                    setMostrarDatePicker(false)
                    setPeriodoFiltro('mes')
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ResumoCard
            titulo="Entradas"
            valor={totalEntradas}
            icon={<TrendingUp className="w-6 h-6" />}
            cor="emerald"
          />
          <ResumoCard
            titulo="Gastos"
            valor={totalGastos}
            icon={<TrendingDown className="w-6 h-6" />}
            cor="red"
          />
          <ResumoCard
            titulo="Contas Fixas"
            valor={totalContas}
            icon={<Calendar className="w-6 h-6" />}
            cor="orange"
          />
          <ResumoCard
            titulo="Reservas & Investimentos"
            valor={totalReservas}
            icon={<PiggyBank className="w-6 h-6" />}
            cor="blue"
          />
        </div>

        {/* Saldo Disponível */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1">Saldo Disponível</p>
              <h2 className="text-4xl font-bold">
                R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <Wallet className="w-16 h-16 text-emerald-200" />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setModalEntrada(true)}
            className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nova Entrada</span>
          </button>
          <button
            onClick={() => setModalGasto(true)}
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Novo Gasto</span>
          </button>
          <button
            onClick={() => setModalConta(true)}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nova Conta</span>
          </button>
          <button
            onClick={() => setModalReserva(true)}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nova Reserva</span>
          </button>
        </div>

        {/* Tabelas */}
        <div className="space-y-6">
          <TabelaEntradas entradas={entradas} onReload={loadData} />
          <TabelaGastos gastos={gastos} onReload={loadData} />
          <TabelaContas contas={contas} onReload={loadData} />
          <TabelaReservas reservas={reservas} onReload={loadData} />
        </div>
      </main>

      {/* Modais */}
      {modalEntrada && <ModalEntrada onClose={() => setModalEntrada(false)} onSuccess={loadData} />}
      {modalGasto && <ModalGasto onClose={() => setModalGasto(false)} onSuccess={loadData} />}
      {modalConta && <ModalConta onClose={() => setModalConta(false)} onSuccess={loadData} />}
      {modalReserva && <ModalReserva onClose={() => setModalReserva(false)} onSuccess={loadData} />}
    </div>
  )
}
