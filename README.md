# 💰 Organizador Financeiro

Controle de finanças pessoais: entradas, gastos (com parcelamento no crédito), contas fixas com controle de pagamento mensal, reservas/investimentos e metas.

Feito com Next.js 15, React 19, Tailwind CSS 4 e Supabase (login e banco de dados). Publicado em https://app-organizador-financeiro.vercel.app.

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha com a URL e a chave anon do projeto Supabase (Project Settings > API).

3. Suba o servidor e abra http://localhost:3000:

   ```bash
   npm run dev
   ```

Outros comandos: `npm run build` (build de produção, também verifica os tipos) e `npm run lint`.

## Banco de dados (Supabase)

As tabelas usadas são:

| Tabela | Conteúdo |
|---|---|
| `users_profile` | Nome de exibição de cada usuário |
| `entradas` | Receitas |
| `gastos` | Despesas (cada parcela de uma compra parcelada é uma linha) |
| `contas_fixas` | Contas mensais, com o dia do mês em `dia_vencimento` |
| `contas_pagamentos` | Uma linha por conta e mês pago (`mes` = `YYYY-MM`) |
| `reservas_investimentos` | Dinheiro guardado; `tipo` é `reserva_emergencia`, `meta` ou `investimento`, e `meta_id` liga a uma meta |
| `metas` | Objetivos com valor-alvo |
| `categorias` | Categorias criadas pelo usuário, por tipo (`entrada`, `gasto`, `conta`, `reserva`) |

As alterações de estrutura ficam em [`supabase/migrations`](supabase/migrations). Para aplicar, abra o SQL Editor do Supabase, cole o arquivo e rode. Os scripts podem ser executados mais de uma vez.

**Segurança:** todas as tabelas têm RLS ativo com a política `dono_dos_dados`: cada usuário só lê e altera as linhas em que `user_id` é o seu próprio id.

## Autenticação

- O login usa cookies (`@supabase/ssr`), e o [`src/middleware.ts`](src/middleware.ts) bloqueia as páginas para quem não está logado.
- Os links enviados por e-mail (confirmação de cadastro e "Esqueci minha senha") passam por [`/auth/callback`](src/app/auth/callback/route.ts).
- No Supabase, em **Authentication > URL Configuration**, as URLs `https://app-organizador-financeiro.vercel.app/**` e `http://localhost:3000/**` precisam estar em **Redirect URLs**.

## Como os totais são calculados

Para o período escolhido no filtro:

- **Saldo do período** = entradas − gastos − contas fixas pagas − reservas.
- **Contas fixas** entram no saldo quando são marcadas como pagas, na data do pagamento.
- Na aba **Este Mês**, os cards de entradas e gastos comparam com o mês anterior.
