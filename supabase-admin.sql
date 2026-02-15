-- Admin invite + RLS hardening
-- Run in Supabase SQL editor (or as a migration)

-- 1) Pending invites table
create table if not exists public.pending_admin_invites (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.pending_admin_invites enable row level security;

-- 2) Ensure admins table exists (project already uses it)
create table if not exists public.admins (
  user_id uuid primary key
);

alter table public.admins enable row level security;

-- 3) Helper predicate (keeps policies readable)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.admins a
    where a.user_id = uid
  );
$$;

-- 4) Lock down admins table
-- Allow admins to read admin list
drop policy if exists "admins_select_admin" on public.admins;
create policy "admins_select_admin" on public.admins
for select
to authenticated
using (public.is_admin(auth.uid()));

-- Allow admins to manage admin list (optional but useful)
drop policy if exists "admins_insert_admin" on public.admins;
create policy "admins_insert_admin" on public.admins
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "admins_delete_admin" on public.admins;
create policy "admins_delete_admin" on public.admins
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- 5) Pending invites: only admins can view/manage
alter table public.pending_admin_invites force row level security;

drop policy if exists "pending_invites_select_admin" on public.pending_admin_invites;
create policy "pending_invites_select_admin" on public.pending_admin_invites
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "pending_invites_insert_admin" on public.pending_admin_invites;
create policy "pending_invites_insert_admin" on public.pending_admin_invites
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "pending_invites_delete_admin" on public.pending_admin_invites;
create policy "pending_invites_delete_admin" on public.pending_admin_invites
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- 6) Admin-managed tables: admin-only writes
-- Note: we do NOT change your existing public read patterns here.
-- Add public read policies as needed in your project.

-- announcements
alter table public.announcements enable row level security;
drop policy if exists "announcements_write_admin" on public.announcements;
create policy "announcements_write_admin" on public.announcements
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- events
alter table public.events enable row level security;
drop policy if exists "events_write_admin" on public.events;
create policy "events_write_admin" on public.events
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- members
alter table public.members enable row level security;
drop policy if exists "members_write_admin" on public.members;
create policy "members_write_admin" on public.members
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- highlights
alter table public.highlights enable row level security;
drop policy if exists "highlights_write_admin" on public.highlights;
create policy "highlights_write_admin" on public.highlights
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- site_settings
alter table public.site_settings enable row level security;
drop policy if exists "site_settings_write_admin" on public.site_settings;
create policy "site_settings_write_admin" on public.site_settings
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- contact_messages
alter table public.contact_messages enable row level security;

-- Let anyone submit contact form (insert-only) if you want the public form to work.
-- This assumes your existing Contact form uses the anon key.
drop policy if exists "contact_messages_insert_public" on public.contact_messages;
create policy "contact_messages_insert_public" on public.contact_messages
for insert
to anon
with check (true);

-- Admins can read/manage messages

drop policy if exists "contact_messages_select_admin" on public.contact_messages;
create policy "contact_messages_select_admin" on public.contact_messages
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "contact_messages_delete_admin" on public.contact_messages;
create policy "contact_messages_delete_admin" on public.contact_messages
for delete
to authenticated
using (public.is_admin(auth.uid()));
