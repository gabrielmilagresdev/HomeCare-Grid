-- HomeCare Grid MVP schema. Apply only to a dedicated Supabase project after review.
create extension if not exists pgcrypto with schema extensions;
create extension if not exists btree_gist with schema extensions;

create table public.care_recipients (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 120),
  created_at timestamptz not null default now()
);
create index on public.care_recipients(owner_user_id);

create table public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.care_recipients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  can_book boolean not null default false,
  can_view_schedule boolean not null default false,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (recipient_id, user_id)
);
create index on public.family_memberships(user_id, recipient_id) where revoked_at is null;

create table public.services (
  id text primary key check (length(id) between 3 and 80),
  name text not null check (length(trim(name)) between 1 and 120),
  requires_credential boolean not null default false
);

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 120),
  hourly_price_cents integer not null check (hourly_price_cents >= 0),
  credential_status text not null default 'unverified' check (credential_status in ('unverified','verified','rejected')),
  accessibility_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  check (cardinality(accessibility_tags) <= 20)
);
create table public.professional_services (
  professional_id uuid not null references public.professionals(id) on delete cascade,
  service_id text not null references public.services(id),
  primary key (professional_id, service_id)
);
create table public.professional_areas (
  professional_id uuid not null references public.professionals(id) on delete cascade,
  region_code text not null check (length(region_code) between 2 and 40),
  primary key (professional_id, region_code)
);
create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (starts_at < ends_at)
);
create index on public.availability_slots(professional_id, starts_at, ends_at);

create table public.care_requests (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.care_recipients(id),
  requester_user_id uuid not null references auth.users(id),
  service_id text not null references public.services(id),
  region_code text not null check (length(region_code) between 2 and 40),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  required_accessibility_tags text[] not null default '{}',
  max_price_cents integer check (max_price_cents >= 0),
  created_at timestamptz not null default now(),
  check (starts_at < ends_at and ends_at <= starts_at + interval '12 hours'),
  check (cardinality(required_accessibility_tags) <= 20)
);
create index on public.care_requests(recipient_id, created_at desc);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.care_requests(id),
  requester_user_id uuid not null references auth.users(id),
  professional_id uuid not null references public.professionals(id),
  status text not null default 'requested' check (status in ('requested','accepted','rejected','cancelled','completed')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  version integer not null default 1 check (version >= 1),
  idempotency_key text not null check (length(idempotency_key) between 8 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_user_id, idempotency_key),
  check (starts_at < ends_at),
  constraint accepted_booking_no_overlap exclude using gist (
    professional_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status = 'accepted')
);
create index on public.bookings(professional_id, starts_at);

create table public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id),
  from_status text not null,
  to_status text not null,
  created_at timestamptz not null default now()
);
create index on public.booking_events(booking_id, created_at);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose = 'unserved_demand'),
  policy_version text not null check (length(policy_version) between 1 and 40),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);
create table public.unserved_demands (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  service_id text not null references public.services(id),
  region_code text not null check (length(region_code) between 2 and 40),
  consent_id uuid not null unique references public.consent_records(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- All private tables deny direct access unless an explicit policy and grant below allow it.
alter table public.care_recipients enable row level security;
alter table public.family_memberships enable row level security;
alter table public.services enable row level security;
alter table public.professionals enable row level security;
alter table public.professional_services enable row level security;
alter table public.professional_areas enable row level security;
alter table public.availability_slots enable row level security;
alter table public.care_requests enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_events enable row level security;
alter table public.consent_records enable row level security;
alter table public.unserved_demands enable row level security;

create or replace function public.is_recipient_owner(p_recipient_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.care_recipients r where r.id = p_recipient_id and r.owner_user_id = auth.uid()
  );
$$;
create or replace function public.can_access_recipient(p_recipient_id uuid, p_action text) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    public.is_recipient_owner(p_recipient_id) or exists (
      select 1 from public.family_memberships m
      where m.recipient_id = p_recipient_id and m.user_id = auth.uid() and m.revoked_at is null
        and ((p_action = 'book' and m.can_book) or (p_action = 'viewSchedule' and m.can_view_schedule))
    )
  );
$$;
create or replace function public.can_read_booking(p_booking_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.bookings b
    join public.care_requests r on r.id = b.request_id
    join public.professionals p on p.id = b.professional_id
    where b.id = p_booking_id and (p.user_id = auth.uid() or public.can_access_recipient(r.recipient_id, 'viewSchedule'))
  );
$$;
create or replace function public.can_read_request(p_request_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.care_requests r
    left join public.bookings b on b.request_id = r.id
    left join public.professionals p on p.id = b.professional_id
    where r.id = p_request_id and (p.user_id = auth.uid() or public.can_access_recipient(r.recipient_id, 'viewSchedule'))
  );
$$;

revoke all on public.care_recipients, public.family_memberships, public.services, public.professionals,
  public.professional_services, public.professional_areas, public.availability_slots, public.care_requests,
  public.bookings, public.booking_events, public.consent_records, public.unserved_demands from anon, authenticated;
revoke all on function public.is_recipient_owner(uuid), public.can_access_recipient(uuid,text), public.can_read_booking(uuid), public.can_read_request(uuid) from public, anon;
grant execute on function public.is_recipient_owner(uuid), public.can_access_recipient(uuid,text), public.can_read_booking(uuid), public.can_read_request(uuid) to authenticated;

grant select, insert (owner_user_id, display_name), update (display_name) on public.care_recipients to authenticated;
create policy recipient_read on public.care_recipients for select to authenticated using (
  public.can_access_recipient(id, 'viewSchedule') or public.can_access_recipient(id, 'book')
);
create policy recipient_insert on public.care_recipients for insert to authenticated with check (owner_user_id = auth.uid());
create policy recipient_update on public.care_recipients for update to authenticated using (public.is_recipient_owner(id)) with check (public.is_recipient_owner(id));

grant select, insert (recipient_id, user_id, can_book, can_view_schedule), update (can_book, can_view_schedule, revoked_at) on public.family_memberships to authenticated;
create policy membership_read on public.family_memberships for select to authenticated using (
  public.is_recipient_owner(recipient_id) or (user_id = auth.uid() and revoked_at is null)
);
create policy membership_insert on public.family_memberships for insert to authenticated with check (public.is_recipient_owner(recipient_id));
create policy membership_update on public.family_memberships for update to authenticated using (public.is_recipient_owner(recipient_id)) with check (public.is_recipient_owner(recipient_id));

grant select on public.services to anon, authenticated;
create policy service_read on public.services for select to anon, authenticated using (true);
grant select (id, display_name, hourly_price_cents, credential_status, accessibility_tags) on public.professionals to anon, authenticated;
create policy professional_read on public.professionals for select to anon, authenticated using (true);
grant select on public.professional_services, public.professional_areas, public.availability_slots to anon, authenticated;
create policy professional_service_read on public.professional_services for select to anon, authenticated using (true);
create policy professional_area_read on public.professional_areas for select to anon, authenticated using (true);
create policy availability_read on public.availability_slots for select to anon, authenticated using (true);

grant select on public.care_requests, public.bookings, public.booking_events, public.consent_records, public.unserved_demands to authenticated;
create policy request_read on public.care_requests for select to authenticated using (public.can_read_request(id));
create policy booking_read on public.bookings for select to authenticated using (public.can_read_booking(id));
create policy booking_event_read on public.booking_events for select to authenticated using (public.can_read_booking(booking_id));
create policy consent_read on public.consent_records for select to authenticated using (user_id = auth.uid());
create policy demand_read on public.unserved_demands for select to authenticated using (requester_user_id = auth.uid());
