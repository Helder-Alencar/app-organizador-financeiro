'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { type Meta } from '@/lib/supabase'
import { avisarErro } from '@/lib/erros'
import { salvarRegistro } from '@/lib/lancamentos'
import { ModalBase } from './ModalBase'
import { CampoTexto, CampoValor } from './Campos'

interface ModalMetaProps {
  userId: string
  item?: Meta
  onClose: () => void
  onSuccess: () => void
}

export function ModalMeta({ userId, item, onClose, onSuccess }: ModalMetaProps) {
  const [salvando, setSalvando] = useState(false)
  const [nome, setNome] = useState(item?.nome ?? '')
  const [centavos, setCentavos] = useState(item ? Math.round(Number(item.valor_alvo) * 100) : 0)

  const salvar = async () => {
    if (centavos <= 0) return toast.error('Informe um valor maior que zero')
    setSalvando(true)
    const { error } = await salvarRegistro('metas', item?.id, { user_id: userId, nome, valor_alvo: centavos / 100 })
    setSalvando(false)
    if (error) return avisarErro('salvar a meta', error)

    toast.success(item ? 'Meta atualizada' : 'Meta criada')
    onSuccess()
    onClose()
  }

  return (
    <ModalBase titulo={item ? 'Editar Meta' : 'Nova Meta'} cor="violet" salvando={salvando} onClose={onClose} onSubmit={salvar}>
      <CampoTexto rotulo="Nome" valor={nome} onChange={setNome} cor="violet" placeholder="Ex: Viagem, Reserva de emergência..." />
      <CampoValor rotulo="Valor da meta" centavos={centavos} onChange={setCentavos} cor="violet" />
      <p className="text-sm text-gray-500">
        Para guardar dinheiro nesta meta, crie uma reserva e escolha a meta no campo &quot;Meta&quot;.
      </p>
    </ModalBase>
  )
}
