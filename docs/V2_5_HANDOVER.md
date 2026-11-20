# Farm World V2.5 — Realtime handover

Status: **CODE CANDIDATE — CI AND HOSTED E2E GATES PENDING**.

## Scope
- Supabase Postgres Changes listens to `farm_state` UPDATE for the signed-in farm ID.
- The change event is an **invalidation signal only**; client reloads authoritative snapshot rather than trusting event payload.
- Subscription callback reloads on `SUBSCRIBED` (including reconnect), and page visibility restores freshness.
- Existing 30-second polling remains a fallback.
- Both realtime and polling now use monotonic revision reconciliation, so older network responses cannot overwrite newer state.
- Cleanup removes the visibility listener and channel on account/farm change and unmount.
- No database migration or production configuration was applied.

## Acceptance gates
1. `npm run typecheck && npm run lint && npm test && npm run build` all PASS on latest commit.
2. On Supabase staging, verify `farm_state` is included in `supabase_realtime` publication and authorized changes reach only the signed-in account.
3. Two browser sessions on one account: command in A updates B, no duplicate application.
4. Two different accounts: no cross-account event or data leakage; test RLS on `farm_state`.
5. Disconnect/reconnect, browser background/foreground, lost websocket and network latency: data eventually catches up through subscription or 30-second polling.
6. Rapid out-of-order responses cannot regress `revision`; switching accounts must not retain another account's snapshot.
7. Confirm subscription lifecycle does not leak channels during navigation or repeated sign-ins.

Do not merge to `main`, enable the V2 flag or deploy until all hosted staging gates are verified.
