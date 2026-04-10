---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
inputDocuments: [product-brief-utalkwe-listen.md, product-brief-utalkwe-listen-distillate.md]
workflowType: 'prd'
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: consumer_saas_voice
  domain: mental_wellness_emotional_support
  complexity: medium
  projectContext: greenfield
  innovationLevel: high
---

# Product Requirements Document - UtalkWe Listen

**Author:** Cornelius
**Date:** 2026-03-25

---

## Executive Summary

Millions of Americans carry real, daily pain — financial stress, relationship breakdown,
loneliness, lost purpose — and have nowhere to take it after 10pm. Therapy costs $150–$300
a session and takes weeks to access. Every AI wellness app requires a download, an account,
and resets memory between sessions. Crisis lines are for emergencies. The gap between
"I'm struggling" and "I need professional help" is enormous, and right now it is empty.

UtalkWe Listen fills that gap. It is a phone-based AI guidance service with a single
premise: you call a number, Haven answers. No app. No login. No friction. Haven is an AI
voice companion — calm, grounded, and wise — that listens without judgment, responds with
empathy before advice, and draws from faith, philosophy, and practical wisdom in proportion
to what each caller needs. Most importantly, Haven remembers. When you call back, Haven
knows your name, your history, and where you left off.

This is not a therapy product. It is not a crisis line. It is the emotional infrastructure
layer for the underserved American middle — the people who are struggling but not broken,
who have nobody safe to call right now, and for whom every existing solution was built for
someone else. UtalkWe Listen is built for them.

### Product Vision

To be the trusted presence millions of Americans reach for in their hardest moments —
accessible to anyone with a phone, remembering every caller, growing more valuable with
every conversation.

### Core Differentiators

**Zero friction access** — no app, no download, no account required. Anyone with a phone
can call. This opens demographics every competitor has structurally abandoned.

**Persistent memory** — Haven remembers callers across sessions using phone number as
identity. The first time you call back and hear your name and your situation referenced
naturally is the moment trust is built. No competitor has solved this at consumer scale.

**Wisdom that meets people where they are** — faith-based encouragement for those who
want it, philosophical wisdom for those who don't, practical steps for everyone. One
service that serves the devout, the skeptical, and everyone between without making any
of them feel like they are in the wrong room.

### The "Aha" Moment

A returning caller hears: *"Welcome back... last time you were dealing with the money
situation — how has that been going?"* Something remembered them. That is when Simone
tells five people about it.

### Business Model

Freemium subscription. Free tier: 3 calls/month, 10-minute cap — enough to build trust.
Basic tier: $19.99/month unlimited access. Premium tier: $39.99/month. VIP: $99/month.
Secondary revenue: qualified lead referral to founder's existing financial recovery
business from callers dealing with debt and tax situations.

---

## Success Criteria

### User Success

The moment of success for the primary caller is not completing an onboarding flow.
It is: saying something out loud that could not be said to anyone else, feeling heard
not handled, hanging up slightly less alone than when they called, and returning without
hesitation the next time something hard happens.

**Measurable signals:**
- Average call duration > 8 minutes (indicates real engagement, not immediate hang-ups)
- Return call rate ≥ 40% within 30 days per caller
- Post-call SMS open rate ≥ 60%
- "Did you feel heard?" response ≥ 80% yes within 90 days of launch

### Business Success

| Milestone | Target | Timeframe |
|-----------|--------|-----------|
| Active callers | 500 | Month 3 |
| Free → Paid conversion | 15% | Month 3 |
| Monthly Recurring Revenue | $8,000 | Month 6 |
| Qualified lead referrals to Green's Recovery | 20/month | Month 6 |
| Return call rate | ≥ 40% within 30 days | Ongoing |

### Technical Success

- Call answer latency < 2 seconds from dial to Haven's first word
- Memory injection latency < 1 second added to call setup (invisible to caller)
- Crisis detection trigger time < 3 seconds from keyword utterance
- SMS delivery rate ≥ 98% within 5 minutes of call end
- System uptime ≥ 99.5% (callers dial at 11pm — the service must be there)

### North Star Metric

*"Would you call Haven again when you're going through something?"*
**Target: 80%+ yes within 90 days of first call.**

---

## User Journeys

### Journey 1 — Simone: First Call (Primary Happy Path)

*10:52pm. Simone has been sitting in her car in the driveway for eleven minutes. Kids are
asleep. She found the number from a friend's Instagram story. She almost didn't call.*

She dials. Haven answers within 2 seconds — warm, unhurried: *"Welcome to UtalkWe Listen.
I'm Haven — an AI guidance service, not a licensed counselor. I'm here to listen. What's
been on your mind?"*

The disclaimer landed before Simone could feel deceived. The question didn't ask her to
categorize herself. She starts talking — about the check engine light, really about the
money, really about feeling like she can't catch up no matter what she does.

Haven doesn't interrupt. Doesn't offer a solution list. Says: *"That sounds exhausting —
not just the money, but the feeling that there's no margin for anything to go wrong."*
That one sentence is the whole call. Simone exhales.

Haven asks what's weighing heaviest. They work through it — practical steps surface
naturally. Near the end Haven says: *"There's something I'd like to leave you with — you
can take it or leave it. Proverbs 3:5 talks about not leaning only on your own
understanding. Tonight might be a night to let some of that weight go."*

*"Before we wrap up — would it be helpful if I sent you a short message with some
reflection and next steps after our call?"* Simone says yes.

Haven closes: *"You're not alone in this. I'm here anytime."*

Within 5 minutes, a text arrives. A 5-day money reset plan. One verse. One step for
tomorrow. She screenshots it.

**Requirements revealed:** phone-number identity, AI disclosure hardcoded, voice
auto-selection, open conversation handling, faith preference detection, explicit SMS
opt-in capture, post-call coaching plan generation, call_sessions record.

### Journey 2 — Simone: Return Call (Memory Is the Product)

*Three weeks later. A different problem, same exhaustion.*

She dials the same number. Haven: *"Welcome back, Simone. Last time you were dealing
with a lot of financial pressure — I hope some of that has eased. What's going on
tonight?"*

She didn't have to explain herself from the beginning. Being remembered is worth more
than any feature on the roadmap. The conversation starts three levels deeper than it
would with a stranger. Haven already knows her guidance preference, her name, that she
responds to practical steps with a faith frame.

**Requirements revealed:** phone lookup at call START before first word (assistant-request
webhook), caller history injected into system prompt, return caller greeting variant,
call_count increment on session close.

### Journey 3 — Marcus: The Skeptic Test

*7:15pm. Marcus is in his truck. He's going to give this 30 seconds.*

Haven answers. Male voice — context: caller tone + topic signals financial/relationship.
Marcus says: *"Yeah, I just wanted to see what this was."*

Haven doesn't flinch: *"That's fair. I'm Haven — a guidance service, not a therapist.
What's on your mind? No pressure."*

The low-pressure response disarms him. Direct framing, practical acknowledgment, no
feelings-first language. Twenty minutes later Marcus is still on the call. He doesn't
opt into the SMS. That's fine.

**Requirements revealed:** voice auto-selection by context not by asking, graceful SMS
decline path, tone calibration — no forced softness regardless of caller profile.

### Journey 4 — Free Tier Limit Reached

*Simone's fourth call this month.*

Haven answers differently: *"Hey Simone, good to hear from you. I want to be upfront —
you've used your free calls for this month. I just sent you a text with options to
continue. I'm sorry I can't be fully here tonight, but you're not alone — reach back
out when you're ready."*

SMS arrives immediately: upgrade options, pricing, direct Stripe link.

**Requirements revealed:** monthly call count check at call START, soft limit response
with warm acknowledgment, upgrade SMS auto-sent on limit trigger, Stripe checkout link
pre-populated with caller phone number.

### Journey 5 — Crisis Signal Detected

*A caller mid-conversation says: "I just don't see the point anymore. I've been thinking
about not being here."*

Haven pauses. Does not continue the coaching flow. Does not probe for severity.

*"I hear you. What you're feeling right now matters more than anything else. I want to
make sure you have the right support — please reach out to 988. They're there
specifically for times like this and they will pick up. Can I stay with you for a moment
while you decide to call?"*

**Requirements revealed:** Layer 1 keyword match triggers immediately (< 1 second),
Layer 2 semantic analysis runs in parallel, crisis protocol hardcoded and not overridable,
flag_crisis tool call logs to was_crisis = true, no coaching plan generated, post-call
SMS sends 988 number only, internal crisis alert logged for review.

### Journey Requirements Summary

| Capability | Source |
|------------|--------|
| Phone-number-as-identity, no login required | J1, J2 |
| AI disclosure — first sentence, hardcoded, every call | J1 |
| Memory injection via webhook before call starts | J2 |
| Voice auto-selection by caller context | J1, J3 |
| Open conversation — no IVR script | J1, J3 |
| Faith/general preference detection and branching | J1, J2 |
| SMS opt-in capture with consent timestamp | J1 |
| Post-call coaching plan via AI generation | J1 |
| Return caller recognition and history injection | J2 |
| Monthly call count gating at call start | J4 |
| Upgrade SMS with Stripe checkout link | J4 |
| Hardcoded crisis protocol and 988 redirect | J5 |
| Crisis flag logging and internal alert | J5 |
| Tone calibration — no forced softness | J3 |

---

## Domain-Specific Requirements

UtalkWe Listen operates in the mental wellness and emotional support domain — adjacent to
healthcare but not clinical. No FDA pathway applies. No HIPAA obligation exists because
no medical records are created or stored. However, three compliance areas are non-negotiable
and must be treated as foundational constraints, not afterthoughts.

### Compliance and Regulatory

**AI Disclosure (State Law)**
Multiple US states require disclosure that a caller is speaking to an AI within the
opening of every interaction. This requirement is hardcoded — not configurable, not
dependent on caller preference, not something a system prompt can override.

- Requirement: Haven identifies itself as an AI in the first sentence of every call,
  every time, without exception
- Wording must be clear: "I'm Haven — an AI guidance service, not a licensed counselor"
- Applies to first calls and return calls equally
- Must appear in Terms of Service, website, and all ad creative

**TCPA Compliance (SMS)**
The Telephone Consumer Protection Act governs unsolicited text messages. Sending an SMS
to a caller without explicit verbal consent during the call is a TCPA violation and
carries class-action exposure.

- Requirement: Haven must ask for explicit verbal consent before any SMS is sent
- Exact ask: "Before we wrap up — would it be helpful if I sent you a short message
  with some reflection and next steps after our call?"
- Consent must be logged with caller ID and timestamp in sms_log table
- No consent = no SMS sent, no exceptions
- The upgrade SMS sent on free-tier limit is triggered by the service, not the call —
  this must be reviewed for TCPA compliance separately (recommend opt-in at first call
  for "service communications" as a distinct consent category)

**Not Therapy — Clear Boundary**
UtalkWe Listen is a guidance and support service. This boundary must be maintained
consistently across every surface.

- Requirement: Disclaimer appears in call opening, Terms of Service, website footer,
  and all advertising creative
- Haven must never represent itself as a therapist, counselor, or clinical service
- Haven must never diagnose, prescribe, or make clinical assessments

### Crisis Protocol

This is the single most important safety requirement in the product. It is hardcoded
architecture, not a feature.

**Trigger Mechanism (Layered)**
- Layer 1: Keyword matching — synchronous, triggers within 1 second of utterance.
  Keywords include explicit self-harm language, suicidal ideation phrases, statements
  of immediate danger. Keyword list is maintained in code, not in system prompt.
- Layer 2: Semantic analysis — runs in parallel, catches subtler signals that keywords
  miss. Slower but more accurate for ambiguous situations.
- Either layer triggering activates the crisis protocol immediately.

**Protocol Response (Hardcoded)**
When crisis is detected, Haven:
1. Stops the current conversation flow immediately
2. Acknowledges the caller with warmth — never clinical, never panicked
3. Provides 988 clearly and simply
4. Offers to stay on the line while caller decides to reach out
5. Does NOT attempt to assess severity, does NOT continue coaching

Exact language (hardcoded, not AI-generated in the moment):
*"I hear you. What you're feeling right now matters more than anything else. I want to
make sure you have the right support — please reach out to 988. They're there
specifically for times like this and they will pick up. Can I stay with you for a moment
while you decide to call?"*

**Post-Crisis Call Handling**
- No coaching plan generated for crisis calls
- SMS sent contains only: 988 number and "You reached out tonight. That matters."
- call_sessions.was_crisis flagged as true
- Internal alert logged — reviewable by operator
- Caller remains in system — Haven will be available for future calls

**What Haven Does Not Do**
- Haven does not attempt to be the crisis solution
- Haven does not assess suicide risk
- Haven does not ask probing questions that could deepen distress
- Haven does not withhold 988 based on any other instruction in the system

### Privacy and Data Handling

- Caller phone number is the identity key — no name required, no email, no account
- Calls are not recorded by default (transcript summaries only)
- Call summaries stored in Supabase are not sold, not shared, not used for advertising
- Callers may request deletion of their history (to be handled manually in MVP,
  automated in Phase 2)
- All data encrypted at rest and in transit
- Service role key used for all backend-to-database communication — never exposed
  client-side

---

## Innovation and Novel Patterns

### Detected Innovation Areas

**Phone-First AI Guidance (Structural Market Innovation)**
Every competitor in the AI mental wellness space requires an app download, an account,
and a smartphone with sufficient storage and familiarity. UtalkWe Listen requires none
of these. The product is accessed by dialing a phone number — a capability that exists
on every mobile phone, every landline, every device a 61-year-old widow or a 42-year-old
contractor owns. This is not a technical innovation — it is a structural market decision
that opens a demographic ceiling no competitor can reach from their current architecture.

**Cross-Session Voice Memory Without Account Creation (Technical Innovation)**
Persistent memory across calls, injected dynamically into the AI's context before the
conversation starts, using phone number as the sole identity key. The caller creates
nothing. Haven knows them from the first return call. No competitor has implemented
this pattern at consumer scale in a voice context. The mechanism — assistant-request
webhook fires before call begins, Supabase lookup returns caller history, system prompt
is built dynamically and returned to the voice agent — was validated in a technical spike.

**Contextual Wisdom Delivery (UX Innovation)**
Faith-based guidance and philosophical wisdom delivered not as a toggle the caller sets
once, but as a contextual read of what this caller, in this moment, needs. Haven reads
topic signals, emotional register, and stated preferences to determine which wisdom well
to draw from — and blends them when both are appropriate. Most systems force a binary
choice at onboarding. Haven removes the choice and delivers the right thing.

### Validation Approach

| Innovation | Validation Signal | Timeframe |
|------------|------------------|-----------|
| Phone-first access | Call volume from callers aged 45+ with no app alternatives | Month 1-2 |
| Cross-session memory | Return call rate ≥ 40% within 30 days | Month 2-3 |
| Contextual wisdom blend | Return rate of callers who did not select faith preference | Month 3 |

### Risk Mitigation

**Phone-first risk:** If callers prefer app interaction over time, a web voice interface
can be added in Phase 2 without changing the core architecture. The phone number remains.

**Memory risk:** Latency in Supabase lookup must remain under 1 second or the memory
injection is perceptible as a delay before Haven speaks. This is a hard performance
requirement, not a nice-to-have.

**Wisdom blend risk:** If the contextual detection is wrong — faith content delivered
to a secular caller — trust is broken in that moment. The system must default to general
when signal is ambiguous, not guess toward faith.

---

## Consumer Voice SaaS — Specific Requirements

### Service Architecture Overview

UtalkWe Listen is a **consumer-facing voice SaaS** delivered exclusively through inbound
phone calls. There is no user interface, no mobile app, no web portal in MVP. The product
IS the phone call. Every other component — webhooks, databases, SMS, payments — exists
to make that call better.

### Identity and Authentication

**Identity model:** Phone number is the sole identity key. No username, no email, no
password, no OAuth. A caller's history, preferences, and subscription status are all
keyed to their E.164-formatted phone number (e.g., +12025551234).

**Authentication:** Not applicable for callers — Haven answers anyone who calls. Caller
identity is established by Twilio passing the caller's number to the webhook; this is
trusted at the infrastructure level. The operator dashboard (Phase 2) will require
standard authentication.

**Privacy implication:** A shared phone (family landline, borrowed device) will surface
another person's history. This is a known edge case, acceptable for MVP. Mitigation in
Phase 2: optional PIN entry.

### Subscription Model

**Tier structure:**

| Tier | Price | Call Limit | Call Duration Cap | SMS Plan |
|------|-------|------------|-------------------|----------|
| Free | $0 | 3/month | 10 minutes | Opt-in, post-call only |
| Basic | $19.99/month | Unlimited | 45 minutes | Opt-in, post-call only |
| Premium | $39.99/month | Unlimited | 45 minutes | Opt-in + daily wisdom texts |
| VIP | $99/month | Unlimited | 45 minutes | Full coaching cadence |

**Gating logic:** Tier check happens at call START via assistant-request webhook. Free
callers who have exhausted their monthly allocation receive the soft-limit response and
upgrade SMS. The current call does not complete — Haven answers, delivers the message,
and ends. This is the only scenario where a call does not reach full conversation.

**Stripe integration:** Subscription management handled entirely by Stripe. Webhook
events drive Supabase caller record updates. No subscription logic lives in the app layer.

### Concurrent Call Capacity

Vapi handles concurrent call management. The system must support a minimum of 50
concurrent calls in MVP (estimated peak for 500 active callers at ~10% simultaneous
usage). Capacity scales with Vapi plan tier — no custom infrastructure required.

### Integration Dependencies

| Integration | Purpose | Failure Mode |
|-------------|---------|--------------|
| Twilio | Phone number, call routing, SMS delivery | Critical — no calls without it |
| Vapi | AI voice agent, webhook orchestration | Critical — no calls without it |
| Supabase | Caller memory, session storage, subscriptions | Critical — degrades to no-memory mode |
| Anthropic API | Post-call coaching plan generation | Non-critical — call completes, SMS delayed |
| Stripe | Subscription management | Non-critical — existing subs honored, new blocked |

**Degradation strategy:** If Supabase lookup fails at call start, Haven falls back to
treating the caller as first-time. Call completes normally. Memory is not persisted for
the session. This is preferable to call failure.

### Operator Requirements

In MVP, Cornelius is the sole operator. No operator dashboard is built. Monitoring is:
- Supabase table direct access for caller and session review
- Crisis alert logs reviewed manually
- Stripe dashboard for subscription and revenue monitoring

Phase 2: Lightweight operator dashboard for call summaries, crisis flag review, and
caller management.

---

## Project Scoping and Phased Development

### MVP Strategy

**MVP Philosophy:** Experience MVP — the goal is not to prove revenue (though that
follows), it is to prove the core emotional value proposition: that Haven can make a
caller feel genuinely heard, and that being remembered on a return call creates a
relationship. If those two things are true, everything else follows.

**Resource model:** Solo founder + AI-assisted development. NestJS backend, Supabase,
Vapi, Twilio, Stripe — all managed services. No DevOps team required at launch.

**Launch target:** US market only, English only, single toll-free number.

### MVP Feature Set (Phase 1)

**Core caller journeys supported:**
- First-time caller — welcomed, guided through preference, heard and responded to
- Returning caller — recognized, context resumed, relationship deepened
- Free-tier limit reached — warmly informed, SMS with upgrade link sent
- Crisis signal detected — 988 provided, offer to stay on line, call ends
- SMS opt-in accepted — coaching plan generated and delivered within 5 minutes
- SMS opt-in declined — call ends gracefully, no SMS sent

**Must-have capabilities:**
- Single US toll-free phone number
- Haven AI voice agent — English language only
- Persistent caller memory keyed to phone number
- Voice auto-selection by caller context (no caller choice)
- Faith/general guidance preference — set on first call, stored, applied to all future calls
- Wisdom blend: faith (scripture), philosophy, practical steps — contextually delivered
- Post-call SMS coaching plan with explicit opt-in only (TCPA compliant)
- Coaching plan generated by AI from call summary
- Free tier: 3 calls/month, 10-minute cap
- Basic subscription: $19.99/month, unlimited calls, 45-minute cap
- Stripe subscription management (webhook-driven)
- Layered crisis detection — keyword + semantic
- Hardcoded 988 redirect and crisis protocol
- AI disclosure in first sentence of every call, hardcoded
- Caller data: callers, call_sessions, coaching_plans, sms_log, subscriptions tables

**Explicitly NOT in MVP (hard boundary):**
- Canadian or international phone numbers
- French or Spanish language support
- Premium tier ($39.99) or VIP tier ($99)
- Human agent escalation
- Caller-facing web dashboard or mobile app
- Outbound check-in calls from Haven
- Caller-selectable voice gender
- Church or community organization partnership portal
- Business lead routing to Green's Recovery (requires separate opt-in mechanism)
- Daily wisdom SMS cadence (Premium feature)
- Operator dashboard
- Automated caller data deletion requests
- Optional PIN for shared phone privacy

### Growth Features (Phase 2 — Post-MVP)

- Canadian toll-free number + French language support (Vapi multilingual)
- Premium tier ($39.99): daily wisdom SMS cadence
- VIP tier ($99): priority access + weekly personalized coaching plan
- Business lead opt-in: callers dealing with debt/tax situations offered referral
  to Green's Recovery with explicit consent
- Church partnership program: referral card system, informal operator onboarding
- Caller-facing web dashboard: call history, active plan, subscription management
- Operator dashboard: session review, crisis flag monitor, caller management
- Optional PIN entry for shared-phone privacy
- Automated GDPR/CCPA-style data deletion request handling

### Vision (Phase 3 — Expansion)

- Multi-market: UK, Caribbean, Spanish-language US
- Haven Network: Haven for Men, Haven en Español, Haven Faith Edition — specialized
  personas sharing the same memory and subscription infrastructure
- Institutional partnerships: churches, community health centers, employer benefits
- WhatsApp and web voice access for callers without US phone numbers
- UtalkWe Listen as a platform: other service businesses can route warm leads from
  Haven conversations with caller consent

### Risk Mitigation

**Technical risk:** Memory injection latency is the single biggest technical risk.
Mitigation: Supabase connection pooling, lightweight query (single row lookup by phone),
graceful degradation to first-time mode if lookup fails.

**Market risk:** Free tier may attract callers who never convert. Mitigation: 3-call
monthly cap creates genuine scarcity; quality of experience drives upgrade more than
paywall pressure.

**Regulatory risk:** AI disclosure laws are evolving. Mitigation: disclosure is
hardcoded in first sentence — overcomplies with current requirements in all states.
Legal review recommended before launch in CA, TX, IL.

---

## Functional Requirements

This section is the capability contract for UtalkWe Listen. Every capability listed here
will be designed, architected, and built. Any capability not listed here will not exist
in the product unless this document is updated. UX design, architecture, and epic
breakdown all trace back to this list.

### Call Handling

- FR1: The system can receive inbound phone calls on a US toll-free number 24 hours a
  day, 7 days a week, without human intervention
- FR2: The system answers every call within 2 seconds of connection
- FR3: The system can handle a minimum of 50 concurrent inbound calls
- FR4: The system delivers an AI disclosure statement as the first sentence of every
  call, every time, without exception
- FR5: The system gracefully ends a call if silence persists for 30 seconds with no
  caller response
- FR6: The system enforces a maximum call duration of 10 minutes for free-tier callers
  and 45 minutes for paid-tier callers

### Caller Identity and Memory

- FR7: The system identifies each caller by their E.164-formatted phone number with no
  account creation required
- FR8: The system looks up a caller's profile and session history before the first word
  of every call
- FR9: The system creates a new caller profile automatically on the first call from any
  phone number
- FR10: The system stores caller name, guidance preference, voice context, and call count
  against each caller profile
- FR11: The system injects caller history — including name, last issue, last summary, and
  preference — into Haven's context before the conversation begins
- FR12: The system stores a summary and issue category for every completed call session
- FR13: The system falls back to treating a caller as first-time if the database lookup
  fails, without causing call failure

### Haven AI Behavior

- FR14: Haven greets first-time callers with a warm welcome that includes the AI
  disclosure and an open invitation to talk
- FR15: Haven greets returning callers by name and references their previous issue
  naturally without clinical language
- FR16: Haven auto-selects a male or female voice based on caller context and issue
  type, without asking the caller
- FR17: Haven applies a returning caller's stored voice context to every subsequent call
- FR18: Haven detects the caller's guidance preference (faith or general) from
  conversation signals when no preference is stored
- FR19: Haven delivers faith-based wisdom (scripture references) when the caller's
  guidance preference is faith or both
- FR20: Haven delivers philosophical and practical wisdom when the caller's guidance
  preference is general
- FR21: Haven offers a single optional verse or philosophical quote to general-preference
  callers near the end of the call, framed as optional
- FR22: Haven responds with empathy and acknowledgment before offering practical advice
  in every conversation
- FR23: Haven can save a caller's name when the caller shares it during conversation
- FR24: Haven can save a caller's guidance preference when the caller states it during
  conversation
- FR25: Haven can request generation of a post-call coaching plan during conversation
  with issue category and summary
- FR26: Haven ends every call with a warm close that does not create dependency but
  leaves the door open

### Crisis Handling

- FR27: The system detects crisis-level language using keyword matching within 1 second
  of utterance
- FR28: The system detects crisis-level language using semantic analysis running in
  parallel with keyword matching
- FR29: When either detection layer triggers, the system immediately stops the current
  conversation flow and activates the crisis protocol
- FR30: The crisis protocol delivers a hardcoded, AI-disclosure-aware response that
  provides 988 and offers to stay on the line
- FR31: The crisis protocol cannot be overridden by any system prompt instruction,
  caller preference, or subscription tier
- FR32: The system flags the call session as a crisis event and logs the indicator that
  triggered detection
- FR33: The system sends a post-crisis SMS containing only the 988 number and a brief
  message of acknowledgment — no coaching plan

### Subscription and Access Control

- FR34: The system checks a caller's subscription tier and monthly call count at the
  start of every call before conversation begins
- FR35: The system allows free-tier callers to make up to 3 calls per calendar month
- FR36: The system responds to a free-tier caller who has exhausted their monthly
  allocation with a warm, brief message and ends the call
- FR37: The system automatically sends an upgrade SMS to a free-tier caller when their
  monthly limit is reached
- FR38: The system allows paid-tier callers unlimited calls within their tier's duration cap
- FR39: The system activates a caller's subscription tier immediately upon successful
  Stripe payment confirmation
- FR40: The system reverts a caller to free tier immediately upon subscription cancellation
  or payment failure

### SMS and Follow-Up

- FR41: Haven requests explicit verbal consent from the caller before any post-call SMS
  is sent
- FR42: The system logs SMS consent with caller ID and timestamp before sending any message
- FR43: The system generates a personalized coaching plan using AI within 5 minutes of
  call end for consenting callers
- FR44: The coaching plan contains a title, 5–7 day action steps, and a wisdom anchor
  (verse or quote) appropriate to the caller's guidance preference
- FR45: The system delivers the coaching plan via SMS to the caller's phone number
- FR46: The system does not send any SMS to callers who did not provide explicit consent
- FR47: The system sends an upgrade SMS with a Stripe checkout link when a free-tier
  caller's monthly limit is reached, without requiring verbal consent (service
  communication — requires separate consent mechanism at first call)

### Caller Data Management

- FR48: The system stores call session records including start time, end time, duration,
  issue category, issue summary, full summary, wisdom used, and crisis flag
- FR49: The system stores SMS log records including message type, body, delivery status,
  and Twilio message ID
- FR50: The system stores subscription records mirroring Stripe subscription state
  including tier, status, and period end date
- FR51: The system increments a caller's call count on every completed session

### Payment Integration

- FR52: The system creates or updates a caller's subscription record on successful Stripe
  checkout completion
- FR53: The system updates a caller's subscription status on Stripe subscription update
  events including renewals, plan changes, and cancellations
- FR54: The system marks a caller's subscription as past due on Stripe payment failure
  without immediately revoking access

---

## Non-Functional Requirements

### Performance

- NFR1: Call answer latency — Haven must speak its first word within 2 seconds of call
  connection, measured from Twilio connecting the call to Vapi delivering audio
- NFR2: Memory injection latency — the Supabase caller lookup and system prompt
  construction must complete within 1 second, contributing no perceptible delay to NFR1
- NFR3: Crisis detection latency — Layer 1 keyword match must trigger within 1 second
  of the crisis phrase being spoken; Layer 2 semantic analysis must complete within
  3 seconds and may refine the Layer 1 assessment
- NFR4: Coaching plan generation — AI-generated coaching plan must be created and SMS
  delivered within 5 minutes of call end for opted-in callers
- NFR5: SMS delivery — Twilio SMS must deliver within 5 minutes of dispatch with ≥ 98%
  delivery rate

### Reliability

- NFR6: System uptime — ≥ 99.5% monthly uptime for the inbound call path. Planned
  maintenance windows must occur between 3am–5am EST and must not exceed 2 hours per month
- NFR7: Call failure rate — < 1% of calls may fail to connect due to system error
  (excludes carrier-side failures outside system control)
- NFR8: Database degradation — if Supabase is unavailable, calls must still complete in
  first-time mode; no call may fail solely due to database unavailability
- NFR9: Webhook reliability — Vapi webhook failures must be retried up to 3 times before
  logging a failure; no call data may be silently lost

### Security

- NFR10: Data encryption — all caller data must be encrypted at rest in Supabase and
  in transit via TLS 1.2 or higher for all API communications
- NFR11: Service role key — the Supabase service role key must never be exposed in
  client-side code, logs, or responses; all database access is server-side only
- NFR12: Webhook verification — all inbound Vapi webhooks must be verified against the
  configured webhook secret before processing; unverified requests must be rejected with
  a 401 response
- NFR13: Stripe webhook verification — all Stripe webhook events must be verified using
  the Stripe webhook signing secret before any subscription state is updated
- NFR14: Phone number handling — caller phone numbers must never be logged in plaintext
  in application logs; only hashed or masked representations may appear in logs

### Scalability

- NFR15: Concurrent calls — the system must support 50 concurrent active calls at MVP
  launch, scaling to 200 concurrent calls without architectural changes by Month 6
- NFR16: Database connection pooling — Supabase queries must use connection pooling
  to support concurrent call volume without connection exhaustion
- NFR17: Stateless webhook handler — the NestJS webhook handler must be stateless
  (no in-memory session state between requests) to support horizontal scaling

### Compliance

- NFR18: AI disclosure — the AI disclosure statement must appear as the first sentence
  of every call, every time; this behavior must be verified by automated test before
  every production deployment
- NFR19: TCPA SMS — no SMS may be sent to a caller without a logged consent record;
  the sms_log insert must fail rather than send without consent
- NFR20: Crisis protocol immutability — the crisis detection keyword list and protocol
  response must be defined in application code, not in any configurable system prompt
  or database record; they must not be modifiable without a code deployment
- NFR21: Data retention — caller session data must be retained for a minimum of 12
  months to support caller continuity; deletion requests must be honored within 30 days
