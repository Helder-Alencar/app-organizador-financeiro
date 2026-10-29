import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local (veja .env.example).'
  )
}

// Cliente do navegador: guarda a sessão em cookies, que o middleware consegue ler.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Types
export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  created_at: string
}

export type TipoCategoria = 'entrada' | 'gasto' | 'conta' | 'reserva'

export interface Categoria {
  id: string
  user_id: string
  nome: string
  tipo: TipoCategoria
  created_at: string
}

export interface Entrada {
  id: string
  user_id: string
  descricao: string
  valor: number
  data: string
  categoria?: string | null
  created_at: string
}

export interface Gasto {
  id: string
  user_id: string
  descricao: string
  valor: number
  data: string
  categoria?: string | null
  forma_pagamento?: string | null
  created_at: string
}

export interface ContaFixa {
  id: string
  user_id: string
  descricao: string
  valor: number
  // Dia do mês (1 a 31); a conta vale a partir do mês em que foi cadastrada
  dia_vencimento: number | null
  categoria?: string | null
  ativa: boolean
  created_at: string
}

export interface PagamentoConta {
  id: string
  user_id: string
  conta_id: string
  // Mês de referência no formato YYYY-MM
  mes: string
  valor: number
  data_pagamento: string
  created_at: string
}

export type TipoReserva = 'reserva_emergencia' | 'meta' | 'investimento'

export const TIPOS_RESERVA: Record<TipoReserva, string> = {
  reserva_emergencia: 'Reserva de Emergência',
  meta: 'Meta',
  investimento: 'Investimento',
}

export interface ReservaInvestimento {
  id: string
  user_id: string
  descricao: string
  valor: number
  tipo: TipoReserva
  data: string
  categoria?: string | null
  meta_id?: string | null
  created_at: string
}

export interface Meta {
  id: string
  user_id: string
  nome: string
  valor_alvo: number
  created_at: string
}
