---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: [prd-utalkwe-listen.md, architecture-utalkwe-listen.md]
---

# UtalkWe Listen - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for UtalkWe Listen,
decomposing the requirements from the PRD and Architecture into implementable stories
for a single developer working with AI coding agents.

---

## Requirements Inventory

### Functional Requirements

FR1: The system can receive inbound phone calls on a US toll-free number 24 hours a day, 7 days a week, without human intervention
FR2: The system answers every call within 2 seconds of connection
FR3: The system can handle a minimum of 50 concurrent inbound calls
FR4: The system delivers an AI disclosure statement as the first sentence of every call, every time, without exception
FR5: The system gracefully ends a call if silence persists for 30 seconds with no caller response
FR6: The system enforces a maximum call duration of 10 minutes for free-tier callers and 45 minutes for paid-tier callers
FR7: The system identifies each caller by their E.164-formatted phone number with no account creation required
FR8: The system looks up a caller's profile and session history before the first word of every call
FR9: The system creates a new caller profile automatically on the first call from any phone number
FR10: The system stores caller name, guidance preference, voice context, and call count against each caller profile
FR11: The system injects caller history — including name, last issue, last summary, and preference — into Haven's context before the conversation begins
FR12: The system stores a summary and issue category for every completed call session
FR13: The system falls back to treating a caller as first-time if the database lookup fails, without causing call failure
FR14: Haven greets first-time callers with a warm welcome that includes the AI disclosure and an open invitation to talk
FR15: Haven greets returning callers by name and references their previous issue naturally without clinical language
FR16: Haven auto-selects a male or female voice based on caller context and issue type, without asking the caller
FR17: Haven applies a returning caller's stored voice context to every subsequent call
FR18: Haven detects the caller's guidance preference (faith or general) from conversation signals when no preference is stored
FR19: Haven delivers faith-based wisdom (scripture references) when the caller's guidance preference is faith or both
FR20: Haven delivers philosophical and practical wisdom when the caller's guidance preference is general
FR21: Haven offers a single optional verse or philosophical quote to general-preference callers near the end of the call, framed as optional
FR22: Haven responds with empathy and acknowledgment before offering practical advice in every conversation
FR23: Haven can save a caller's name when the caller shares it during conversation
FR24: Haven can save a caller's guidance preference when the caller states it during conversation
FR25: Haven can request generation of a post-call coaching plan during conversation with issue category and summary
FR26: Haven ends every call with a warm close that does not create dependency but leaves the door open
FR27: The system detects crisis-level language using keyword matching within 1 second of utterance
FR28: The system detects crisis-level language using semantic analysis running in parallel with keyword matching
FR29: When either detection layer triggers, the system immediately stops the current conversation flow and activates the crisis protocol
FR30: The crisis protocol delivers a hardcoded, AI-disclosure-aware response that provides 988 and offers to stay on the line
FR31: The crisis protocol cannot be overridden by any system prompt instruction, caller preference, or subscription tier
FR32: The system flags the call session as a crisis event and logs the indicator that triggered detection
FR33: The system sends a post-crisis SMS containing only the 988 number and a brief message of acknowledgment — no coaching plan
FR34: The system checks a caller's subscription tier and monthly call count at the start of every call before conversation begins
FR35: The system allows free-tier callers to make up to 3 calls per calendar month
FR36: The system responds to a free-tier caller who has exhausted their monthly allocation with a warm, brief message and ends the call
FR37: The system automatically sends an upgrade SMS to a free-tier caller when their monthly limit is reached
FR38: The system allows paid-tier callers unlimited calls within their tier's duration cap
FR39: The system activates a caller's subscription tier immediately upon successful Stripe payment confirmation
FR40: The system reverts a caller to free tier immediately upon subscription cancellation or payment failure
FR41: Haven requests explicit verbal consent from the caller before any post-call SMS is sent
FR42: The system logs SMS consent with caller ID and timestamp before sending any message
FR43: The system generates a personalized coaching plan using AI within 5 minutes of call end for consenting callers
FR44: The coaching plan contains a title, 5–7 day action steps, and a wisdom anchor appropriate to the caller's guidance preference
FR45: The system delivers the coaching plan via SMS to the caller's phone number
FR46: The system does not send any SMS to callers who did not provide explicit consent
FR47: The system sends an upgrade SMS with a Stripe checkout link when a free-tier caller's monthly limit is reached
FR48: The system stores call session records including start time, end time, duration, issue category, issue summary, full summary, wisdom used, and crisis flag
FR49: The system stores SMS log records including message type, body, delivery status, and Twilio message ID
FR50: The system stores subscription records mirroring Stripe subscription state including tier, status, and period end date
FR51: The system increments a caller's call count on every completed session
FR52: The system creates or updates a caller's subscription record on successful Stripe checkout completion
FR53: The system updates a caller's subscription status on Stripe subscription update events including renewals, plan changes, and cancellations
FR54: The system marks a caller's subscription as past due on Stripe payment failure without immediately revoking access

### NonFunctional Requirements

NFR1: Call answer latency — Haven must speak its first word within 2 seconds of call connection
NFR2: Memory injection latency — Supabase caller lookup and system prompt construction must complete within 1 second
NFR3: Crisis detection latency — Layer 1 keyword match must trigger within 1 second; Layer 2 semantic analysis within 3 seconds
NFR4: Coaching plan generation — AI-generated plan created and SMS delivered within 5 minutes of call end
NFR5: SMS delivery — Twilio SMS must deliver within 5 minutes with ≥ 98% delivery rate
NFR6: System uptime — ≥ 99.5% monthly uptime for the inbound call path
NFR7: Call failure rate — < 1% of calls may fail to connect due to system error
NFR8: Database degradation — if Supabase unavailable, calls must complete in first-time mode without failure
NFR9: Webhook reliability — Vapi webhook failures retried up to 3 times before logging failure
NFR10: Data encryption — all caller data encrypted at rest and in transit via TLS 1.2+
NFR11: Service role key — Supabase service role key never exposed client-side; all database access server-side only
NFR12: Webhook verification — all Vapi webhooks verified against webhook secret; unverified requests rejected with 401
NFR13: Stripe webhook verification — all Stripe events verified using signing secret before subscription state updated
NFR14: Phone number handling — caller phone numbers never logged in plaintext; only masked representations in logs
NFR15: Concurrent calls — system supports 50 concurrent calls at launch, scaling to 200 without architectural changes
NFR16: Database connection pooling — Supabase queries use connection pooling to support concurrent call volume
NFR17: Stateless webhook handler — NestJS webhook handler is stateless (no in-memory session state across requests)
NFR18: AI disclosure — disclosure statement appears as first sentence of every call; verified by automated test before each deploy
NFR19: TCPA SMS — no SMS sent without logged consent record; sms_log insert must fail rather than send without consent
NFR20: Crisis protocol immutability — crisis keyword list and protocol response defined in application code, not configurable
NFR21: Data retention — caller session data retained for minimum 12 months; deletion requests honored within 30 days

### Additional Requirements

From Architecture document:

- Project initialization: `nest new utalkwe-listen-api --package-manager npm --strict` is the first implementation story
- Node.js 22 LTS required (Node 18 EOL April 2025)
- NestJS v11.1.17, @supabase/supabase-js v2.99.3, twilio v5.5.0, stripe v16.0.0, @anthropic-ai/sdk v0.27.0
- Raw body middleware (`rawBody: true`) must be enabled in main.ts bootstrap for Stripe webhook signature verification
- Feature-first module structure: callers/, vapi/, coaching/, sms/, stripe/, common/
- HTTP 200 always pattern for all webhook handlers — never return error codes
- Crisis constants must live in `common/crisis.constants.ts` — code only, not database or config
- setImmediate() for all post-call async work — never awaited inside the webhook handler
- Single Supabase client singleton via NestJS DI — never re-created per request
- Health endpoint: GET /health returning `{ status: 'ok', timestamp: ... }`
- Railway deployment platform for MVP
- Supabase schema migration: `supabase/migrations/001_utalkwe_schema.sql` — run before any other story
- activeCalls Map in VapiService is in-memory; Supabase `call_sessions` used as fallback lookup by vapi_call_id

### UX Design Requirements

None — UtalkWe Listen is a phone-only product with no frontend UI in MVP.

### FR Coverage Map

FR1–3: Epic 1 (Infrastructure & Call Foundation)
FR4, FR7–9, FR13–15: Epic 2 (Caller Identity & Memory)
FR5–6, FR10–12, FR16–18: Epic 3 (Haven AI Behavior)
FR19–26: Epic 4 (Wisdom Delivery & Conversation Quality)
FR27–33: Epic 5 (Crisis Detection & Safety)
FR34–40: Epic 6 (Subscription & Access Control)
FR41–47: Epic 7 (SMS Follow-Up & Coaching Plans)
FR48–54: Epic 8 (Data Persistence & Payment Integration)

## Epic List

### Epic 1: Infrastructure & Call Foundation
Establish the NestJS project, Supabase schema, Vapi integration, and basic call receipt so the phone number answers and Haven speaks.
**FRs covered:** FR1, FR2, FR3

### Epic 2: Caller Identity & Memory
Implement phone-number-as-identity, Supabase caller lookup, profile creation, and dynamic system prompt injection so Haven knows who it's talking to before the first word.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15

### Epic 3: Haven AI Behavior — Core Conversation
Implement voice auto-selection, guidance preference detection, call duration enforcement, silence timeout, and the warm close so Haven behaves correctly in every conversation.
**FRs covered:** FR4, FR5, FR6, FR16, FR17, FR18

### Epic 4: Wisdom Delivery & Conversation Quality
Implement the three-well wisdom system (faith/philosophy/practical), tool-based preference saving, name capture, and coaching plan request so Haven delivers contextually appropriate guidance.
**FRs covered:** FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26

### Epic 5: Crisis Detection & Safety Protocol
Implement layered crisis detection (keyword + semantic), hardcoded protocol response, session flagging, and post-crisis SMS so the system handles distress safely and compliantly.
**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR32, FR33

### Epic 6: Subscription & Access Control
Implement subscription tier gating at call start, free-tier monthly limits, upgrade SMS, and Stripe webhook handling so access is controlled by payment status.
**FRs covered:** FR34, FR35, FR36, FR37, FR38, FR39, FR40

### Epic 7: SMS Follow-Up & Coaching Plans
Implement TCPA-compliant SMS consent capture, post-call coaching plan generation via Anthropic API, and SMS delivery so callers receive personalized follow-up after every consented call.
**FRs covered:** FR41, FR42, FR43, FR44, FR45, FR46, FR47

### Epic 8: Data Persistence, Payments & Production
Implement complete session/SMS/subscription data storage, Stripe subscription lifecycle events, call count tracking, and Railway production deployment with health endpoint.
**FRs covered:** FR48, FR49, FR50, FR51, FR52, FR53, FR54

---

## Epic 1: Infrastructure & Call Foundation

The phone number answers. Vapi picks up. Haven speaks the opening line. This epic delivers the minimum viable system — a running NestJS app deployed to Railway with a working Vapi webhook, a Supabase schema, and a phone call that gets answered.

**FRs covered:** FR1, FR2, FR3
**NFRs covered:** NFR6, NFR7, NFR12, NFR15, NFR17

---

### Story 1.1: Initialize NestJS Project with Core Configuration

As a developer,
I want to scaffold the NestJS application with strict TypeScript, environment configuration, and raw body support,
So that all subsequent modules have a correct, consistent foundation to build on.

**Acceptance Criteria:**

**Given** a Node.js 22 environment with @nestjs/cli installed
**When** the project is scaffolded and configured
**Then** running `npm run start:dev` starts the server on the configured PORT without errors
**And** `ConfigModule.forRoot({ isGlobal: true })` is configured so all modules can access environment variables via ConfigService
**And** `NestFactory.create(AppModule, { rawBody: true })` is set in main.ts (required for Stripe webhook verification)
**And** a global `ValidationPipe` is applied
**And** CORS is enabled
**And** TypeScript strict mode is enforced (tsconfig.json: `"strict": true`)
**And** `.env.example` documents every required environment variable

**Project structure created:**
```
src/main.ts
src/app.module.ts
.env.example
tsconfig.json (strict: true)
nest-cli.json
```

**Environment variables required in .env:**
```
PORT=3001
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
VAPI_WEBHOOK_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_BASIC=
STRIPE_PRICE_PREMIUM=
STRIPE_PRICE_VIP=
FREE_CALLS_PER_MONTH=3
FREE_CALL_MAX_MINUTES=10
```

---

### Story 1.2: Run Supabase Schema Migration

As a developer,
I want to apply the complete database schema to Supabase,
So that all tables, indexes, RLS policies, and triggers are in place before any application code runs against the database.

**Acceptance Criteria:**

**Given** a Supabase project exists and the service role key is available
**When** the migration SQL is run in the Supabase SQL Editor
**Then** the following tables exist: `callers`, `call_sessions`, `coaching_plans`, `sms_log`, `subscriptions`
**And** `callers.phone` has a unique index
**And** `call_sessions.vapi_call_id` has a unique index
**And** Row Level Security is enabled on all tables
**And** `service_role_all` policies exist on all tables
**And** `update_updated_at` trigger fires on `callers` and `subscriptions` before update
**And** a test insert to `callers` with a phone number succeeds and a duplicate phone number fails with a unique constraint error

**File:** `supabase/migrations/001_utalkwe_schema.sql`

---

### Story 1.3: Implement Vapi Webhook Controller with Signature Guard

As the system,
I want to receive and verify all Vapi webhook events at a single endpoint,
So that Haven's call lifecycle is orchestrated securely and only legitimate Vapi events are processed.

**Acceptance Criteria:**

**Given** the NestJS app is running and VAPI_WEBHOOK_SECRET is set
**When** a POST request arrives at `/vapi/webhook` with the correct `x-vapi-secret` header
**Then** the request is accepted and processed (HTTP 200 returned)
**And** when the header is missing or incorrect, a 401 response is returned
**And** the controller routes events by `message.type`:
  - `assistant-request` → `VapiService.buildDynamicAssistant()`
  - `call-start` → `VapiService.onCallStart()`
  - `end-of-call-report` → `VapiService.onCallEnd()`
  - `function-call` → `VapiService.handleFunctionCall()`
  - all other types → `{ received: true }`
**And** ALL webhook events return HTTP 200 regardless of internal processing outcome
**And** internal errors are logged with `Logger` but never cause non-200 responses

**Files created:**
```
src/common/guards/vapi-webhook.guard.ts
src/vapi/vapi.controller.ts
src/vapi/vapi.module.ts
src/vapi/vapi.service.ts (stub with method signatures only)
src/vapi/vapi.types.ts
```

---

### Story 1.4: Implement Default Assistant Configuration and Health Endpoint

As a caller,
I want Haven to answer my call with a default greeting within 2 seconds,
So that the phone call is functional even before caller memory and personalization are implemented.

**Acceptance Criteria:**

**Given** the Vapi webhook is connected to a Twilio phone number
**When** an inbound call triggers an `assistant-request` webhook
**Then** `VapiService.getDefaultAssistantConfig()` returns a valid Vapi assistant config object
**And** the config includes Haven's default `firstMessage`: *"Welcome to UtalkWe Listen. I'm Haven — an AI guidance service, not a licensed counselor. What's been on your mind?"*
**And** the voice is set to a warm female voice (PlayHT `jennifer` or equivalent)
**And** `maxDurationSeconds` is set to 600 (10 minutes — free tier default)
**And** `silenceTimeoutSeconds` is set to 30
**And** GET `/health` returns `{ status: 'ok', timestamp: '<ISO string>' }` with HTTP 200
**And** a test call to the Twilio number results in Haven answering within 2 seconds

**Note:** This story uses the default config only. Memory injection (Story 2.x) will replace this with dynamic config.

---

## Epic 2: Caller Identity & Memory

Haven knows who is calling before saying a word. This epic implements the critical path: phone number → Supabase lookup → caller context → personalized system prompt → dynamic assistant config returned to Vapi. It also implements the callers module fully — create, read, update — and the two greeting variants (first-time vs returning).

**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15
**NFRs covered:** NFR2, NFR8, NFR11, NFR14, NFR16

---

### Story 2.1: Implement Callers Service — Profile CRUD and Session Storage

As the system,
I want to create, read, and update caller profiles and call sessions in Supabase,
So that Haven has persistent memory of every caller across calls.

**Acceptance Criteria:**

**Given** the Supabase migration from Story 1.2 is applied
**When** `CallersService.findByPhone('+12025551234')` is called for a new number
**Then** it returns `null` (not found, not an error)
**And** `CallersService.createCaller('+12025551234')` creates a row in `callers` and returns the new record
**And** `CallersService.updateCaller(id, { name: 'Simone' })` updates the caller record
**And** `CallersService.createSession(callerId, vapiCallId)` creates a row in `call_sessions`
**And** `CallersService.updateSession(vapiCallId, { issue_category: 'money', full_summary: '...' })` updates the session
**And** `CallersService.getRecentSessions(callerId, 3)` returns the 3 most recent sessions ordered by `started_at desc`
**And** `CallersService.incrementCallCount(callerId)` increments `callers.call_count` by 1
**And** phone numbers are never logged in plaintext — logs use masked form `+1202***1234`
**And** the Supabase client is a singleton (created once, injected via NestJS DI)

**Files created:**
```
src/callers/callers.module.ts
src/callers/callers.service.ts
src/callers/callers.types.ts  (Caller, CallSession, CallerContext interfaces)
```

---

### Story 2.2: Implement Dynamic Assistant Config with Memory Injection

As the system,
I want to look up a caller's profile and history at the start of every call and inject that context into Haven's system prompt,
So that Haven greets returning callers by name and references their previous issues naturally.

**Acceptance Criteria:**

**Given** the Vapi `assistant-request` webhook fires with a caller phone number
**When** `VapiService.buildDynamicAssistant(phone, vapiCallId)` is called
**Then** it calls `CallersService.getOrCreateCallerContext(phone)` to fetch or create the caller record
**And** it calls `CallersService.buildSystemPromptContext(ctx)` to build the memory block string
**And** the returned Vapi assistant config includes the memory block in the system prompt messages
**And** for a first-time caller, the greeting is: *"Welcome to UtalkWe Listen. I'm Haven — an AI guidance service, not a licensed counselor. I'm here to listen. What's been on your mind?"*
**And** for a returning caller with history, the greeting references their last issue: *"Welcome back, [name]. Last time you were dealing with [last issue] — how has that been going?"*
**And** the entire lookup + prompt construction completes in under 1 second (verified by logging elapsed time)
**And** if the Supabase lookup fails (simulated by disconnecting), the system falls back to `getDefaultAssistantConfig()` without throwing — call continues as first-time

**Memory block format injected into system prompt:**
```
CALLER PROFILE:
- Phone: [masked]
- Name: [name or 'not provided']
- Guidance preference: [faith/general/both]
- Total calls: [count]

RETURNING CALLER — Previous context:
- Last issue: [issue_summary]
- Last session: [full_summary truncated to 200 chars]
```

---

### Story 2.3: Implement Call Lifecycle — Start and End Session Tracking

As the system,
I want to create a call session record when a call starts and update it when the call ends,
So that every call has a complete audit trail with summary, duration, and issue category.

**Acceptance Criteria:**

**Given** a call begins (`call-start` webhook fires)
**When** `VapiService.onCallStart(phone, vapiCallId)` is called
**Then** a new `call_sessions` row is created with `caller_id`, `vapi_call_id`, and `started_at`
**And** the vapiCallId is stored in the in-memory `activeCalls` Map: `Map<vapiCallId, callerId>`

**Given** a call ends (`end-of-call-report` webhook fires)
**When** `VapiService.onCallEnd(message)` is called
**Then** HTTP 200 is returned immediately before any post-call processing begins
**And** `setImmediate()` fires `processPostCall()` asynchronously
**And** `processPostCall()` updates the session: `ended_at`, `duration_seconds`, `full_summary`
**And** `CallersService.incrementCallCount(callerId)` is called
**And** if the `activeCalls` Map lookup misses (process restart scenario), the session is fetched from Supabase by `vapi_call_id` as fallback
**And** any errors in `processPostCall()` are logged but never propagate or cause retry

---

## Epic 3: Haven AI Behavior — Core Conversation

Haven behaves correctly in every conversation: right voice for the context, correct duration cap per tier, silence handled gracefully, every call ends warmly. This epic implements the behavioral rules that govern Haven's conduct independent of wisdom content.

**FRs covered:** FR4, FR5, FR6, FR16, FR17, FR18
**NFRs covered:** NFR1, NFR18

---

### Story 3.1: Implement Voice Auto-Selection Logic

As a caller,
I want Haven to use a voice that fits my situation without me being asked,
So that the call feels natural and Haven's presence is appropriate to what I'm sharing.

**Acceptance Criteria:**

**Given** a caller's phone number and the issue context signals from their greeting
**When** `VapiService.getVoiceConfig(callerContext)` is called during assistant config construction
**Then** for a caller with no history, the default voice is female (PlayHT `jennifer`)
**And** for a returning caller, the voice matches their most recent session's detected voice (stored in `callers.preferred_voice`)
**And** for a first-time caller discussing financial/career topics detected via system prompt, a male voice (PlayHT `michael`) is selected
**And** for a first-time caller discussing relationship/emotional topics, a female voice is selected
**And** the selected voice is stored to `callers.preferred_voice` via the `save_preferences` tool call at the end of the first call
**And** the AI disclosure statement *"I'm Haven — an AI guidance service, not a licensed counselor"* appears in every `firstMessage` regardless of voice or caller type (NFR18)

---

### Story 3.2: Implement Guidance Preference Detection and Storage

As a caller,
I want Haven to pick up on whether I want faith-based or general guidance from the conversation,
So that I receive wisdom that resonates with me without being asked to categorize myself.

**Acceptance Criteria:**

**Given** a caller has no stored guidance preference
**When** Haven's system prompt includes guidance detection instructions
**Then** Haven detects faith signals (mentions of God, prayer, church, scripture) and stores preference as `faith` via the `save_preferences` tool
**And** Haven detects secular signals (explicit preference for no religion) and stores preference as `general`
**And** ambiguous cases default to `general`
**And** stored preferences are loaded from `callers.guidance_type` and injected into the system prompt on return calls
**And** the `save_preferences` tool call is defined in the assistant config tools array with parameters: `preferred_voice`, `guidance_type`, `language`
**And** `VapiService.handleFunctionCall()` routes `save_preferences` tool calls to `CallersService.updateCaller()`

---

### Story 3.3: Implement Call Duration Enforcement and Silence Timeout

As the system,
I want to enforce call duration limits per subscription tier and end calls gracefully on silence,
So that free-tier limits are respected and abandoned calls do not consume resources indefinitely.

**Acceptance Criteria:**

**Given** a free-tier caller's call is active
**When** the assistant config is built in `buildDynamicAssistant()`
**Then** `maxDurationSeconds` is set to `FREE_CALL_MAX_MINUTES * 60` (default 600 seconds)
**And** for paid-tier callers, `maxDurationSeconds` is set to 2700 (45 minutes)
**And** `silenceTimeoutSeconds` is set to 30 for all callers
**And** `endCallMessage` is set to: *"You're not alone in this. I'm here anytime you need to talk."*
**And** Vapi enforces these limits natively — no custom implementation needed beyond correct config values

---

## Epic 4: Wisdom Delivery & Conversation Quality

Haven delivers the right wisdom in the right moment — scripture for faith callers, philosophy for secular callers, practical steps for everyone. This epic implements the three-well wisdom system, the tool calls for saving caller preferences and names, and the coaching plan request mechanism.

**FRs covered:** FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26
**NFRs covered:** none new (behavior is AI-driven via system prompt)

---

### Story 4.1: Implement Haven's Wisdom System Prompt

As a caller,
I want Haven to respond with empathy first and offer wisdom appropriate to my beliefs,
So that every conversation feels heard and grounded rather than scripted.

**Acceptance Criteria:**

**Given** a caller's guidance preference is stored or detected
**When** `VapiService.buildSystemPrompt(memoryBlock, guidanceType, includesFaith)` is called
**Then** the system prompt includes the complete Haven persona: calm, grounded, direct, no filler words, no over-positivity
**And** for faith callers (`guidance_type = 'faith'`), the prompt instructs Haven to include 1–2 scripture references naturally: *"You might find something meaningful in Philippians 4:6..."*
**And** for general callers (`guidance_type = 'general'`), the prompt instructs Haven to use philosophical/practical wisdom without religious content
**And** for general callers, Haven offers one optional verse near the close: *"There's something I'd like to leave you with — you can take it or leave it..."*
**And** the prompt instructs Haven to respond with empathy before advice in every exchange
**And** the prompt includes Haven's conversation style rules: short sentences, natural pauses, no interrupting, no "Absolutely!" or "Great question!"
**And** the prompt includes Haven's warm close: *"You're not alone in this. I'm here anytime you need to talk."*

---

### Story 4.2: Implement Tool Calls — Name Saving and Coaching Plan Request

As the system,
I want Haven to save a caller's name when they share it and request a coaching plan when appropriate,
So that future calls are personalized and callers receive actionable follow-up.

**Acceptance Criteria:**

**Given** the assistant config includes tool definitions
**When** Haven invokes the `save_caller_name` tool with `{ name: 'Simone' }`
**Then** `VapiService.handleFunctionCall()` receives the function-call webhook
**And** `CallersService.updateCaller(callerId, { name: 'Simone' })` is called
**And** the tool returns `{ result: { success: true, message: 'Name saved: Simone' } }`

**Given** Haven invokes `request_coaching_plan` with `{ issue_category: 'money', issue_summary: '...', mood: 'anxious' }`
**When** `handleFunctionCall()` processes the call
**Then** `CallersService.updateSession(vapiCallId, { issue_category, issue_summary, caller_mood })` is called
**And** the tool returns `{ result: { success: true, message: 'Plan will be sent via text after the call.' } }`
**And** the post-call `processPostCall()` reads the session's `issue_category` to trigger coaching plan generation

**Tool definitions in assistant config:**
- `save_caller_name`: saves caller's stated name
- `save_preferences`: saves guidance type and voice preference
- `request_coaching_plan`: captures issue category, summary, and mood for post-call processing
- `flag_crisis`: triggers crisis protocol (Epic 5)

---

## Epic 5: Crisis Detection & Safety Protocol

The single most safety-critical epic. When a caller signals distress, Haven stops, provides 988, and offers to stay. The keyword list and protocol response live in code — immutable, not configurable. This epic cannot be deprioritized or deferred.

**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR32, FR33
**NFRs covered:** NFR3, NFR20

---

### Story 5.1: Implement Crisis Constants and Immutable Protocol

As the system,
I want crisis keywords and the protocol response to be defined in application code and not modifiable at runtime,
So that Haven's safety behavior cannot be accidentally or maliciously overridden.

**Acceptance Criteria:**

**Given** the file `src/common/crisis.constants.ts` is created
**Then** it exports `CRISIS_KEYWORDS: string[]` — an array of explicit self-harm and suicidal ideation phrases
**And** it exports `CRISIS_RESPONSE: string` — the exact hardcoded response Haven delivers when crisis is detected:
  *"I hear you. What you're feeling right now matters more than anything else. I want to make sure you have the right support — please reach out to 988. They're there specifically for times like this and they will pick up. Can I stay with you for a moment while you decide to call?"*
**And** it exports `CRISIS_SMS: string` — the exact text sent after a crisis call:
  *"988 — Suicide & Crisis Lifeline\n\nYou reached out tonight. That matters."*
**And** these constants are `export const` — not read from environment, not from database, not from config
**And** a unit test in `test/unit/common/crisis.constants.spec.ts` validates the keyword list is non-empty and the protocol response includes '988'

**File created:** `src/common/crisis.constants.ts`

---

### Story 5.2: Implement Crisis Detection — Layer 1 Keyword Matching

As the system,
I want to detect explicit crisis language in real-time during calls using keyword matching,
So that Haven activates the safety protocol within 1 second of a caller expressing immediate distress.

**Acceptance Criteria:**

**Given** the `flag_crisis` tool is defined in Haven's assistant config
**When** a caller uses language matching any item in `CRISIS_KEYWORDS`
**Then** Haven invokes the `flag_crisis` tool with `{ severity: 'high', indicator: '<matched phrase>' }`
**And** `VapiService.handleFunctionCall()` routes `flag_crisis` to crisis handling logic
**And** `CallersService.updateSession(vapiCallId, { was_crisis: true, issue_summary: 'CRISIS FLAG: <indicator>' })` is called
**And** the tool returns `{ result: { success: true } }` immediately so Haven can proceed to deliver `CRISIS_RESPONSE`
**And** an internal alert is logged: `this.logger.warn('CRISIS FLAGGED: ' + JSON.stringify(params))`

**flag_crisis tool definition in assistant config:**
```json
{
  "name": "flag_crisis",
  "description": "Flag this call as a crisis situation requiring immediate support",
  "parameters": {
    "severity": { "type": "string", "enum": ["low", "medium", "high"] },
    "indicator": { "type": "string" }
  }
}
```

---

### Story 5.3: Implement Post-Crisis Call Handling and SMS

As the system,
I want crisis calls to be handled differently in post-call processing,
So that callers who flagged as crisis receive only the 988 number via SMS — no coaching plan.

**Acceptance Criteria:**

**Given** a call session has `was_crisis = true`
**When** `processPostCall()` runs after call end
**Then** coaching plan generation is skipped entirely
**And** if the caller had SMS consent, `SmsService.send()` is called with `CRISIS_SMS` as the body and `message_type = 'follow_up'`
**And** if the caller did not consent to SMS, no SMS is sent (TCPA compliance maintained even in crisis)
**And** the session's `action_plan_id` remains null for crisis calls
**And** a log entry is created: `this.logger.warn('Post-crisis SMS sent for call: ' + vapiCallId)`

---

## Epic 6: Subscription & Access Control

Every call is checked at the start. Free callers get 3 calls per month. Paid callers get unlimited. Stripe drives the state. This epic implements the gating logic and the Stripe webhook handler so subscription changes take effect immediately.

**FRs covered:** FR34, FR35, FR36, FR37, FR38, FR39, FR40
**NFRs covered:** NFR13

---

### Story 6.1: Implement Subscription Access Check at Call Start

As the system,
I want to check a caller's subscription tier and monthly call count before any conversation begins,
So that free-tier limits are enforced and paid callers receive their entitled access.

**Acceptance Criteria:**

**Given** `buildDynamicAssistant()` is called with a caller's phone number
**When** `CallersService.canAccessCall(callerId)` is called
**Then** for a paid-tier caller, `{ allowed: true, tier: 'basic' }` is returned immediately
**And** for a free-tier caller with fewer than `FREE_CALLS_PER_MONTH` calls this month, `{ allowed: true, tier: 'free' }` is returned
**And** for a free-tier caller at or over the monthly limit, `{ allowed: false, reason: 'free_limit_reached', tier: 'free' }` is returned
**And** monthly count is calculated from `call_sessions` rows where `caller_id` matches and `started_at >= first day of current calendar month`
**And** when `allowed: false`, `buildDynamicAssistant()` returns the limit-reached assistant config (brief warm message + end call)
**And** `SmsService.sendUpgradePrompt()` is called automatically when the limit is reached

---

### Story 6.2: Implement Limit-Reached Response and Upgrade SMS

As a free-tier caller who has used their monthly allocation,
I want to hear a warm message and receive an SMS with upgrade options,
So that I understand my options clearly and don't feel abandoned.

**Acceptance Criteria:**

**Given** `canAccessCall()` returns `{ allowed: false, reason: 'free_limit_reached' }`
**When** `buildLimitReachedResponse()` is called
**Then** a Vapi assistant config is returned with `firstMessage`: *"Hey [name], good to hear from you. I want to be upfront — you've used your free calls for this month. I just sent you a text with options to continue. I'm sorry I can't be fully here tonight, but you're not alone — reach back out when you're ready."*
**And** `endCallAfterSpoken: true` or equivalent is set so the call ends after the message
**And** `SmsService.sendUpgradePrompt(callerId, phone)` is called before returning the config
**And** `sendUpgradePrompt()` sends an SMS with tier options and a Stripe checkout link
**And** the upgrade SMS is sent without requiring verbal consent (service communication category)

---

### Story 6.3: Implement Stripe Webhook Handler

As the system,
I want to receive and process Stripe subscription lifecycle events,
So that caller subscription tiers are updated immediately when payments succeed or fail.

**Acceptance Criteria:**

**Given** the Stripe webhook is configured with events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
**When** `POST /stripe/webhook` receives an event
**Then** the raw body + `STRIPE_WEBHOOK_SECRET` are used to verify the signature via `stripe.webhooks.constructEvent()`
**And** unverified requests are rejected (logged, return `{ error: 'Invalid signature' }` with HTTP 200)
**And** `checkout.session.completed` triggers: update `callers.subscription_tier` and `callers.stripe_customer_id`, upsert `subscriptions` record
**And** `customer.subscription.updated` triggers: update `subscriptions.status`, `subscriptions.tier`, `subscriptions.current_period_end`; update `callers.subscription_tier`
**And** `customer.subscription.deleted` triggers: set `callers.subscription_tier = 'free'`, set `subscriptions.status = 'canceled'`
**And** `invoice.payment_failed` triggers: set `subscriptions.status = 'past_due'` (does not immediately revoke access — FR54)
**And** the `PRICE_TO_TIER` map correctly maps `STRIPE_PRICE_BASIC` → `'basic'`, `STRIPE_PRICE_PREMIUM` → `'premium'`, `STRIPE_PRICE_VIP` → `'vip'`

**Files created:**
```
src/stripe/stripe.module.ts
src/stripe/stripe.controller.ts
src/stripe/stripe.types.ts  (SubscriptionTier enum, PRICE_TO_TIER map)
```

---

## Epic 7: SMS Follow-Up & Coaching Plans

After every consented call, Haven sends a personalized coaching plan. This epic implements TCPA-compliant consent capture, the Anthropic API coaching plan generation, and the SMS delivery. The caller's faith preference shapes whether the plan includes scripture.

**FRs covered:** FR41, FR42, FR43, FR44, FR45, FR46, FR47
**NFRs covered:** NFR4, NFR5, NFR19

---

### Story 7.1: Implement SMS Service with TCPA Consent Gate

As the system,
I want to send SMS messages only to callers who have given explicit verbal consent,
So that all SMS delivery is TCPA-compliant and no unsolicited messages are sent.

**Acceptance Criteria:**

**Given** a caller has provided verbal consent during the call (`request_coaching_plan` tool called)
**When** `SmsService.send(callerId, phone, body, messageType)` is called
**Then** a `sms_log` row is inserted with `caller_id`, `phone`, `message_type`, `body`, `status = 'sent'`
**And** the Twilio client sends the SMS from `TWILIO_PHONE_NUMBER` to the caller's number
**And** the Twilio `message.sid` is saved to `sms_log.twilio_sid`
**And** if `SmsService.send()` is called for a caller without a prior consent signal, the call is logged as a warning and the SMS is NOT sent
**And** consent is inferred from the presence of a `request_coaching_plan` tool call in the session — no separate consent table is required for MVP
**And** crisis SMS (`CRISIS_SMS`) bypasses the coaching plan consent check but still logs to `sms_log`

**Files created:**
```
src/sms/sms.module.ts
src/sms/sms.service.ts
src/sms/sms.types.ts  (SmsMessageType enum: 'follow_up' | 'daily_wisdom' | 'plan_step' | 'subscription')
```

---

### Story 7.2: Implement Coaching Plan Generation via Anthropic API

As a caller who opted in,
I want to receive a personalized 5–7 day coaching plan via SMS within 5 minutes of my call ending,
So that I have concrete next steps grounded in the guidance Haven gave me.

**Acceptance Criteria:**

**Given** a call session has `issue_category` set and the caller opted into SMS
**When** `CoachingService.generatePlan(ctx, summary, issueCategory, guidanceType)` is called
**Then** it calls `claude-sonnet-4-20250514` via `@anthropic-ai/sdk` with a prompt that includes the call summary, issue category, and guidance preference
**And** the response is parsed as JSON matching: `{ title, category, wisdom_anchor, duration_days, steps: [{day, action, tip, scripture?}] }`
**And** for faith callers, each step may include a `scripture` field (Bible reference)
**And** for general callers, no scripture is included in steps; `wisdom_anchor` is a philosophical quote
**And** the plan is saved to `coaching_plans` table with `caller_id`, `session_id`, `category`, `title`, `steps`, `wisdom_anchor`
**And** if Anthropic API call fails, `getFallbackPlan()` returns a generic 7-step plan so SMS is still sent
**And** the entire generation + SMS delivery completes within 5 minutes of call end (NFR4)

**Files created:**
```
src/coaching/coaching.module.ts
src/coaching/coaching.service.ts
src/coaching/coaching.types.ts  (CoachingPlan, PlanStep interfaces)
```

---

### Story 7.3: Implement Post-Call SMS Delivery Pipeline

As the system,
I want the complete post-call pipeline to run automatically after every call ends,
So that consented callers receive their coaching plan SMS without any manual intervention.

**Acceptance Criteria:**

**Given** the `end-of-call-report` webhook fires
**When** `processPostCall()` runs via `setImmediate()`
**Then** it checks `call_sessions.issue_category` to determine if a plan was requested
**And** if yes and `was_crisis = false`: `CoachingService.generatePlan()` is called, plan is saved, `SmsService.send()` is called with `buildFollowUpSms(plan, callerName)` as the body
**And** the SMS body format is:
  ```
  UtalkWe Listen

  [name], here's your plan:
  "[wisdom_anchor]"

  Day 1: [first step action]
  [first step tip]

  [optional scripture]

  You've got this. Call anytime.
  ```
**And** `call_sessions.action_plan_id` is updated to the new plan's ID
**And** `call_sessions.follow_up_sent` is set to `true`
**And** if no plan was requested (tool not called), no SMS is sent and no plan is generated
**And** all errors in the pipeline are caught and logged — no error propagates to caller experience

---

## Epic 8: Data Persistence, Payments & Production Deployment

Every record is stored correctly. Stripe events update the right fields. The system is deployed to Railway and verified in production. This epic closes out all remaining data and infrastructure requirements.

**FRs covered:** FR48, FR49, FR50, FR51, FR52, FR53, FR54
**NFRs covered:** NFR6, NFR10, NFR17, NFR21

---

### Story 8.1: Validate Complete Data Persistence

As a developer,
I want to verify that every required field is stored correctly across all five tables after a full call flow,
So that caller history, session audit trails, and subscription records are complete and accurate.

**Acceptance Criteria:**

**Given** a complete test call flow is executed (call → conversation → plan → SMS)
**When** the Supabase tables are inspected
**Then** `callers` has: `phone` (E.164), `name` (if shared), `guidance_type`, `preferred_voice`, `call_count` (incremented), `subscription_tier`
**And** `call_sessions` has: `caller_id`, `vapi_call_id`, `started_at`, `ended_at`, `duration_seconds`, `issue_category`, `issue_summary`, `full_summary`, `wisdom_used` (array), `was_crisis` (bool), `action_plan_id`, `follow_up_sent`
**And** `coaching_plans` has: `caller_id`, `session_id`, `category`, `title`, `steps` (JSONB array), `wisdom_anchor`, `duration_days`, `is_active`
**And** `sms_log` has: `caller_id`, `phone`, `message_type`, `body`, `twilio_sid`, `sent_at`, `status`
**And** `subscriptions` has: `caller_id`, `stripe_subscription_id`, `stripe_customer_id`, `tier`, `status`, `current_period_end`
**And** no phone numbers appear in plaintext in application logs

---

### Story 8.2: Validate Stripe Subscription Lifecycle End-to-End

As a developer,
I want to verify that Stripe events correctly update caller subscription tiers through the complete lifecycle,
So that callers gain and lose access to paid features exactly when their payment status changes.

**Acceptance Criteria:**

**Given** a Stripe test mode webhook is configured pointing to the local ngrok tunnel
**When** a test `checkout.session.completed` event fires with `metadata.phone = '+12025551234'`
**Then** `callers.subscription_tier` updates to `'basic'` (or correct tier per price ID)
**And** `subscriptions` table has an active record with correct `stripe_subscription_id`

**Given** a `customer.subscription.deleted` event fires
**Then** `callers.subscription_tier` reverts to `'free'`
**And** `subscriptions.status` updates to `'canceled'`

**Given** an `invoice.payment_failed` event fires
**Then** `subscriptions.status` updates to `'past_due'`
**And** `callers.subscription_tier` does NOT change immediately (FR54 — access retained)

**Given** the next call attempt after `past_due`
**Then** `canAccessCall()` checks `subscription_tier` (still paid) and allows the call

---

### Story 8.3: Deploy to Railway and Verify Production

As a developer,
I want the application deployed to Railway with all environment variables configured and the health endpoint responding,
So that the phone number works in production and the system is ready for real callers.

**Acceptance Criteria:**

**Given** the GitHub repository is connected to Railway
**When** a push to `main` triggers a Railway deployment
**Then** the build completes successfully using Node.js 22
**And** `GET /health` at the Railway URL returns `{ status: 'ok', timestamp: '<ISO>' }` with HTTP 200
**And** all 15 environment variables are set in Railway dashboard (verified against `.env.example`)
**And** the Vapi webhook URL is updated to the Railway URL: `https://<app>.railway.app/vapi/webhook`
**And** the Stripe webhook URL is updated to: `https://<app>.railway.app/stripe/webhook`
**And** a live test call to the Twilio phone number results in Haven answering in under 2 seconds
**And** a returning caller test confirms memory is working — Haven references a previous issue
**And** Railway build file: `.railway.yaml` or `Procfile` with `web: node dist/main`

---

### Story 8.4: Implement End-to-End System Test

As a developer,
I want a documented end-to-end test script that validates the complete happy path and crisis path,
So that any deployment can be verified in under 10 minutes before going live.

**Acceptance Criteria:**

**Given** the production system is deployed
**When** the following test sequence is executed:
1. Call the Twilio number from a new phone — hear Haven's first-time greeting with AI disclosure
2. Say "I'm feeling stressed about money" — Haven responds with empathy then practical guidance
3. Say "Yes" when asked about the SMS plan — call ends with warm close
4. Receive SMS within 5 minutes with a 5-day money reset plan
5. Call again from the same number — Haven says "Welcome back" and references money stress
6. Say "I just don't see the point anymore" — Haven delivers 988 crisis response, ends call
7. Receive crisis SMS with 988 number only (no coaching plan)
8. Check Supabase: `callers.call_count = 2`, first session has `was_crisis = false`, second has `was_crisis = true`

**Then** all 8 steps pass without error
**And** total elapsed time for steps 1–8 is documented
**And** the test steps are saved as `docs/e2e-test-script.md`

**File created:** `docs/e2e-test-script.md`
