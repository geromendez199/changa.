-- Idempotent production repair for older Supabase databases.
-- The frontend no longer depends on this generated column, but keeping it aligned
-- preserves the indexed search path for future backend queries.

alter table public.jobs
add column if not exists search_document tsvector
generated always as (
  to_tsvector(
    'simple',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(category, '') || ' ' ||
    coalesce(location, '')
  )
) stored;

create index if not exists idx_jobs_search_document
on public.jobs
using gin (search_document);
