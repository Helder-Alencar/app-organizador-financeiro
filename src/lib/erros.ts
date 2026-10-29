import { toast } from 'sonner'

// Mostra o erro para o usuário (em vez de falhar em silêncio) e registra no console.
export function avisarErro(acao: string, erro: { message?: string } | null | undefined) {
  console.error(`Erro ao ${acao}:`, erro)
  toast.error(`Não foi possível ${acao}`, { description: erro?.message })
}
