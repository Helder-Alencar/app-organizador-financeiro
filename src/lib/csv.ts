// CSV no padrão do Excel em português: separador ";", vírgula decimal e BOM
// para o Excel reconhecer os acentos.
export function baixarCSV(nomeArquivo: string, cabecalho: string[], linhas: (string | number)[][]) {
  const celula = (valor: string | number) => {
    const texto = typeof valor === 'number' ? valor.toFixed(2).replace('.', ',') : valor
    return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
  }

  const conteudo = [cabecalho, ...linhas].map((linha) => linha.map(celula).join(';')).join('\r\n')
  const blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
}
