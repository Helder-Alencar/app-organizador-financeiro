-- Organizador Financeiro: melhorias de 28/10/2026
--
-- Como rodar: Supabase > SQL Editor > New query > cole este arquivo inteiro > Run.
-- Tudo roda numa transação: se algo falhar, nada é alterado. Pode rodar mais de uma vez.

begin;

-- 1. Colunas que o app usa e que podem não existir ainda
alter table public.contas_fixas add column if not exists categoria text;
alter table public.reservas_investimentos add column if not exists categoria text;

-- 2. Categorias cadastradas pelo usuário (antes elas sumiam se nenhum lançamento as usasse)
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null,
  tipo text not null,
  created_at timestamptz not null default now()
);
alter table public.categorias drop constraint if exists categorias_tipo_check;
alter table public.categorias add constraint categorias_tipo_check
  check (tipo in ('entrada', 'gasto', 'conta', 'reserva'));

-- 3. Pagamentos de contas fixas: uma linha por conta e mês pago
create table if not exists public.contas_pagamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  conta_id uuid not null references public.contas_fixas (id) on delete cascade,
  mes text not null check (mes ~ '^\d{4}-\d{2}$'),
  valor numeric(12, 2) not null,
  data_pagamento date not null default current_date,
  created_at timestamptz not null default now(),
  unique (conta_id, mes)
);
create index if not exists contas_pagamentos_user_data_idx
  on public.contas_pagamentos (user_id, data_pagamento);

-- 4. Metas para as reservas
create table if not exists public.metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null,
  valor_alvo numeric(12, 2) not null check (valor_alvo > 0),
  created_at timestamptz not null default now()
);
alter table public.reservas_investimentos
  add column if not exists meta_id uuid references public.metas (id) on delete set null;

grant select, insert, update, delete on public.categorias, public.contas_pagamentos, public.metas to authenticated;

-- 5. Segurança (RLS): cada usuário só enxerga e altera os próprios dados.
-- Remove TODAS as políticas existentes nessas tabelas (inclusive alguma permissiva
-- demais criada antes) e cria uma única política por tabela.
do $$
declare
  tabela text;
  politica record;
begin
  foreach tabela in array array[
    'users_profile', 'entradas', 'gastos', 'contas_fixas', 'reservas_investimentos',
    'categorias', 'contas_pagamentos', 'metas'
  ] loop
    execute format('alter table public.%I enable row level security', tabela);

    for politica in
      select policyname from pg_policies where schemaname = 'public' and tablename = tabela
    loop
      execute format('drop policy %I on public.%I', politica.policyname, tabela);
    end loop;

    execute format(
      'create policy "dono_dos_dados" on public.%I for all to authenticated
         using ((select auth.uid()) = user_id)
         with check ((select auth.uid()) = user_id)',
      tabela
    );
  end loop;
end $$;

commit;
