create extension if not exists pg_cron;

-- 09:05 UTC is 04:05 or 05:05 Toronto time, always before the 06:08 brief, so an expired item can be reopened by that morning's run.
select cron.schedule(
  'approval-queue-expire',
  '5 9 * * *',
  $$update public.approval_queue
    set status = 'expired', decided_at = now()
    where status in ('pending', 'deferred')
      and expires_at is not null
      and expires_at < now()$$
);
