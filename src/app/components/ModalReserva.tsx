'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { TIPOS_RESERVA, type Meta, type ReservaInvestimento, type TipoReserva } from '@/lib/supabase'
import { hojeISO } from '@/lib/formato'
import { avisarErro } from '@/lib/erros'
import { salvarRegistro } from '@/lib/lancamentos'
import { ModalBase } from './ModalBase'
import { CampoCategoria, CampoData, CampoTexto, CampoValor } from './Campos'
import { classeInput, classeLabel } from './estilos'

interface ModalReservaProps {
  userId: string
  metas: Meta[]
  item?: ReservaInvestimento
  onClose: () => void
  onSuccess: () => void
}

export function ModalReserva({ userId, metas, item, onClose, onSuccess }: ModalReservaProps) {
  const [salvando, setSalvando] = useState(false)
  const [descricao, setDescricao] = useState(item?.descricao ?? '')
  const [centavos, setCentavos] = useState(item ? Math.round(Number(item.valor) * 100) : 0)
  const [data, setData] = useState(item?.data ?? hojeISO())
  const [categoria, setCategoria] = useState(item?.categoria ?? '')
  const [tipo, setTipo] = useState<TipoReserva>(item?.tipo ?? 'investimento')
  const [metaId, setMetaId] = useState(item?.meta_id ?? '')

  // Escolher uma meta já marca o tipo como "Meta"
  const escolherMeta = (id: string) => {
    setMetaId(id)
    if (id) setTipo('meta')
  }

  const salvar = async () => {
    if (centavos <= 0) return toast.error('Informe um valor maior que zero')
    setSalvando(true)
    const { error } = await salvarRegistro('reservas_investimentos', item?.id, {
      user_id: userId,
      descricao,
      valor: centavos / 100,
      tipo,
      data,
      categoria: categoria || null,
      meta_id: metaId || null,
    })
    setSalvando(false)
    if (error) return avisarErro('salvar a reserva', error)

    toast.success(item ? 'Reserva atualizada' : 'Reserva adicionada')
    onSuccess()
    onClose()
  }

  return (
    <ModalBase
      titulo={item ? 'Editar Reserva/Investimento' : 'Nova Reserva/Investimento'}
      cor="blue"
      salvando={salvando}
      onClose={onClose}
      onSubmit={salvar}
    >
      <CampoTexto rotulo="Descrição" valor={descricao} onChange={setDescricao} cor="blue" placeholder="Ex: Tesouro Direto, Poupança..." />
      <CampoValor centavos={centavos} onChange={setCentavos} cor="blue" />
      <CampoData valor={data} onChange={setData} cor="blue" />

      <div>
        <label className={classeLabel}>Tipo *</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoReserva)} className={classeInput('blue')}>
          {Object.entries(TIPOS_RESERVA).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
      </div>

      <CampoCategoria tipo="reserva" userId={userId} valor={categoria} onChange={setCategoria} cor="blue" />

      {metas.length > 0 && (
        <div>
          <label className={classeLabel}>Meta</label>
          <select value={metaId} onChange={(e) => escolherMeta(e.target.value)} className={classeInput('blue')}>
            <option value="">Nenhuma</option>
            {metas.map((meta) => (
              <option key={meta.id} value={meta.id}>
                {meta.nome}
              </option>
            ))}
          </select>
        </div>
      )}
    </ModalBase>
  )
}
