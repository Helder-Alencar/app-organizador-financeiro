import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// Destino dos links enviados por e-mail (confirmação de cadastro e recuperação de senha):
// troca o código do link por uma sessão e segue para a página indicada em ?next=
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  // Só caminhos internos, para o link não poder redirecionar para outro site
  const destino = next?.startsWith('/') && !next.startsWith('//') ? next : '/'

  if (code) {
    const supabase = await createServerSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${destino}`)
  }

  return NextResponse.redirect(`${origin}/login?erro=link`)
}
