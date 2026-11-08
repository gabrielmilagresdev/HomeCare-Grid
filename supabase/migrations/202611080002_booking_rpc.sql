-- All booking writes use these RPCs. The caller identity comes only from auth.uid().
create or replace function public.request_booking(
  p_recipient_id uuid,
  p_professional_id uuid,
  p_service_id text,
  p_region_code text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_required_accessibility_tags text[],
  p_max_price_cents integer,
  p_idempotency_key text
) returns public.bookings
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_request_id uuid;
  v_booking public.bookings;
  v_request public.care_requests;
  v_professional public.professionals;
  v_service public.services;
begin
  if v_actor is null or not public.can_access_recipient(p_recipient_id, 'book') then
    raise exception 'not authorized for recipient' using errcode = '42501';
  end if;
  if p_idempotency_key is null or length(p_idempotency_key) not between 8 and 120 then
    raise exception 'invalid booking request' using errcode = '22023';
  end if;

  select * into v_booking from public.bookings
  where requester_user_id = v_actor and idempotency_key = p_idempotency_key;
  if found then
    select * into v_request from public.care_requests where id = v_booking.request_id;
    if v_booking.professional_id = p_professional_id and v_request.recipient_id = p_recipient_id
      and v_request.service_id = p_service_id and v_request.region_code = p_region_code
      and v_request.starts_at = p_starts_at and v_request.ends_at = p_ends_at
      and v_request.required_accessibility_tags = p_required_accessibility_tags
      and v_request.max_price_cents is not distinct from p_max_price_cents then
      return v_booking;
    end if;
    raise exception 'idempotency key reused with different input' using errcode = '23P01';
  end if;

  if p_starts_at is null or p_ends_at is null or p_starts_at <= now() or p_ends_at <= p_starts_at
    or p_ends_at > p_starts_at + interval '12 hours'
    or p_region_code is null or length(p_region_code) not between 2 and 40
    or p_required_accessibility_tags is null or cardinality(p_required_accessibility_tags) > 20
    or (p_max_price_cents is not null and p_max_price_cents < 0) then
    raise exception 'invalid booking request' using errcode = '22023';
  end if;

  select * into v_professional from public.professionals where id = p_professional_id;
  select * into v_service from public.services where id = p_service_id;
  if v_professional.id is null or v_service.id is null
    or (v_service.requires_credential and v_professional.credential_status <> 'verified')
    or (p_max_price_cents is not null and v_professional.hourly_price_cents > p_max_price_cents)
    or not (p_required_accessibility_tags <@ v_professional.accessibility_tags)
    or not exists (select 1 from public.professional_services ps where ps.professional_id = p_professional_id and ps.service_id = p_service_id)
    or not exists (select 1 from public.professional_areas pa where pa.professional_id = p_professional_id and pa.region_code = p_region_code)
    or not exists (select 1 from public.availability_slots slot where slot.professional_id = p_professional_id and slot.starts_at <= p_starts_at and slot.ends_at >= p_ends_at) then
    raise exception 'professional unavailable for filters' using errcode = '23P01';
  end if;

  begin
    insert into public.care_requests (recipient_id, requester_user_id, service_id, region_code, starts_at, ends_at, required_accessibility_tags, max_price_cents)
    values (p_recipient_id, v_actor, p_service_id, p_region_code, p_starts_at, p_ends_at, p_required_accessibility_tags, p_max_price_cents)
    returning id into v_request_id;
    insert into public.bookings (request_id, requester_user_id, professional_id, status, starts_at, ends_at, version, idempotency_key)
    values (v_request_id, v_actor, p_professional_id, 'requested', p_starts_at, p_ends_at, 1, p_idempotency_key)
    returning * into v_booking;
  exception when unique_violation then
    -- A simultaneous retry may have won. The losing subtransaction is rolled back.
    select * into v_booking from public.bookings
    where requester_user_id = v_actor and idempotency_key = p_idempotency_key;
    if v_booking.id is null then raise; end if;
    select * into v_request from public.care_requests where id = v_booking.request_id;
    if v_booking.professional_id <> p_professional_id or v_request.recipient_id <> p_recipient_id
      or v_request.service_id <> p_service_id or v_request.region_code <> p_region_code
      or v_request.starts_at <> p_starts_at or v_request.ends_at <> p_ends_at
      or v_request.required_accessibility_tags <> p_required_accessibility_tags
      or v_request.max_price_cents is distinct from p_max_price_cents then
      raise exception 'idempotency key reused with different input' using errcode = '23P01';
    end if;
  end;
  return v_booking;
end;
$$;

create or replace function public.transition_booking(
  p_booking_id uuid,
  p_to_status text,
  p_expected_version integer
) returns public.bookings
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_booking public.bookings;
  v_request public.care_requests;
  v_professional public.professionals;
  v_service public.services;
  v_from text;
begin
  if v_actor is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if v_booking.id is null then raise exception 'booking not found' using errcode = 'P0002'; end if;
  select * into v_request from public.care_requests where id = v_booking.request_id;
  select * into v_professional from public.professionals where id = v_booking.professional_id;
  select * into v_service from public.services where id = v_request.service_id;
  if p_expected_version is distinct from v_booking.version then
    raise exception 'stale booking version' using errcode = '23P01';
  end if;
  if not (
    (v_booking.status = 'requested' and p_to_status in ('accepted','rejected','cancelled'))
    or (v_booking.status = 'accepted' and p_to_status in ('cancelled','completed'))
  ) then raise exception 'invalid status transition' using errcode = '23P01'; end if;

  if p_to_status in ('accepted','rejected','completed') and v_professional.user_id <> v_actor then
    raise exception 'only target professional may act' using errcode = '42501';
  end if;
  if p_to_status = 'cancelled' and v_professional.user_id <> v_actor
    and not public.can_access_recipient(v_request.recipient_id, 'book') then
    raise exception 'not authorized to cancel' using errcode = '42501';
  end if;
  if p_to_status = 'completed' and now() < v_booking.ends_at then
    raise exception 'service has not ended' using errcode = '23P01';
  end if;
  if p_to_status = 'accepted' and (
    (v_service.requires_credential and v_professional.credential_status <> 'verified')
    or not exists (select 1 from public.professional_services ps where ps.professional_id = v_booking.professional_id and ps.service_id = v_request.service_id)
    or not exists (select 1 from public.professional_areas pa where pa.professional_id = v_booking.professional_id and pa.region_code = v_request.region_code)
    or not exists (select 1 from public.availability_slots slot where slot.professional_id = v_booking.professional_id and slot.starts_at <= v_booking.starts_at and slot.ends_at >= v_booking.ends_at)
  ) then raise exception 'professional no longer available' using errcode = '23P01'; end if;

  v_from := v_booking.status;
  update public.bookings set status = p_to_status, version = version + 1, updated_at = now()
  where id = p_booking_id returning * into v_booking;
  -- The exclusion constraint rejects overlapping accepted intervals, including concurrent accepts.
  insert into public.booking_events (booking_id, actor_user_id, from_status, to_status)
  values (p_booking_id, v_actor, v_from, p_to_status);
  return v_booking;
end;
$$;

revoke all on function public.request_booking(uuid,uuid,text,text,timestamptz,timestamptz,text[],integer,text),
  public.transition_booking(uuid,text,integer) from public, anon;
grant execute on function public.request_booking(uuid,uuid,text,text,timestamptz,timestamptz,text[],integer,text),
  public.transition_booking(uuid,text,integer) to authenticated;
