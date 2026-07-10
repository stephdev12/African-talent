-- ============================================================
-- Schema pour le site de vote du concours musical
-- A copier/coller dans Supabase > SQL Editor > New query > Run
-- ============================================================

create extension if not exists "pgcrypto";

-- Catégories fixes du concours
create type public.candidate_category as enum ('gospel', 'moderne_urbain');

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,               -- utilisé dans le lien direct /candidat/{slug}
  full_name text not null,
  category public.candidate_category not null,
  photo_url text,
  bio text,
  paid_votes integer not null default 0,   -- votes obtenus via paiement confirmé
  manual_votes integer not null default 0, -- ajustement manuel par l'admin (+/-)
  is_active boolean not null default true, -- désactiver un candidat sans le supprimer
  created_at timestamptz not null default now()
);

-- Colonne calculée pratique pour trier
create or replace view public.candidates_with_total as
select
  c.*,
  (c.paid_votes + c.manual_votes) as total_votes
from public.candidates c;

-- Transactions Fapshi (une ligne par tentative de paiement)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  trans_id text unique,                    -- transId renvoyé par Fapshi
  external_id text unique not null,        -- notre référence interne envoyée à Fapshi
  nb_votes integer not null,               -- nombre de votes achetés (multiple de 10)
  amount integer not null,                 -- montant en FCFA
  status text not null default 'PENDING',  -- PENDING | SUCCESSFUL | FAILED | EXPIRED
  payer_phone text,
  payer_name text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index if not exists idx_transactions_candidate on public.transactions(candidate_id);
create index if not exists idx_transactions_status on public.transactions(status);

-- Historique des ajustements manuels faits par l'admin (traçabilité)
create table if not exists public.manual_adjustments (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  delta integer not null,                  -- peut être négatif
  reason text,
  created_at timestamptz not null default now()
);

-- Fonction atomique pour incrémenter les votes payés d'un candidat
-- (utilisée par le webhook Fapshi et par l'ajustement manuel admin)
create or replace function public.increment_paid_votes(p_candidate_id uuid, p_delta integer)
returns void as $$
begin
  update public.candidates
  set paid_votes = paid_votes + p_delta
  where id = p_candidate_id;
end;
$$ language plpgsql security definer;

create or replace function public.increment_manual_votes(p_candidate_id uuid, p_delta integer)
returns void as $$
begin
  update public.candidates
  set manual_votes = manual_votes + p_delta
  where id = p_candidate_id;
end;
$$ language plpgsql security definer;

-- RLS : lecture publique des candidats et du classement, écriture uniquement via le backend (service role)
alter table public.candidates enable row level security;
alter table public.transactions enable row level security;
alter table public.manual_adjustments enable row level security;

create policy "Lecture publique des candidats actifs"
  on public.candidates for select
  using (true);

-- Aucune policy d'écriture publique n'est créée : seules les routes API
-- (via la clé service_role côté serveur, qui contourne RLS) peuvent modifier les données.
