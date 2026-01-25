# Plasma Figurine Generator Audit

Date: 2026-01-25

## Scope
- Linting, tests, CI, and production readiness checks.

## Commands Run
- `npm run lint` (failed: `eslint` not found; dependencies not installed)
- `npm install` (timed out)
- `npm install --package-lock-only --ignore-scripts` (failed: npm cache permissions)
- `npm_config_cache=/tmp/npm-cache npm install --package-lock-only --ignore-scripts` (failed: no network access)

## Findings

### High
1. Payment verification is incomplete for production.
   - File: `src/lib/payment-middleware.ts`
   - The middleware accepts any `payment-signature` header and marks invoices as confirmed without on-chain verification.
   - Current guard: production requests are blocked unless `ALLOW_INSECURE_PAYMENT=true`.
   - Remaining work: implement real verification and replace the in-memory invoice store with persistent storage.

2. Payment invoices and gallery data are stored in-memory when external storage is not configured.
   - Files: `src/lib/payment-middleware.ts`, `src/lib/storage.ts`
   - This loses data across server restarts and in serverless deployments.
   - Recommendation: require persistent storage in production (Upstash/Vercel Blob/DB) and fail fast if not configured.

### Medium
1. Gallery API allows unauthenticated writes.
   - File: `src/app/api/gallery/route.ts`
   - Any caller can POST items; this risks abuse or spam.
   - Recommendation: require auth or add rate limiting.

2. Rate limiting is in-memory only.
   - File: `src/lib/rate-limit.ts`
   - Per-instance in-memory limits do not protect across serverless instances.
   - Recommendation: move to shared storage (Redis/Upstash) or edge rate limiting.

### Low
1. CI and tests exist but could not be executed locally.
   - CI workflow: `.github/workflows/ci.yml`
   - Unit tests: `src/lib/__tests__/*`
   - Blocked by npm install errors (cache ownership + no network).

## Changes Applied
- No code changes required beyond this audit report.

## Production Readiness Checklist
- [ ] Install dependencies (`npm install`) so lint/tests/build can run.
- [ ] Implement real payment verification (on-chain or relayer).
- [ ] Use persistent storage for invoices and gallery data.
- [ ] Protect gallery endpoints with auth or rate limits.
- [ ] Run CI after updating `package-lock.json`.
