-- ============================================================
-- WHY: Support both service requests and service offers in the marketplace.
-- CHANGED: YYYY-MM-DD
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'listing_type') then
    create type listing_type as enum ('request', 'service');
  end if;
end
$$;

alter table jobs
add column if not exists listing_type listing_type not null default 'request';
