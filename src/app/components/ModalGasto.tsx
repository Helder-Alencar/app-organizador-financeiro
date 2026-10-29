'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { supabase, type Gasto } from '@/lib/supabase'
import { formatarMoeda, hojeISO } from '@/lib/formato'
import { avisarErro } from '@/lib/erros'
import { gerarParcelas, salvarRegistro } from '@/lib/lancamentos'
import { ModalBase } from './ModalBase'
import { CampoCategoria, CampoData, CampoTexto, CampoValor } from './Campos'
import { classeInput, classeLabel } from './estilos'

interface ModalGastoProps {
  userId: string
  item?: Gasto
  onClose: () => void
  onSuccess: () => void
}

const FORMAS_PAGAMENTO = ['Dinheiro', 'Débito', 'Crédito', 'PIX']

export function ModalGasto({ userId, item, onClose, onSuccess }: ModalGastoProps) {
  const [salvando, setSalvando] = useState(false)
  const [descricao, setDescricao] = useState(item?.descricao ?? '')
  const [centavos, setCentavos] = useState(item ? Math.round(Number(item.valor) * 100) : 0)
  const [data, setData] = useState(item?.data ?? hojeISO())
  const [categoria, setCategoria] = useState(item?.categoria ?? '')
  const [formaPagamento, setFormaPagamento] = useState(item?.forma_pagamento ?? '')
  const [parcelas, setParcelas] = useState(1)

  // Parcelamento só ao criar: na edição, cada parcela já é um lançamento próprio
  const podeParcelar = !item && formaPagamento === 'Crédito'
  const quantidadeParcelas = podeParcelar ? parcelas : 1

  const salvar = async () => {
    if (centavos <= 0) return toast.error('Informe um valor maior que zero')
    setSalvando(true)

    const comum = { user_id: userId, categoria: categoria || null, forma_pagamento: formaPagamento || null }
    const { error } =
      quantidadeParcelas > 1
        ? await supabase
            .from('gastos')
            .insert(gerarParcelas(centavos, quantidadeParcelas, data, descricao).map((p) => ({ ...comum, ...p })))
        : await salvarRegistro('gastos', item?.id, { ...comum, descricao, valor: centavos / 100, data })

    setSalvando(false)
    if (error) return avisarErro('salvar o gasto', error)

    toast.success(
      item ? 'Gasto atualizado' : quantidadeParcelas > 1 ? `${quantidadeParcelas} parcelas adicionadas` : 'Gasto adicionado'
    )
    onSuccess()
    onClose()
  }

  return (
    <ModalBase titulo={item ? 'Editar Gasto' : 'Novo Gasto'} cor="red" salvando={salvando} onClose={onClose} onSubmit={salvar}>
      <CampoTexto rotulo="Descrição" valor={descricao} onChange={setDescricao} cor="red" placeholder="Ex: Mercado, Combustível..." />
      <CampoValor rotulo={quantidadeParcelas > 1 ? 'Valor total' : 'Valor'} centavos={centavos} onChange={setCentavos} cor="red" />
      <CampoData rotulo={quantidadeParcelas > 1 ? 'Data da 1ª parcela' : 'Data'} valor={data} onChange={setData} cor="red" />
      <CampoCategoria tipo="gasto" userId={userId} valor={categoria} onChange={setCategoria} cor="red" />

      <div>
        <label className={classeLabel}>Forma de Pagamento</label>
        <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className={classeInput('red')}>
          <option value="">Selecione...</option>
          {FORMAS_PAGAMENTO.map((forma) => (
            <option key={forma} value={forma}>
              {forma}
            </option>
          ))}
        </select>
      </div>

      {podeParcelar && (
        <div>
          <label className={classeLabel}>Parcelas</label>
          <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className={classeInput('red')}>
            {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? 'À vista' : `${n}x de ${formatarMoeda(centavos / 100 / n)}`}
              </option>
            ))}
          </select>
          {parcelas > 1 && (
            <p className="text-xs text-gray-500 mt-1">Cria um gasto por mês, a partir da data da 1ª parcela.</p>
          )}
        </div>
      )}
    </ModalBase>
  )
}
