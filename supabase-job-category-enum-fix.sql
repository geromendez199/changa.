-- ============================================================
-- WHY: Align legacy Supabase enum labels with the category names used by the app.
-- CHANGED: YYYY-MM-DD
-- ============================================================

do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'job_category'
      and e.enumlabel = 'Construccion y Mantenimiento'
  ) then
    alter type job_category rename value 'Construccion y Mantenimiento' to 'Construcción y Mantenimiento';
  elsif not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'job_category'
      and e.enumlabel = 'Construcción y Mantenimiento'
  ) then
    alter type job_category add value 'Construcción y Mantenimiento' after 'Tecnología';
  end if;

  if exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'job_category'
      and e.enumlabel = 'Tecnologia'
  ) then
    alter type job_category rename value 'Tecnologia' to 'Tecnología';
  end if;

  if exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'job_category'
      and e.enumlabel = 'Mecanica y Transporte'
  ) then
    alter type job_category rename value 'Mecanica y Transporte' to 'Mecánica y Transporte';
  end if;
end
$$;
