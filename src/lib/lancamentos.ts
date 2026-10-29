import { supabase } from './supabase'
import { somarMeses } from './formato'

// Cria (sem id) ou atualiza (com id) um registro
export async function salvarRegistro(tabela: string, id: string | undefined, dados: Record<string, unknown>) {
  return id ? supabase.from(tabela).update(dados).eq('id', id) : supabase.from(tabela).insert(dados)
}

export async function excluirRegistro(tabela: string, id: string) {
  return supabase.from(tabela).delete().eq('id', id)
}

// Divide uma compra parcelada em lançamentos mensais. Os centavos que sobram
// da divisão vão para a primeira parcela, para a soma bater com o total.
export function gerarParcelas(totalCentavos: number, quantidade: number, dataInicial: string, descricao: string) {
  const base = Math.floor(totalCentavos / quantidade)
  const resto = totalCentavos - base * quantidade

  return Array.from({ length: quantidade }, (_, i) => ({
    descricao: `${descricao} (${i + 1}/${quantidade})`,
    valor: (base + (i === 0 ? resto : 0)) / 100,
    data: somarMeses(dataInicial, i),
  }))
}
