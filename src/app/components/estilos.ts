// Classes completas por cor (o Tailwind não enxerga classes montadas com template string).
export type Cor = 'emerald' | 'red' | 'orange' | 'blue' | 'violet'

export const cores: Record<Cor, { botao: string; foco: string; suave: string; linha: string; borda: string; gradiente: string }> = {
  emerald: {
    botao: 'bg-emerald-500 hover:bg-emerald-600',
    foco: 'focus:ring-emerald-500 focus:border-emerald-500',
    suave: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    linha: 'hover:bg-emerald-50',
    borda: 'border-emerald-100',
    gradiente: 'from-emerald-500 to-emerald-600',
  },
  red: {
    botao: 'bg-red-500 hover:bg-red-600',
    foco: 'focus:ring-red-500 focus:border-red-500',
    suave: 'bg-red-100 text-red-700 hover:bg-red-200',
    linha: 'hover:bg-red-50',
    borda: 'border-red-100',
    gradiente: 'from-red-500 to-red-600',
  },
  orange: {
    botao: 'bg-orange-500 hover:bg-orange-600',
    foco: 'focus:ring-orange-500 focus:border-orange-500',
    suave: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    linha: 'hover:bg-orange-50',
    borda: 'border-orange-100',
    gradiente: 'from-orange-500 to-orange-600',
  },
  blue: {
    botao: 'bg-blue-500 hover:bg-blue-600',
    foco: 'focus:ring-blue-500 focus:border-blue-500',
    suave: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    linha: 'hover:bg-blue-50',
    borda: 'border-blue-100',
    gradiente: 'from-blue-500 to-blue-600',
  },
  violet: {
    botao: 'bg-violet-500 hover:bg-violet-600',
    foco: 'focus:ring-violet-500 focus:border-violet-500',
    suave: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
    linha: 'hover:bg-violet-50',
    borda: 'border-violet-100',
    gradiente: 'from-violet-500 to-violet-600',
  },
}

export const classeInput = (cor: Cor) =>
  `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 ${cores[cor].foco}`

export const classeLabel = 'block text-sm font-medium text-gray-700 mb-1'
