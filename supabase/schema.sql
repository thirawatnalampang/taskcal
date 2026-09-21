-- TaskCal database schema for Supabase
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  task_date date not null,
  start_time time,
  end_time time,
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

create policy "Profiles are readable by signed-in users" on public.profiles for select to authenticated using (true);
create policy "Users can update their own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Tasks are readable by signed-in users" on public.tasks for select to authenticated using (true);
create policy "Signed-in users can create tasks" on public.tasks for insert to authenticated with check (auth.uid() = created_by);
create policy "Task creators can update tasks" on public.tasks for update to authenticated using (auth.uid() = created_by);
create policy "Task creators can delete tasks" on public.tasks for delete to authenticated using (auth.uid() = created_by);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
