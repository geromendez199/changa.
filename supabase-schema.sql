-- ============================================================
-- WHY: Add baseline schema and performance indexes for Supabase-backed reads.
-- CHANGED: YYYY-MM-DD
-- ============================================================
-- Changa MVP schema + RLS
create extension if not exists "pgcrypto";

create type job_category as enum (
  'Hogar',
  'Oficios',
  'Delivery',
  'Eventos',
  'Tecnología',
  'Construcción y Mantenimiento',
  'Mecánica y Transporte',
  'Servicios Personales y Estética',
  'Alimentación y Tradición',
  'Oficios Modernos y Digitales',
  'Control de Plagas',
  'Personal Trainer',
  'Otros'
);
create type job_urgency as enum ('normal','urgente');
create type job_status as enum ('publicado','postulado','en_progreso','programado','pendiente','completado','cancelado');
create type listing_type as enum ('request','service');
create type application_status as enum ('enviada','aceptada','rechazada');
create type payment_type as enum ('Visa','Mastercard','Mercado Pago');
create type transaction_status as enum ('pagado','pendiente','reintegrado');
create type notification_type as enum ('mensaje','trabajo','pago');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_letter text not null check (char_length(avatar_letter) <= 2),
  avatar_url text,
  location text not null,
  member_since text not null,
  verified boolean not null default false,
  rating numeric(2,1) not null default 0,
  total_reviews int not null default 0,
  completed_jobs int not null default 0,
  success_rate int not null default 0 check (success_rate between 0 and 100),
  bio text,
  trust_indicators text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table profiles
add column if not exists avatar_url text;

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  posted_by_user_id uuid not null references profiles(id) on delete cascade,
  listing_type listing_type not null default 'request',
  title text not null,
  description text not null,
  category job_category not null,
  price_value int not null check (price_value > 0),
  rating numeric(2,1) not null default 5.0,
  distance_km numeric(6,2) not null default 0,
  location text not null,
  availability text not null,
  urgency job_urgency not null default 'normal',
  image text not null,
  posted_at timestamptz not null default now(),
  status job_status not null default 'publicado',
  created_at timestamptz not null default now()
);

-- search_document is generated and stored so job search stays fast and indexable
-- without forcing the browser client to maintain a denormalized search field manually.
alter table jobs
add column if not exists search_document tsvector
generated always as (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(location, '')), 'C')
) stored;

alter table jobs
add column if not exists listing_type listing_type not null default 'request';

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  applicant_user_id uuid not null references profiles(id) on delete cascade,
  cover_message text not null,
  proposed_amount int not null check (proposed_amount > 0),
  status application_status not null default 'enviada',
  created_at timestamptz not null default now(),
  unique (job_id, applicant_user_id)
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1_id uuid not null references profiles(id) on delete cascade,
  participant_2_id uuid not null references profiles(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (participant_1_id <> participant_2_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_user_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_user_id uuid not null references profiles(id) on delete cascade,
  reviewed_user_id uuid not null references profiles(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create or replace function sync_profile_review_stats(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  review_count int;
  average_rating numeric(2,1);
begin
  select
    count(*)::int,
    coalesce(round(avg(rating)::numeric, 1), 0)
  into review_count, average_rating
  from reviews
  where reviewed_user_id = target_user_id;

  update profiles
  set
    rating = case when review_count > 0 then average_rating else 0 end,
    total_reviews = review_count
  where id = target_user_id;
end;
$$;

create or replace function handle_review_stats_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform sync_profile_review_stats(old.reviewed_user_id);
    return old;
  end if;

  perform sync_profile_review_stats(new.reviewed_user_id);

  if tg_op = 'UPDATE' and old.reviewed_user_id is distinct from new.reviewed_user_id then
    perform sync_profile_review_stats(old.reviewed_user_id);
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_sync_profile_stats on reviews;
create trigger reviews_sync_profile_stats
after insert or update or delete on reviews
for each row
execute function handle_review_stats_sync();

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  type notification_type not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type payment_type not null,
  last4 text not null check (char_length(last4)=4),
  expiry text not null,
  holder_name text not null,
  is_default boolean not null default false,
  color_class text not null default 'from-indigo-500 to-indigo-600',
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  amount int not null check (amount > 0),
  status transaction_status not null default 'pagado',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table payment_methods enable row level security;
alter table transactions enable row level security;

-- profiles: public read, owner update
create policy "profiles public read" on profiles for select using (true);
create policy "profiles own update" on profiles for update using (auth.uid() = id);
create policy "profiles own insert" on profiles for insert with check (auth.uid() = id);

-- jobs: public read, owner CUD
create policy "jobs public read" on jobs for select using (true);
create policy "jobs own insert" on jobs for insert with check (auth.uid() = posted_by_user_id);
create policy "jobs own update" on jobs for update using (auth.uid() = posted_by_user_id);
create policy "jobs own delete" on jobs for delete using (auth.uid() = posted_by_user_id);

-- applications: applicant create/read, job owner read
create policy "applications applicant create" on applications for insert with check (auth.uid() = applicant_user_id);
create policy "applications applicant read" on applications for select using (auth.uid() = applicant_user_id);
create policy "applications owner read" on applications for select using (
  exists (select 1 from jobs j where j.id = applications.job_id and j.posted_by_user_id = auth.uid())
);
create policy "applications owner update" on applications for update using (
  exists (select 1 from jobs j where j.id = applications.job_id and j.posted_by_user_id = auth.uid())
) with check (
  exists (select 1 from jobs j where j.id = applications.job_id and j.posted_by_user_id = auth.uid())
);
create policy "applications applicant delete" on applications for delete using (auth.uid() = applicant_user_id);

-- conversations/messages: only participants
create policy "conversations participants read" on conversations for select using (auth.uid() in (participant_1_id, participant_2_id));
create policy "conversations participants create" on conversations for insert with check (auth.uid() in (participant_1_id, participant_2_id));

create policy "messages participants read" on messages for select using (
  exists (
    select 1 from conversations c
    where c.id = messages.conversation_id
      and auth.uid() in (c.participant_1_id, c.participant_2_id)
  )
);
create policy "messages participants create" on messages for insert with check (
  auth.uid() = sender_user_id
  and exists (
    select 1 from conversations c
    where c.id = messages.conversation_id
      and auth.uid() in (c.participant_1_id, c.participant_2_id)
  )
);

-- reviews: public read, authenticated create
create policy "reviews public read" on reviews for select using (true);
create policy "reviews auth create" on reviews for insert with check (auth.uid() = reviewer_user_id);

-- notifications: owner only
create policy "notifications owner read" on notifications for select using (auth.uid() = user_id);
create policy "notifications owner update" on notifications for update using (auth.uid() = user_id);

-- payment_methods: owner only
create policy "payment methods owner read" on payment_methods for select using (auth.uid() = user_id);
create policy "payment methods owner write" on payment_methods for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- transactions: owner read
create policy "transactions owner read" on transactions for select using (auth.uid() = user_id);

-- storage: profile avatars
insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do update set public = true;

create policy "profile avatars public read"
on storage.objects
for select
using (bucket_id = 'profile-avatars');

create policy "profile avatars owner insert"
on storage.objects
for insert
with check (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "profile avatars owner update"
on storage.objects
for update
using (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "profile avatars owner delete"
on storage.objects
for delete
using (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- PERFORMANCE INDEXES (added Phase 3 refactor)
-- ============================================================
create index if not exists idx_jobs_status_posted_at on jobs (status, posted_at desc);
create index if not exists idx_jobs_status_distance_posted_at on jobs (status, distance_km asc, posted_at desc);
create index if not exists idx_jobs_posted_by_user_id_posted_at on jobs (posted_by_user_id, posted_at desc);
create index if not exists idx_jobs_category_status_posted_at on jobs (category, status, posted_at desc);
create index if not exists idx_jobs_urgency_status_posted_at on jobs (urgency, status, posted_at desc);

create index if not exists idx_applications_applicant_created_at on applications (applicant_user_id, created_at desc);
create index if not exists idx_applications_job_id on applications (job_id);

create index if not exists idx_conversations_participant_1_last_message_at on conversations (participant_1_id, last_message_at desc);
create index if not exists idx_conversations_participant_2_last_message_at on conversations (participant_2_id, last_message_at desc);
create index if not exists idx_conversations_job_id on conversations (job_id);
create unique index if not exists idx_conversations_unique_job_participants
on conversations (job_id, least(participant_1_id, participant_2_id), greatest(participant_1_id, participant_2_id));

create index if not exists idx_messages_conversation_created_at on messages (conversation_id, created_at asc);
create index if not exists idx_messages_sender_user_id on messages (sender_user_id);
create index if not exists idx_jobs_search_document
on jobs
using gin (search_document);

create index if not exists idx_reviews_reviewed_user_created_at on reviews (reviewed_user_id, created_at desc);
create index if not exists idx_notifications_user_created_at on notifications (user_id, created_at desc);
create index if not exists idx_payment_methods_user_created_at on payment_methods (user_id, created_at desc);
create index if not exists idx_transactions_user_created_at on transactions (user_id, created_at desc);

create or replace function send_message(
  p_conversation_id uuid,
  p_sender_user_id uuid,
  p_content text
) returns messages
language plpgsql security definer
as $$
declare
  v_message messages;
begin
  insert into messages (conversation_id, sender_user_id, content)
  values (p_conversation_id, p_sender_user_id, p_content)
  returning * into v_message;
  
  update conversations
  set last_message_at = v_message.created_at
  where id = p_conversation_id;
  
  return v_message;
end;
$$;
