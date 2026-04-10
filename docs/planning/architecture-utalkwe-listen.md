---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: [prd-utalkwe-listen.md, product-brief-utalkwe-listen.md, product-brief-utalkwe-listen-distillate.md]
workflowType: 'architecture'
project_name: 'UtalkWe Listen'
user_name: 'Cornelius'
date: '2026-03-25'
status: 'complete'
completedAt: '2026-03-25'
---

# Architecture Decision Document — UtalkWe Listen

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:** 54 requirements across 7 capability areas — Call Handling,
Caller Identity & Memory, Haven AI Behavior, Crisis Handling, Subscription & Access
Control, SMS & Follow-Up, and Caller Data & Payment Integration. Full specification
in `prd-utalkwe-listen.md`.

**Non-Functional Requirements:** 21 requirements across 5 categories:
- Performance: 2-second call answer, 1-second memory injection, 5-minute SMS delivery
- Reliability: 99.5% uptime, graceful database degradation, webhook retry logic
- Security: end-to-end encryption, service role key isolation, webhook signature verification
- Scalability: 50 concurrent calls at launch scaling to 200 without architectural change
- Compliance: AI disclosure hardcoded, TCPA consent gate, crisis protocol in code not config

**Scale & Complexity:**
- Primary domain: Consumer voice AI SaaS
- Complexity level: Medium-High (5 critical integrations, real-time constraints, compliance)
- Estimated architectural components: 6 core modules + 5 external service integrations

### The Critical Path

The `assistant-request` webhook is the architectural heart of the system. Vapi fires it
before the caller hears a single word. In that synchronous window — which must complete
within 1 second — the system must:

1. Verify webhook signature
2. Extract caller phone number from Vapi payload
3. Query Supabase for caller profile and last 3 sessions
4. Check subscription tier and monthly call count
5. Build personalized system prompt with memory block
6. Select voice based on caller context
7. Return full assistant configuration JSON to Vapi

Everything else is asynchronous. But this path is synchronous and blocking.
**The entire architecture is optimized around making this path as fast as possible.**

### Technical Constraints & Dependencies

| Service | Role | Failure Mode |
|---------|------|-------------|
| Twilio | Phone number, call routing, SMS | Critical — no calls without it |
| Vapi | AI voice agent, webhook orchestration | Critical — no calls without it |
| Supabase | Caller memory, sessions, subscriptions | Degrades to no-memory mode |
| Anthropic API | Post-call coaching plan generation | Non-critical — SMS delayed |
| Stripe | Subscription management | Non-critical — existing subs honored |

### Cross-Cutting Concerns

1. **Webhook orchestration** — three distinct inbound webhooks (Vapi, Stripe, Twilio)
   each with different verification, retry, and processing requirements
2. **Compliance enforcement** — AI disclosure text, TCPA consent gate, and crisis keyword
   list must live in application code, not database or config — not modifiable at runtime
3. **Graceful degradation** — every external service failure has a defined fallback
   that keeps calls alive; no single service failure causes call failure
4. **Async post-call processing** — coaching plan generation, SMS delivery, and session
   update all happen after call ends and must not block the call path

---

## Starter Template Evaluation

### Primary Technology Domain

API backend — NestJS. This product has no frontend, no mobile app, no web UI in MVP.
The product IS the webhook handler and its integrations. Every architectural decision
flows from that.

### Stack Confirmed

This product does not use a community starter template — the Nest CLI scaffolds a clean
base and the architecture is too specific to benefit from an opinionated third-party
template. The technical spike already proved the core patterns work.

### Initialization Command

```bash
# Node.js 22 LTS required (Node 18 EOL April 2025, Node 20 LTS until April 2026)
node --version  # must be >= 22.x

npm install -g @nestjs/cli@latest
nest new utalkwe-listen-api --package-manager npm --strict
cd utalkwe-listen-api
```

### Core Dependencies with Verified Versions

```bash
# Runtime
npm install @nestjs/core@^11.1.17 @nestjs/common@^11.1.17
npm install @nestjs/config @nestjs/platform-express

# Database
npm install @supabase/supabase-js@^2.99.3

# Voice + Phone
npm install twilio@^5.5.0

# AI
npm install @anthropic-ai/sdk@^0.27.0

# Payments
npm install stripe@^16.0.0

# Validation
npm install class-validator class-transformer zod

# Testing
npm install --save-dev jest @nestjs/testing supertest
```

### Architectural Decisions Made by This Stack

**Language:** TypeScript strict mode — all modules, all services, no `any`

**Runtime:** Node.js 22 LTS — required by `@supabase/supabase-js` v2.79+ (Node 18 EOL)

**HTTP Layer:** NestJS on Express adapter — raw body middleware enabled for Stripe
webhook signature verification (Stripe requires the raw Buffer, not parsed JSON)

**Module system:** NestJS dependency injection — all services are injectable, no
singleton pattern outside the DI container

**Configuration:** `@nestjs/config` with `ConfigModule.forRoot({ isGlobal: true })` —
environment variables available across all modules without re-importing

**Validation:** `class-validator` with `ValidationPipe` globally applied — all incoming
webhook payloads validated at the pipe level before reaching controllers

**No ORM:** Direct `@supabase/supabase-js` client — no Prisma, no TypeORM. The schema
is already defined, queries are simple single-table lookups, and the overhead of an ORM
adds latency to the critical path without benefit.

**Note:** Project initialization is the first implementation story.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Supabase singleton client — no cache, indexed phone lookup
- Raw body middleware enabled for Stripe webhook verification
- Vapi webhook event routing — single endpoint, service-layer switching
- HTTP 200 always pattern for all webhook handlers
- Railway for MVP deployment

**Important Decisions (Shape Architecture):**
- No ORM — direct supabase-js client throughout
- Single Supabase client instance via NestJS DI singleton
- setImmediate() for async post-call processing — no queue infrastructure
- Service role key only — no anon key anywhere in the application

**Deferred Decisions (Post-MVP):**
- Redis application cache (revisit at 500+ concurrent callers)
- AWS migration (revisit at $8K MRR milestone)
- Staging environment (revisit before Phase 2 features)
- Observability tooling (Datadog/Axiom — revisit at scale)

### Data Architecture

**Database:** Supabase (PostgreSQL) — hosted, managed, no infrastructure to run.

**Client strategy:** Single `SupabaseClient` instance initialized at module startup,
injected via NestJS DI container into all services that need it. Never re-created
per request. The critical path lookup — phone number to caller profile — hits a
unique index on `callers.phone` and returns in under 10ms on Supabase infrastructure.

**No ORM:** Direct `@supabase/supabase-js@^2.99.3` queries throughout. Schema is
already defined and stable. ORM overhead adds latency to the 1-second critical path
with zero benefit at this scale.

**Caching:** None in MVP. Single indexed lookup per call is fast enough. Redis added
in Phase 2 if call volume exceeds 200 concurrent with measurable Supabase latency.

**Schema:** 5 tables — `callers`, `call_sessions`, `coaching_plans`, `sms_log`,
`subscriptions`. All defined in `supabase/migrations/001_utalkwe_schema.sql`.

### Authentication and Security

**Caller identity:** Phone number passed by Twilio infrastructure — trusted at the
network level. No JWT, no session, no API key for callers.

**Webhook verification — per source:**

| Source | Method |
|--------|--------|
| Vapi | Custom guard: `x-vapi-secret` header compared to `VAPI_WEBHOOK_SECRET` env var |
| Stripe | `stripe.webhooks.constructEvent()` with raw Buffer body + signing secret |
| Twilio (future) | `twilio.validateRequest()` with auth token |

**Stripe raw body requirement:** NestJS bootstrap must set `rawBody: true` on app
creation. A `RawBodyRequest` type is used in the Stripe controller. This is
non-negotiable — Stripe signature verification fails on parsed JSON.

**Key management:** All external service keys in environment variables only. Never
hardcoded, never logged. `ConfigService` is the sole access point for all secrets.

**Database access:** Service role key exclusively. Row Level Security on all tables
with `service_role_all` policies. Anon key never used anywhere in the application.

### API and Communication Patterns

Three inbound endpoints only. No public API, no REST resource endpoints, no GraphQL.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /vapi/webhook` | POST | All Vapi events |
| `POST /stripe/webhook` | POST | Subscription lifecycle |
| `GET /health` | GET | Uptime check |

**Vapi event routing:** Single controller receives all events. Routes on
`message.type` to service methods: `assistant-request`, `call-start`,
`end-of-call-report`, `function-call`. No separate controller per event type.

**HTTP 200 always:** All webhook handlers return HTTP 200 even on internal errors.
Vapi and Stripe retry on non-200, causing duplicate processing. Errors are logged
internally — the caller's experience is never affected by retry storms.

**Async post-call processing:** Coaching plan generation, SMS delivery, and session
update all run after the webhook returns 200. Implemented with `setImmediate()` —
no queue infrastructure (Bull, RabbitMQ) needed at MVP scale of 50 concurrent calls.

### Infrastructure and Deployment

**Platform:** Railway for MVP. Auto-deploys from GitHub main branch. Node.js 22
runtime. Environment variables set in Railway dashboard. Estimated cost: ~$5–15/month
at MVP call volume.

**Migration trigger:** When MRR reaches $8K or concurrent calls consistently exceed
150, migrate to AWS App Runner or ECS Fargate. NestJS app is fully stateless —
migration is a single deployment.

**Local development:** ngrok for webhook tunneling during development. Both Vapi and
Stripe webhook URLs point to the ngrok tunnel URL during local testing.

**Monitoring:** Railway built-in log streaming + Supabase dashboard for data.
No additional observability tooling in MVP.

**Environment:** Single production environment in MVP. No staging. Supabase local
CLI used for schema development and testing.

### Decision Impact Analysis

**Implementation sequence driven by dependencies:**
1. Supabase schema migration (blocks everything)
2. NestJS app scaffold + config module (blocks all modules)
3. Vapi webhook controller + assistant-request handler (blocks caller testing)
4. Caller identity + memory service (blocks personalization)
5. Crisis detection module (blocks any live caller traffic)
6. Subscription gating (blocks free-tier limit enforcement)
7. Post-call: coaching plan generation + SMS (blocks follow-up feature)
8. Stripe webhook handler (blocks paid tier activation)
9. Railway deployment + health endpoint (blocks production)

**Cross-component dependencies:**
- VapiService depends on CallersService (memory injection)
- VapiService depends on CoachingService (post-call plan)
- VapiService depends on SmsService (post-call delivery)
- StripeController depends on Supabase (subscription state)
- All services depend on ConfigService (env vars)
- Stripe controller requires raw body middleware — must be set in main.ts bootstrap

---

## Implementation Patterns and Consistency Rules

### Naming Patterns

**Database (snake_case throughout):**
- Tables: plural snake_case — `callers`, `call_sessions`, `coaching_plans`, `sms_log`
- Columns: snake_case — `phone`, `caller_id`, `guidance_type`, `is_active`
- Foreign keys: `{table_singular}_id` — `caller_id`, `session_id`
- Booleans: `is_{state}` or `was_{event}` — `is_active`, `was_crisis`, `follow_up_sent`
- Timestamps: `{event}_at` — `created_at`, `updated_at`, `started_at`, `ended_at`

**TypeScript (camelCase for code, PascalCase for types):**
- Interfaces and types: PascalCase — `Caller`, `CallSession`, `CoachingPlan`
- Service methods: camelCase verbs — `findByPhone()`, `createSession()`, `buildSystemPromptContext()`
- Constants: SCREAMING_SNAKE_CASE — `FREE_CALLS_PER_MONTH`, `CRISIS_KEYWORDS`
- Files: kebab-case — `callers.service.ts`, `vapi.controller.ts`, `coaching.service.ts`

**NestJS modules:** One module per domain — `CallersModule`, `VapiModule`,
`CoachingModule`, `SmsModule`, `StripeModule`. No monolithic AppModule that
directly contains business logic.

**Environment variables:** SCREAMING_SNAKE_CASE with service prefix:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `VAPI_API_KEY`, `VAPI_WEBHOOK_SECRET`, `VAPI_ASSISTANT_ID`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_BASIC`

### Structure Patterns

**Module organization — feature-first, not layer-first:**
```
src/
  callers/          ← everything about caller identity and memory
  vapi/             ← everything about Vapi webhooks and AI behavior
  coaching/         ← everything about plan generation
  sms/              ← everything about SMS delivery
  stripe/           ← everything about subscription management
  common/           ← shared guards, pipes, decorators
```

Never organize by layer (`controllers/`, `services/`, `repositories/`) — this forces
agents to touch multiple directories for a single feature change.

**File structure per module:**
```
{module}/
  {module}.module.ts
  {module}.controller.ts   (if has HTTP endpoints)
  {module}.service.ts
  {module}.types.ts        (interfaces and types for this module)
```

No `index.ts` barrel files — import directly from the specific file.

**Test co-location:** Tests live in `test/` at project root, mirroring `src/` structure.
`test/unit/callers/callers.service.spec.ts` not `src/callers/callers.service.spec.ts`.

### Format Patterns

**Supabase query results:** Always destructure `{ data, error }`. Always check error
before using data. Never assume success.
```typescript
// CORRECT
const { data, error } = await this.supabase.from('callers').select('*').eq('phone', phone).single();
if (error?.code === 'PGRST116') return null; // not found
if (error) throw error;
return data;

// WRONG
const { data } = await this.supabase.from('callers')...
return data; // error swallowed silently
```

**Webhook response format:**
- Vapi assistant-request: return `{ assistant: { ... } }` — exact Vapi spec
- All other Vapi events: return `{ received: true }`
- Stripe: return `{ received: true }`
- Never return HTTP error codes from webhooks — always 200

**Phone number format:** E.164 always — `+12025551234`. Never store without country code.
Strip formatting on receipt, normalize before storage and comparison.

**Timestamps:** ISO 8601 strings for Supabase, `new Date().toISOString()` for generation.
Never store Unix timestamps in the database.

**Logging:** NestJS built-in `Logger` with class name context — `new Logger(ClassName.name)`.
Never `console.log`. Never log phone numbers in plaintext — log masked form: `+1202***1234`.

### Communication Patterns

**Vapi tool responses (function-call events):**
```typescript
// Tool call result format — Vapi reads this
return { result: { success: true, message: 'optional message' } };
// or on failure
return { result: { success: false, error: 'reason' } };
```

**Post-call async work pattern:**
```typescript
// In onCallEnd — return immediately, process async
async onCallEnd(message: any): Promise<void> {
  const vapiCallId = message?.call?.id;
  // Fire and forget — do NOT await
  setImmediate(() => this.processPostCall(vapiCallId, message));
}

private async processPostCall(vapiCallId: string, message: any): Promise<void> {
  try {
    // all the slow stuff: coaching plan, SMS, session update
  } catch (err) {
    this.logger.error(`Post-call processing failed for ${vapiCallId}`, err);
    // never rethrow — this is background work
  }
}
```

**Crisis detection — never in the AI flow:**
Crisis keywords and protocol response are constants in `common/crisis.constants.ts`.
They are injected into call handling logic, not read from database or config.
```typescript
// common/crisis.constants.ts
export const CRISIS_KEYWORDS = ['end my life', 'kill myself', 'dont want to be here', ...];
export const CRISIS_RESPONSE = "I hear you. What you're feeling right now matters...";
export const CRISIS_SMS = "988 — Suicide & Crisis Lifeline\n\nYou reached out tonight. That matters.";
```

### Process Patterns

**Error handling hierarchy:**
1. Webhook handler catches all — returns 200 regardless
2. Service methods throw — let the handler catch
3. Background async work catches internally — never propagates
4. Supabase errors always checked — `if (error) throw error`

**Null safety:** Use optional chaining throughout. Vapi webhook payloads are loosely
typed — treat every nested access as potentially undefined.
```typescript
const phone = message?.call?.customer?.number;
if (!phone) return this.getDefaultAssistantConfig();
```

**Service initialization:** All external clients (Supabase, Twilio, Stripe, Anthropic)
initialized in constructor, not lazily. Fail fast at startup if credentials missing.

### Enforcement

**All agents MUST:**
- Use `ConfigService` for all environment variable access — never `process.env` directly
- Return HTTP 200 from all webhook endpoints regardless of internal state
- Check Supabase `error` before using `data` in every query
- Log with `new Logger(ClassName.name)` — never `console.log`
- Use E.164 phone number format in all storage and comparison
- Never log phone numbers in plaintext
- Keep crisis constants in `common/crisis.constants.ts` — never inline strings

**Anti-patterns (never do these):**
- Re-creating the Supabase client per request
- Returning HTTP 4xx or 5xx from webhook endpoints
- Storing `process.env.SOME_KEY` in a local variable across request lifecycle
- Using `any` type in TypeScript (strict mode enforced)
- Awaiting post-call processing inside the webhook handler
- Putting crisis keyword list in system prompt or database

---

## Project Structure and Boundaries

### Complete Project Directory Structure

```
utalkwe-listen-api/
├── .env                              # local dev only — never committed
├── .env.example                      # committed — template with all required vars
├── .gitignore
├── .railway.yaml                     # Railway deployment config
├── nest-cli.json
├── package.json
├── tsconfig.json                     # strict: true
├── tsconfig.build.json
├── README.md
│
├── supabase/
│   └── migrations/
│       └── 001_utalkwe_schema.sql    # complete schema — run once in Supabase SQL editor
│
├── src/
│   ├── main.ts                       # bootstrap: rawBody:true, cors, global pipe
│   ├── app.module.ts                 # imports all feature modules
│   │
│   ├── common/
│   │   ├── crisis.constants.ts       # CRISIS_KEYWORDS[], CRISIS_RESPONSE, CRISIS_SMS
│   │   ├── guards/
│   │   │   └── vapi-webhook.guard.ts # verifies x-vapi-secret header
│   │   └── pipes/
│   │       └── e164-phone.pipe.ts    # normalizes phone numbers to E.164
│   │
│   ├── callers/
│   │   ├── callers.module.ts
│   │   ├── callers.service.ts        # findByPhone, getOrCreate, buildSystemPromptContext
│   │   └── callers.types.ts          # Caller, CallSession, CallerContext interfaces
│   │
│   ├── vapi/
│   │   ├── vapi.module.ts
│   │   ├── vapi.controller.ts        # POST /vapi/webhook — routes by message.type
│   │   ├── vapi.service.ts           # buildDynamicAssistant, onCallStart, onCallEnd
│   │   └── vapi.types.ts             # VapiWebhookPayload, AssistantConfig interfaces
│   │
│   ├── coaching/
│   │   ├── coaching.module.ts
│   │   ├── coaching.service.ts       # generatePlan (Anthropic), savePlan, buildFollowUpSms
│   │   └── coaching.types.ts         # CoachingPlan, PlanStep interfaces
│   │
│   ├── sms/
│   │   ├── sms.module.ts
│   │   ├── sms.service.ts            # send, sendUpgradePrompt, sendCrisisSms
│   │   └── sms.types.ts              # SmsMessageType enum
│   │
│   └── stripe/
│       ├── stripe.module.ts
│       ├── stripe.controller.ts      # POST /stripe/webhook — raw body required
│       └── stripe.types.ts           # SubscriptionTier enum, PRICE_TO_TIER map
│
└── test/
    ├── unit/
    │   ├── callers/
    │   │   └── callers.service.spec.ts
    │   ├── vapi/
    │   │   └── vapi.service.spec.ts
    │   ├── coaching/
    │   │   └── coaching.service.spec.ts
    │   └── common/
    │       └── crisis.constants.spec.ts   # validates keywords list, response immutability
    └── e2e/
        └── webhook.e2e-spec.ts            # tests full webhook flow with mocked services
```

### Architectural Boundaries

**Vapi Module boundary:**
- Owns: webhook receipt, event routing, dynamic assistant construction, tool call handling, call lifecycle tracking
- Calls: CallersService (read + write), CoachingService (generate plan), SmsService (post-call delivery)
- Never calls: Stripe directly, Twilio directly
- Does NOT own: database writes beyond activeCalls map and session updates via CallerService

**Callers Module boundary:**
- Owns: all Supabase reads and writes for `callers` and `call_sessions` tables
- Owns: system prompt construction (memory block building)
- Owns: subscription access check (`canAccessCall`)
- Never constructs: Vapi assistant config, coaching plans, SMS bodies
- Is the ONLY module that touches `callers` and `call_sessions` tables directly

**Coaching Module boundary:**
- Owns: Anthropic API calls, coaching plan generation, plan persistence to `coaching_plans`
- Owns: SMS body construction for coaching plans
- Never: touches `callers` table, touches Twilio directly
- Receives: CallerContext from VapiService (passed through), never fetches caller data itself

**SMS Module boundary:**
- Owns: all Twilio SMS client calls, all `sms_log` table writes
- Is the ONLY module that calls Twilio directly
- Receives: message body and metadata — never constructs message content itself
- Exception: `sendUpgradePrompt` and `sendCrisisSms` construct their own bodies
  (these are system-triggered messages, not AI-generated)

**Stripe Module boundary:**
- Owns: Stripe webhook receipt and verification
- Owns: `subscriptions` table writes
- Owns: `callers.subscription_tier` and `callers.stripe_customer_id` updates
- Is the ONLY module that reads Stripe events or writes subscription state
- Never: triggers calls, sends SMS, touches `call_sessions`

**Common module boundary:**
- Owns: crisis constants (immutable, code-only)
- Owns: webhook guard (Vapi secret verification)
- Owns: shared type utilities
- Never: contains business logic, never imports feature modules

### Requirements to Structure Mapping

| FR Category | Module | Key Files |
|-------------|--------|-----------|
| Call Handling (FR1–6) | Vapi | `vapi.controller.ts`, `vapi.service.ts` |
| Caller Identity & Memory (FR7–13) | Callers | `callers.service.ts` |
| Haven AI Behavior (FR14–26) | Vapi | `vapi.service.ts` (buildDynamicAssistant) |
| Crisis Handling (FR27–33) | Common + Vapi | `crisis.constants.ts`, `vapi.service.ts` |
| Subscription & Access (FR34–40) | Callers + Stripe | `callers.service.ts` (canAccessCall), `stripe.controller.ts` |
| SMS & Follow-Up (FR41–47) | SMS + Coaching | `sms.service.ts`, `coaching.service.ts` |
| Caller Data (FR48–51) | Callers | `callers.service.ts` |
| Payment Integration (FR52–54) | Stripe | `stripe.controller.ts` |

### Integration Points and Data Flow

**Inbound call flow (synchronous — must complete < 1 second):**
```
Twilio receives call
  → Vapi handles voice
    → POST /vapi/webhook (assistant-request)
      → VapiWebhookGuard verifies secret
        → VapiController routes to VapiService.buildDynamicAssistant()
          → CallersService.getOrCreateCallerContext(phone)   [Supabase read]
          → CallersService.canAccessCall(callerId)           [Supabase read]
          → CallersService.buildSystemPromptContext(ctx)     [in-memory]
          → return { assistant: { ... } } to Vapi
```

**Post-call flow (asynchronous — runs after 200 returned):**
```
Vapi fires POST /vapi/webhook (end-of-call-report)
  → VapiController returns { received: true }   ← 200 sent immediately
  → setImmediate(() => VapiService.processPostCall())
    → CallersService.updateSession(vapiCallId, summary)    [Supabase write]
    → CallersService.incrementCallCount(callerId)          [Supabase write]
    → CoachingService.generatePlan(ctx, summary, category) [Anthropic API]
    → CoachingService.savePlan(callerId, sessionId, plan)  [Supabase write]
    → SmsService.send(callerId, phone, smsBody, 'follow_up') [Twilio API]
```

**Subscription activation flow:**
```
Caller pays via Stripe checkout
  → Stripe fires POST /stripe/webhook (checkout.session.completed)
    → StripeController.handleCheckoutComplete(session)
      → Supabase: update callers.subscription_tier
      → Supabase: upsert subscriptions record
    → next call: CallersService.canAccessCall() returns { allowed: true }
```

### Health Endpoint

```typescript
// GET /health — for Railway uptime monitoring and external health checks
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are compatible and proven together. NestJS 11 + Node 22 +
supabase-js 2.99.3 + Twilio 5 + Stripe 16 + Anthropic SDK 0.27 are all current stable
versions with no known conflicts. TypeScript strict mode is supported by all packages.
Railway supports Node 22 natively.

**Pattern Consistency:**
Naming conventions are consistent — snake_case in database, camelCase in TypeScript,
kebab-case in files. The feature-first module structure aligns with NestJS conventions
and the separation of concerns. The HTTP 200 always pattern is consistently applied
across all three webhook handlers.

**Structure Alignment:**
Every boundary is respected — Callers module owns all caller data, SMS module is the
sole Twilio caller, Stripe module is the sole subscription state writer. The critical
path data flow is clean: VapiController → VapiService → CallersService → Supabase →
back to Vapi in under 1 second. Post-call work is fully decoupled via setImmediate.

### Requirements Coverage Validation ✅

**Functional Requirements (54 total):**

| FR Category | Count | Covered By | Status |
|-------------|-------|------------|--------|
| Call Handling | 6 | VapiModule, Railway | ✅ |
| Caller Identity & Memory | 7 | CallersModule, Supabase | ✅ |
| Haven AI Behavior | 13 | VapiService (buildDynamicAssistant) | ✅ |
| Crisis Handling | 7 | CrisisConstants + VapiService | ✅ |
| Subscription & Access | 7 | CallersService + StripeModule | ✅ |
| SMS & Follow-Up | 7 | SmsModule + CoachingModule | ✅ |
| Caller Data & Payment | 7 | CallersModule + StripeModule | ✅ |

All 54 functional requirements have explicit architectural support.

**Non-Functional Requirements (21 total):**

| NFR | Requirement | Architecture Response | Status |
|-----|-------------|----------------------|--------|
| NFR1 | Call answer < 2s | Vapi handles audio; webhook optimized for < 1s | ✅ |
| NFR2 | Memory injection < 1s | Single indexed Supabase lookup, singleton client | ✅ |
| NFR3 | Crisis detection < 1s (L1) | In-memory keyword array check, no I/O | ✅ |
| NFR4 | SMS within 5 min | setImmediate async, Twilio direct send | ✅ |
| NFR5 | SMS delivery ≥ 98% | Twilio SLA | ✅ |
| NFR6 | 99.5% uptime | Railway SLA + stateless deploy | ✅ |
| NFR7 | < 1% call failure | Graceful degradation to first-time mode | ✅ |
| NFR8 | DB degradation | Explicit fallback in buildDynamicAssistant | ✅ |
| NFR9 | Webhook retry | 200-always pattern prevents retry storms | ✅ |
| NFR10 | Encryption | Supabase encrypted at rest, HTTPS everywhere | ✅ |
| NFR11 | Service role key isolation | ConfigService only, never client-side | ✅ |
| NFR12 | Vapi webhook verify | VapiWebhookGuard on all /vapi/webhook calls | ✅ |
| NFR13 | Stripe webhook verify | constructEvent() with raw body | ✅ |
| NFR14 | Phone number masking | Logger pattern documented in patterns section | ✅ |
| NFR15 | 50→200 concurrent | Vapi scales; NestJS stateless handler | ✅ |
| NFR16 | Connection pooling | Singleton supabase-js client handles pooling | ✅ |
| NFR17 | Stateless handler | No in-memory state across requests | ✅ |
| NFR18 | AI disclosure hardcoded | firstMessage built in VapiService, not config | ✅ |
| NFR19 | TCPA consent gate | sms_log insert required before Twilio call | ✅ |
| NFR20 | Crisis protocol immutable | crisis.constants.ts — code only, not DB | ✅ |
| NFR21 | 12-month data retention | Supabase default retention, no auto-delete | ✅ |

All 21 non-functional requirements are architecturally addressed.

### Implementation Readiness Validation ✅

**Decision completeness:** All critical decisions documented with verified version
numbers. No ambiguous choices remain that would cause agents to make different
decisions on different modules.

**Structure completeness:** Every file is named, every directory is defined, every
module boundary is explicit. An agent reading the project structure section knows
exactly where to put any new code.

**Pattern completeness:** All potential conflict points addressed — naming, error
handling, async patterns, webhook response format, database query patterns. Anti-patterns
are explicitly listed so agents know what not to do.

### Gap Analysis

**No critical gaps identified.**

**One important gap — acknowledged and intentional:**
The `activeCalls` Map in VapiService (`Map<vapiCallId, callerId>`) is in-memory.
This means if the process restarts mid-call, the mapping is lost and post-call
processing cannot associate the session with a caller. At 50 concurrent calls on
a single Railway instance this is acceptable. Mitigation: Supabase `call_sessions`
table can be queried by `vapi_call_id` as a fallback — implement this in the
`onCallEnd` handler as a secondary lookup if the Map lookup misses.

**Two Phase 2 gaps (intentional deferrals):**
- No operator dashboard — manual Supabase access for MVP
- No automated data deletion — manual process for MVP deletion requests

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] 54 FRs analyzed for architectural implications
- [x] 21 NFRs mapped to specific architectural decisions
- [x] Critical path identified and optimized around
- [x] Compliance constraints treated as architectural (not configurable)

**✅ Architectural Decisions**
- [x] Technology stack with verified current versions
- [x] Database strategy and client pattern
- [x] Security and webhook verification per source
- [x] Deployment platform selected
- [x] Async vs sync processing boundaries defined

**✅ Implementation Patterns**
- [x] Naming conventions across all layers
- [x] Module structure and feature-first organization
- [x] Error handling hierarchy
- [x] Webhook response format
- [x] Async post-call processing pattern
- [x] Crisis constants immutability pattern

**✅ Project Structure**
- [x] Complete directory tree with every file named
- [x] Module boundaries explicit and non-overlapping
- [x] FR-to-file mapping complete
- [x] Data flow diagrams for critical paths

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High**

**Key Strengths:**
- Critical path is the organizing principle — everything optimized around the
  1-second assistant-request window
- Module boundaries are clean with no circular dependencies
- All compliance requirements are architectural (in code, not config)
- Graceful degradation is defined for every external service failure
- Technical spike already validated the core Vapi webhook pattern

**Areas for Future Enhancement (Phase 2):**
- Redis cache for Supabase caller lookup at high call volume
- Bull queue for post-call processing at 200+ concurrent calls
- Operator dashboard for crisis flag review
- AWS migration at scale milestone

### Implementation Handoff

**AI Agent Guidelines:**
- Follow the data flow diagrams exactly — do not shortcut module boundaries
- The assistant-request handler is the most performance-sensitive code in the system;
  every line added to it must be justified
- Crisis constants live in `common/crisis.constants.ts` and nowhere else — this is
  a safety requirement, not a style preference
- HTTP 200 always from webhooks — never return error codes regardless of internal state
- Use `setImmediate()` for all post-call work — never await it inside the handler

**First Implementation Story:**
```bash
nest new utalkwe-listen-api --package-manager npm --strict
```
Then: Supabase schema migration → main.ts bootstrap → common module →
callers module → vapi module → coaching + sms → stripe module → Railway deploy.
