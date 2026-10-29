'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { type Entrada } from '@/lib/supabase'
import { hojeISO } from '@/lib/formato'
import { avisarErro } from '@/lib/erros'
import { salvarRegistro } from '@/lib/lancamentos'
import { ModalBase } from './ModalBase'
import { CampoCategoria, CampoData, CampoTexto, CampoValor } from './Campos'

interface ModalEntradaProps {
  userId: string
  item?: Entrada
  onClose: () => void
  onSuccess: () => void
}

export function ModalEntrada({ userId, item, onClose, onSuccess }: ModalEntradaProps) {
  const [salvando, setSalvando] = useState(false)
  const [descricao, setDescricao] = useState(item?.descricao ?? '')
  const [centavos, setCentavos] = useState(item ? Math.round(Number(item.valor) * 100) : 0)
  const [data, setData] = useState(item?.data ?? hojeISO())
  const [categoria, setCategoria] = useState(item?.categoria ?? '')

  const salvar = async () => {
    if (centavos <= 0) return toast.error('Informe um valor maior que zero')
    setSalvando(true)
    const { error } = await salvarRegistro('entradas', item?.id, {
      user_id: userId,
      descricao,
      valor: centavos / 100,
      data,
      categoria: categoria || null,
    })
    setSalvando(false)
    if (error) return avisarErro('salvar a entrada', error)

    toast.success(item ? 'Entrada atualizada' : 'Entrada adicionada')
    onSuccess()
    onClose()
  }

  return (
    <ModalBase titulo={item ? 'Editar Entrada' : 'Nova Entrada'} cor="emerald" salvando={salvando} onClose={onClose} onSubmit={salvar}>
      <CampoTexto rotulo="Descrição" valor={descricao} onChange={setDescricao} cor="emerald" placeholder="Ex: Salário, Freelance..." />
      <CampoValor centavos={centavos} onChange={setCentavos} cor="emerald" />
      <CampoData valor={data} onChange={setData} cor="emerald" />
      <CampoCategoria tipo="entrada" userId={userId} valor={categoria} onChange={setCategoria} cor="emerald" />
    </ModalBase>
  )
}
