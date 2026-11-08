-- Explicit opt-in only; no free text or address is accepted by this API.
create or replace function public.record_unserved_demand(
  p_recipient_id uuid,
  p_service_id text,
  p_region_code text,
  p_policy_version text,
  p_consent boolean
) returns public.unserved_demands
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_consent_id uuid;
  v_demand public.unserved_demands;
begin
  if v_actor is null or not public.can_access_recipient(p_recipient_id, 'book') then
    raise exception 'not authorized for recipient' using errcode = '42501';
  end if;
  if p_consent is distinct from true then raise exception 'consent required' using errcode = '42501'; end if;
  if p_service_id is null or not exists (select 1 from public.services where id = p_service_id)
    or p_region_code is null or length(p_region_code) not between 2 and 40
    or p_policy_version is null or length(p_policy_version) not between 1 and 40 then
    raise exception 'invalid demand' using errcode = '22023';
  end if;
  insert into public.consent_records (user_id, purpose, policy_version)
  values (v_actor, 'unserved_demand', p_policy_version) returning id into v_consent_id;
  insert into public.unserved_demands (requester_user_id, service_id, region_code, consent_id)
  values (v_actor, p_service_id, p_region_code, v_consent_id) returning * into v_demand;
  return v_demand;
end;
$$;

create or replace function public.revoke_unserved_demand_consent()
returns integer language plpgsql volatile security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_count integer;
begin
  if v_actor is null then raise exception 'authentication required' using errcode = '42501'; end if;
  delete from public.unserved_demands d using public.consent_records c
  where d.consent_id = c.id and c.user_id = v_actor and c.purpose = 'unserved_demand' and c.revoked_at is null;
  update public.consent_records set revoked_at = now()
  where user_id = v_actor and purpose = 'unserved_demand' and revoked_at is null;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.demand_opportunities()
returns table (service_id text, region_code text, interest_band text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (select 1 from public.professionals p where p.user_id = auth.uid()) then
    raise exception 'professional access required' using errcode = '42501';
  end if;
  return query
    select d.service_id, d.region_code,
      case when count(*) >= 20 then '20+' when count(*) >= 10 then '10–19' else '5–9' end
    from public.unserved_demands d
    join public.consent_records c on c.id = d.consent_id
    where c.revoked_at is null and c.purpose = 'unserved_demand'
    group by d.service_id, d.region_code
    having count(*) >= 5;
end;
$$;

revoke all on function public.record_unserved_demand(uuid,text,text,text,boolean),
  public.revoke_unserved_demand_consent(), public.demand_opportunities() from public, anon;
grant execute on function public.record_unserved_demand(uuid,text,text,text,boolean),
  public.revoke_unserved_demand_consent(), public.demand_opportunities() to authenticated;
