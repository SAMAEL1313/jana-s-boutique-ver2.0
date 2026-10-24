-- Login rate limiting, revocable sessions and saved shipping addresses.

-- ---------- rate limiting ----------

-- One row per throttled key (e.g. "login:email:jane@example.com"), counting
-- attempts in a fixed window.
create table public.rate_limits (
  key text primary key,
  count integer not null,
  window_start timestamptz not null
);

alter table public.rate_limits enable row level security;

-- Records an attempt against p_key. Returns 0 if it is allowed, or the number
-- of seconds until the window resets if p_limit has been exceeded.
create function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_window interval := make_interval(secs => p_window_seconds);
  v_row public.rate_limits;
begin
  insert into public.rate_limits as r (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update set
    count = case when r.window_start <= now() - v_window then 1 else r.count + 1 end,
    window_start = case when r.window_start <= now() - v_window then now() else r.window_start end
  returning * into v_row;

  -- Occasionally drop stale rows so the table stays small.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  if v_row.count > p_limit then
    return greatest(1, ceil(extract(epoch from (v_row.window_start + v_window - now())))::integer);
  end if;
  return 0;
end;
$$;

revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- ---------- sessions ----------

-- Stored in the session cookie; bumping it signs the user out everywhere.
alter table public.users add column session_version integer not null default 0;

-- ---------- saved shipping address ----------

-- { firstName, lastName, address, city, province, zip, phone, country }
alter table public.users add column shipping_address jsonb;
