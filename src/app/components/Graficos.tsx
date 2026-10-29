'use client'

import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatarMoeda, formatarMoedaCompacta } from '@/lib/formato'

// Paleta categórica validada (contraste e daltonismo) para fundo branco
const COR_SERIE_1 = '#2a78d6'
const COR_SERIE_2 = '#eb6834'
const COR_GRADE = '#e1e0d9'
const COR_EIXO = '#898781'

const estiloTooltip = {
  contentStyle: { borderRadius: 8, border: '1px solid rgba(11,11,11,0.10)', fontSize: 13 },
  cursor: { fill: 'rgba(11,11,11,0.04)' },
}

function Painel({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900">{titulo}</h2>
      <p className="text-sm text-gray-600 mb-4">{subtitulo}</p>
      {children}
    </div>
  )
}

// Os mesmos números do gráfico, em tabela (acessibilidade e conferência)
function VerComoTabela({ cabecalho, linhas }: { cabecalho: string[]; linhas: (string | number)[][] }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-gray-600 hover:text-gray-900">Ver como tabela</summary>
      <table className="w-full mt-2">
        <thead>
          <tr className="border-b border-gray-200">
            {cabecalho.map((c, i) => (
              <th key={c} className={`py-1 px-2 font-semibold text-gray-700 ${i === 0 ? 'text-left' : 'text-right'}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={String(linha[0])} className="border-b border-gray-100">
              {linha.map((celula, i) => (
                <td key={i} className={`py-1 px-2 ${i === 0 ? 'text-left text-gray-900' : 'text-right tabular-nums text-gray-700'}`}>
                  {typeof celula === 'number' ? formatarMoeda(celula) : celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}

export interface FatiaCategoria {
  categoria: string
  valor: number
}

export function GastosPorCategoria({ dados }: { dados: FatiaCategoria[] }) {
  // Barras de 24px + respiro; o gráfico cresce com o número de categorias
  const altura = Math.max(120, dados.length * 40 + 20)

  return (
    <Painel titulo="Gastos por categoria" subtitulo="No período selecionado">
      {dados.length === 0 ? (
        <p className="text-center py-8 text-gray-500">Nenhum gasto no período</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={altura}>
            <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 90, bottom: 0, left: 0 }}>
              <CartesianGrid horizontal={false} stroke={COR_GRADE} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="categoria"
                width={110}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#52514e', fontSize: 13 }}
              />
              <Tooltip {...estiloTooltip} formatter={(v: number) => [formatarMoeda(v), 'Gasto']} />
              <Bar dataKey="valor" fill={COR_SERIE_1} radius={[0, 4, 4, 0]} maxBarSize={24}>
                <LabelList
                  dataKey="valor"
                  position="right"
                  formatter={(v: number) => formatarMoeda(v)}
                  style={{ fill: '#52514e', fontSize: 12 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <VerComoTabela cabecalho={['Categoria', 'Valor']} linhas={dados.map((d) => [d.categoria, d.valor])} />
        </>
      )}
    </Painel>
  )
}

export interface MesResumo {
  mes: string
  entradas: number
  saidas: number
}

export function EvolucaoMensal({ dados }: { dados: MesResumo[] }) {
  return (
    <Painel titulo="Últimos 6 meses" subtitulo="Entradas x saídas (gastos + contas pagas)">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={dados} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke={COR_GRADE} />
          <XAxis dataKey="mes" tickLine={false} axisLine={{ stroke: '#c3c2b7' }} tick={{ fill: COR_EIXO, fontSize: 12 }} />
          <YAxis
            tickFormatter={formatarMoedaCompacta}
            tickLine={false}
            axisLine={false}
            tick={{ fill: COR_EIXO, fontSize: 12 }}
            width={80}
          />
          <Tooltip {...estiloTooltip} formatter={(v: number, nome: string) => [formatarMoeda(v), nome]} />
          <Legend verticalAlign="top" align="left" iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13, paddingBottom: 8 }} />
          <Bar dataKey="entradas" name="Entradas" fill={COR_SERIE_1} radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="saidas" name="Saídas" fill={COR_SERIE_2} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
      <VerComoTabela
        cabecalho={['Mês', 'Entradas', 'Saídas', 'Diferença']}
        linhas={dados.map((d) => [d.mes, d.entradas, d.saidas, d.entradas - d.saidas])}
      />
    </Painel>
  )
}
