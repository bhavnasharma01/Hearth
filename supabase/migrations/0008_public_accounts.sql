-- 0008: public accounts, Phase A (member sign-in with Google).
--
-- Until now only stewards could sign in, so the v1 policies granted the
-- `authenticated` role full CRUD (`*_admin_all`) — "signed in" meant "admin".
-- With public sign-ups opening, that assumption ends here. Dropping these
-- policies is safe: the admin panel reads and writes exclusively through the
-- service-role client (which bypasses RLS) and gates by ADMIN_EMAILS, never
-- by RLS (see Security.md §2).
--
-- After this migration a signed-in member has exactly the same data access as
-- an anonymous visitor (public read of live content), plus read/update of
-- their own `users` profile row.
--
-- >>> RUN THIS BEFORE enabling "Allow new users to sign up" in Supabase Auth.
-- Safe to re-run.

-- 1) De-privilege `authenticated` --------------------------------------------
drop policy if exists categories_admin_all           on categories;
drop policy if exists practitioners_admin_all        on practitioners;
drop policy if exists pract_cat_admin_all            on practitioner_categories;
drop policy if exists events_admin_all               on events;
drop policy if exists reports_admin_all              on reports;
drop policy if exists registrations_admin_all        on registrations;
drop policy if exists users_admin_all                on users;
drop policy if exists feedback_admin_all             on feedback;
drop policy if exists practitioner_services_admin_all on practitioner_services;

-- 2) Tie public.users to auth.users (the dormant v2 upgrade path, now live) --
-- The table is empty, so these are safe: a profile row's id IS the auth uid.
alter table users alter column id drop default;
do $$ begin
  alter table users
    add constraint users_id_auth_fkey
    foreign key (id) references auth.users(id) on delete cascade;
exception when duplicate_object then null; end $$;

-- 3) Members may read and update their own profile row -----------------------
drop policy if exists users_self_read on users;
create policy users_self_read on users
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists users_self_update on users;
create policy users_self_update on users
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 4) Auto-create the profile row on first sign-in ----------------------------
-- Google supplies name + avatar in raw_user_meta_data. The exception guard
-- means a profile hiccup (e.g. a duplicate email) can never block the sign-up
-- itself — the row can be backfilled later.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  begin
    insert into public.users (id, email, display_name, avatar_url)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
      new.raw_user_meta_data->>'avatar_url'
    )
    on conflict (id) do nothing;
  exception when others then null;
  end;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
