import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Páginas acessíveis sem login
const ROTAS_PUBLICAS = ['/login', '/auth/callback']

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        // Repassa os cookies renovados da sessão para a página e para o navegador
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // getUser() valida a sessão no Supabase; getSession() só leria o cookie, sem verificar
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const caminho = req.nextUrl.pathname
  const rotaPublica = ROTAS_PUBLICAS.some((rota) => caminho.startsWith(rota))

  if (!user && !rotaPublica) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (user && caminho === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
