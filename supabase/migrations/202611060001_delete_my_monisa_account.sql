-- Allow an authenticated student to permanently delete their own Monisa account.
-- Deleting auth.users cascades to profiles, conversations and messages via their foreign keys.
create or replace function public.delete_my_monisa_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  delete from auth.users
  where id = auth.uid();

  if not found then
    raise exception 'Account not found';
  end if;
end;
$$;

revoke all on function public.delete_my_monisa_account() from public;
grant execute on function public.delete_my_monisa_account() to authenticated;
