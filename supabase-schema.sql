-- RoutineReady Database Schema
-- Paste this into the Supabase SQL Editor and click "Run"

-- 1. Profiles (auto-created on signup)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  display_name text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- 2. Schools
create table schools (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  school_name text not null default '',
  class_name text not null default '',
  teacher_name text not null default '',
  device_name text default 'Display 1',
  created_at timestamptz default now()
);

alter table schools enable row level security;

create policy "Users can CRUD own schools"
  on schools for all using (auth.uid() = owner_id);


-- 3. Display Settings
create table display_settings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools on delete cascade,
  width int default 2560,
  height int default 1080,
  scale int default 100,
  mode text default 'horizontal',
  rows int default 1,
  path_direction text default 'sequential',
  transition_type text default 'progress-line',
  mascot_image text,
  top_banner_image text,
  bottom_banner_image text,
  show_clock boolean default false,
  auto_pan_tile_height int default 60,
  current_theme text default 'ocean-calm',
  created_at timestamptz default now()
);

alter table display_settings enable row level security;

create policy "Users can CRUD own display settings"
  on display_settings for all
  using (school_id in (select id from schools where owner_id = auth.uid()));


-- 4. Templates
create table templates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools on delete cascade,
  name text not null default 'Untitled',
  start_time text not null default '08:00',
  end_time text not null default '10:30',
  created_at timestamptz default now()
);

alter table templates enable row level security;

create policy "Users can CRUD own templates"
  on templates for all
  using (school_id in (select id from schools where owner_id = auth.uid()));


-- 5. Tasks (within templates)
create table tasks (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates on delete cascade,
  sort_order int not null default 0,
  type text not null default 'text',
  content text default 'New Task',
  duration int default 30,
  image_url text,
  icon text,
  width int default 200,
  height int default 160,
  created_at timestamptz default now()
);

alter table tasks enable row level security;

create policy "Users can CRUD own tasks"
  on tasks for all
  using (template_id in (
    select t.id from templates t
    join schools s on t.school_id = s.id
    where s.owner_id = auth.uid()
  ));


-- 6. Active Timeline (currently loaded template config)
create table active_timeline (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools on delete cascade,
  template_id uuid references templates on delete set null,
  start_time text default '08:00',
  end_time text default '10:30',
  tasks_json jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table active_timeline enable row level security;

create policy "Users can CRUD own active timeline"
  on active_timeline for all
  using (school_id in (select id from schools where owner_id = auth.uid()));


-- 7. Weekly Schedules
create table weekly_schedules (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools on delete cascade,
  monday uuid references templates on delete set null,
  tuesday uuid references templates on delete set null,
  wednesday uuid references templates on delete set null,
  thursday uuid references templates on delete set null,
  friday uuid references templates on delete set null,
  created_at timestamptz default now()
);

alter table weekly_schedules enable row level security;

create policy "Users can CRUD own weekly schedules"
  on weekly_schedules for all
  using (school_id in (select id from schools where owner_id = auth.uid()));


-- 8. Custom Themes
create table custom_themes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools on delete cascade,
  name text not null default 'Custom Theme',
  card_bg text default '#ffffff',
  card_border text default '#e5e7eb',
  card_text text default '#1f2937',
  card_time text default '#6b7280',
  card_radius text default '12px',
  card_shadow text default '0 2px 8px rgba(0,0,0,0.1)',
  card_border_width text default '2px',
  progress_bg text default '#e5e7eb',
  progress_fill text default '#3b82f6',
  progress_height text default '8px',
  page_bg text default '#f0f9ff',
  page_gradient text,
  font_family text default 'system-ui',
  dot_completed text default '#22c55e',
  dot_current text default '#3b82f6',
  dot_upcoming text default '#d1d5db',
  emoji text default '',
  created_at timestamptz default now()
);

alter table custom_themes enable row level security;

create policy "Users can CRUD own custom themes"
  on custom_themes for all
  using (school_id in (select id from schools where owner_id = auth.uid()));
