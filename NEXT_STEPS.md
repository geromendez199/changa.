<!--
WHY: Track completed backend improvements and remaining frontend/infrastructure work
CHANGED: 2026-04-30
-->
# Next Steps

## ✅ Completed (2026-04-30)

### 1. ✅ Move auth-sensitive and payment-sensitive writes behind Supabase Edge Functions
- **Status**: DONE
- **What was built**:
  - `payment-initiate`: Secure Stripe payment processing
  - `validate-review`: Defensive review creation with job completion checks
  - `send-notifications`: In-app + email notifications
  - `log-event`: Structured logging with correlation IDs
- **Location**: `supabase/functions/` and `src/lib/edge-functions.ts`

### 2. ✅ Tighten RLS policies for reviews and conversations
- **Status**: DONE
- **What was built**:
  - Review policies: job completion + participation validation
  - Conversation policies: job-based connection checks
  - Message policies: conversation participant checks only
  - Payment policies: no direct inserts (Edge Function only)
  - Performance indexes on all RLS-filtered columns
- **Location**: `supabase/migrations/20260430000000_rls_hardening.sql`

### 3. ✅ Add structured logging and correlation IDs
- **Status**: DONE
- **What was built**:
  - `activity_logs` table with correlation_id tracking
  - 90-day auto-cleanup for non-error logs
  - RLS policies for log access
  - Stdout integration for Sentry/Datadog
- **Location**: `supabase/migrations/20260430000001_activity_logs.sql`

### 6. ✅ Introduce server-side search and ranking
- **Status**: DONE
- **What was built**:
  - `search_jobs()` RPC with full-text + relevance scoring
  - `search_profiles()` RPC for freelancer discovery
  - `get_job_recommendations()` for personalized matches
  - Full-text indexes on job titles/descriptions
- **Location**: `supabase/migrations/20260430000002_search_and_ranking.sql`

### Query Optimization & Caching
- **Status**: DONE
- **What was built**:
  - Materialized views: `mv_job_listings`, `mv_user_profiles`
  - PostgreSQL cache layer with TTL support
  - Query statistics table for monitoring
  - Composite indexes for filter/sort patterns
- **Location**: `supabase/migrations/20260430000003_query_optimization.sql`

---

## 🔄 Deferred (still valid)

### 4. Finish test infrastructure with Vitest + MSW
- Why deferred: node/npm availability in this environment
- Next move: add `vitest.config.ts`, `src/test/setup.ts`, MSW handlers, and integration tests for auth, jobs search, and chat flows
- Estimated effort: 2-3 days

### 5. Verify the hook split with real typecheck and regression tests
- Why deferred: local verification was blocked
- Next move: run `npm run typecheck`, fix return type mismatches, add regression tests for `useAppState()` consumers
- Estimated effort: 1 day

### 7. Persist avatars outside localStorage
- Why deferred: current lightweight local approach works fine
- Next move: migrate avatar metadata to Supabase Storage + `profiles` table without breaking UI
- Estimated effort: 1-2 days

---

## 📋 New Deferred Work

### 8. Integrate Edge Functions into frontend workflows
- Deploy Edge Functions to Supabase production
- Wire `initiatePayment()` into checkout flow
- Wire `validateAndCreateReview()` into review submission
- Wire `sendNotification()` into relevant events
- Estimated effort: 2 days

### 9. Monitoring and alerting for Edge Functions
- Set up error tracking (already have Sentry)
- Create alerts for payment failures
- Monitor RLS policy violations
- Estimated effort: 1 day

### 10. Capacity testing for RPC search
- Load test `search_jobs()` with 100k+ jobs
- Optimize materialized view refresh strategy if needed
- Consider read replicas for search if latency spikes
- Estimated effort: 1 day
