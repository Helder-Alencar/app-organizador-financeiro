'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { type ContaFixa } from '@/lib/supabase'
import { hojeISO } from '@/lib/formato'
import { avisarErro } from '@/lib/erros'
import { salvarRegistro } from '@/lib/lancamentos'
import { ModalBase } from './ModalBase'
import { CampoCategoria, CampoTexto, CampoValor } from './Campos'
import { classeInput, classeLabel } from './estilos'

interface ModalContaProps {
  userId: string
  item?: ContaFixa
  onClose: () => void
  onSuccess: () => void
}

export function ModalConta({ userId, item, onClose, onSuccess }: ModalContaProps) {
  const [salvando, setSalvando] = useState(false)
  const [descricao, setDescricao] = useState(item?.descricao ?? '')
  const [centavos, setCentavos] = useState(item ? Math.round(Number(item.valor) * 100) : 0)
  const [diaVencimento, setDiaVencimento] = useState(item?.dia_vencimento ?? Number(hojeISO().slice(8, 10)))
  const [categoria, setCategoria] = useState(item?.categoria ?? '')

  const salvar = async () => {
    if (centavos <= 0) return toast.error('Informe um valor maior que zero')
    setSalvando(true)
    const { error } = await salvarRegistro('contas_fixas', item?.id, {
      user_id: userId,
      descricao,
      valor: centavos / 100,
      dia_vencimento: diaVencimento,
      categoria: categoria || null,
      ativa: true,
    })
    setSalvando(false)
    if (error) return avisarErro('salvar a conta', error)

    toast.success(item ? 'Conta atualizada' : 'Conta adicionada')
    onSuccess()
    onClose()
  }

  return (
    <ModalBase titulo={item ? 'Editar Conta Fixa' : 'Nova Conta Fixa'} cor="orange" salvando={salvando} onClose={onClose} onSubmit={salvar}>
      <CampoTexto rotulo="Descrição" valor={descricao} onChange={setDescricao} cor="orange" placeholder="Ex: Aluguel, Internet..." />
      <CampoValor rotulo="Valor mensal" centavos={centavos} onChange={setCentavos} cor="orange" />
      <div>
        <label className={classeLabel}>Dia do vencimento *</label>
        <select value={diaVencimento} onChange={(e) => setDiaVencimento(Number(e.target.value))} className={classeInput('orange')}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
            <option key={dia} value={dia}>
              Dia {dia}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">A conta vence todo mês neste dia.</p>
      </div>
      <CampoCategoria tipo="conta" userId={userId} valor={categoria} onChange={setCategoria} cor="orange" />
    </ModalBase>
  )
}
