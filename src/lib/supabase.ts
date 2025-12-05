import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Criar cliente apenas se as credenciais existirem
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Types
export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  created_at: string
}

export interface Categoria {
  id: string
  user_id: string
  nome: string
  tipo: 'entrada' | 'gasto'
  created_at: string
}

export interface Entrada {
  id: string
  user_id: string
  descricao: string
  valor: number
  data: string
  categoria?: string
  created_at: string
}

export interface Gasto {
  id: string
  user_id: string
  descricao: string
  valor: number
  data: string
  categoria?: string
  forma_pagamento?: string
  created_at: string
}

export interface ContaFixa {
  id: string
  user_id: string
  descricao: string
  valor: number
  dia_vencimento?: number
  ativa: boolean
  created_at: string
}

export interface ReservaInvestimento {
  id: string
  user_id: string
  descricao: string
  valor: number
  tipo: 'reserva_emergencia' | 'meta' | 'investimento'
  data: string
  created_at: string
}
