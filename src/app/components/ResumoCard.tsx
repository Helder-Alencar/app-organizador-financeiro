interface ResumoCardProps {
  titulo: string
  valor: number
  icon: React.ReactNode
  cor: 'emerald' | 'red' | 'orange' | 'blue'
}

const cores = {
  emerald: 'from-emerald-500 to-emerald-600',
  red: 'from-red-500 to-red-600',
  orange: 'from-orange-500 to-orange-600',
  blue: 'from-blue-500 to-blue-600',
}

export function ResumoCard({ titulo, valor, icon, cor }: ResumoCardProps) {
  return (
    <div className={`bg-gradient-to-br ${cores[cor]} rounded-xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium opacity-90">{titulo}</h3>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-bold">
        R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}
