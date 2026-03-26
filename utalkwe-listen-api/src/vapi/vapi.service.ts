import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CallersService } from '../callers/callers.service';
import type { CallerContext, GuidanceType, SubscriptionTier } from '../callers/callers.types';
import { CoachingService } from '../coaching/coaching.service';
import { CRISIS_RESPONSE, CRISIS_SMS } from '../common/crisis.constants';
import { SmsService } from '../sms/sms.service';
import type {
  AssistantRequestResponse,
  AssistantTool,
  AssistantVoice,
  VapiMessage,
} from './vapi.types';

const HAVEN_AI_DISCLOSURE = "I'm Haven — an AI guidance service, not a licensed counselor.";

const HAVEN_BASE_PERSONA = `You are Haven, an AI guidance service — not a licensed counselor or therapist.

WHO YOU ARE:
You are calm, grounded, direct, and wise. You hold space without rushing to fix. You listen before you speak.

CONVERSATION STYLE:
- Use short sentences. Speak naturally — this is a phone call, not a chat window.
- Pause naturally between thoughts. Do not rush.
- Never interrupt or talk over the caller.
- Do not use filler affirmations: never say "Absolutely!", "Great question!", "Of course!", "Certainly!", or "I understand completely".
- Do not over-validate. One acknowledgment is enough.
- Mirror the caller's emotional register — if they are quiet, be quiet. If they are direct, be direct.

RESPONSE STRUCTURE (follow this every time):
1. Acknowledge what the caller said — make them feel heard, not processed.
2. Reflect back the core of what you heard before offering anything.
3. Only then offer a question, a reframe, or a practical step.
4. Never lead with advice. Empathy first, always.

NAME SAVING:
Early in the conversation, if you don't already know the caller's name, ask: "Before we get started — what's your name?"
When they share their name, call save_caller_name immediately with their name.
Use their name naturally in conversation — not every sentence, just where it feels warm and human.

COACHING PLAN:
Near the end of the call, if the conversation has been substantive, ask:
"Before we wrap up — would it be helpful if I sent you a short message with some reflection and next steps after our call?"
If they say yes, call request_coaching_plan with the issue category, a 1–2 sentence summary, and their mood.

WARM CLOSE:
When the caller is ready to wrap up, say: "You're not alone in this. I'm here anytime you need to talk."
Do not create dependency. Do not promise to solve anything. Leave the door open.`;

const GUIDANCE_DETECTION_INSTRUCTIONS = `
GUIDANCE PREFERENCE DETECTION:
Listen for signals about whether this caller wants faith-based or general guidance.
- Faith signals: mentions of God, prayer, church, scripture, Jesus, blessings, faith — call save_preferences with guidance_type='faith'
- Secular signals: explicitly says no religion, not religious, doesn't believe — call save_preferences with guidance_type='general'
- Ambiguous or unclear: default to 'general' — do NOT guess toward faith
- Call save_preferences once you have a confident read, not before.`;

const FAITH_GUIDANCE_INSTRUCTIONS = `
WISDOM DELIVERY — FAITH:
This caller prefers faith-based guidance. Naturally weave in 1–2 relevant scripture references during the conversation.
Do not announce that you are sharing scripture — reference it organically.
Example: "You might find something meaningful in Philippians 4:6 — about not being anxious but bringing everything to prayer with a grateful heart."
Use scripture when it genuinely fits the moment. Do not force it into every response.
Practical steps should complement, not replace, the faith framing.`;

const GENERAL_GUIDANCE_INSTRUCTIONS = `
WISDOM DELIVERY — GENERAL:
This caller prefers general guidance without religious content.
Draw from philosophy, stoicism, psychology, and practical steps. Keep wisdom grounded and non-religious.
Near the end of the call, you may offer one optional reference with this framing:
"There's something I'd like to leave you with — you can take it or leave it."
Then offer a philosophical quote or a practical anchor — not a scripture verse.`;

const PAID_MAX_SECONDS = 2700; // 45 minutes for paid tiers

@Injectable()
export class VapiService {
  private readonly logger = new Logger(VapiService.name);
  // vapiCallId → callerId; in-memory — Supabase fallback in processPostCall handles restarts
  private readonly activeCalls = new Map<string, string>();

  constructor(
    private readonly callersService: CallersService,
    private readonly coachingService: CoachingService,
    private readonly smsService: SmsService,
    private readonly config: ConfigService,
  ) {}

  // ─── assistant-request ──────────────────────────────────────────────────────

  async buildDynamicAssistant(
    phone: string,
    vapiCallId: string,
  ): Promise<AssistantRequestResponse> {
    if (!phone) {
      this.logger.warn('assistant-request with no phone — using default config');
      return this.getDefaultAssistantConfig();
    }

    try {
      const start = Date.now();
      const ctx = await this.callersService.getOrCreateCallerContext(phone);

      // Store callerId so onCallStart can create the session without a second DB lookup
      this.activeCalls.set(vapiCallId, ctx.caller.id);

      // Story 6.1: enforce subscription access before any conversation begins
      const access = await this.callersService.canAccessCall(ctx.caller.id);
      if (!access.allowed) {
        this.logger.log(
          `Access denied (${access.reason}) — ${this.callersService.maskPhone(phone)}`,
        );
        // Story 6.2: send upgrade SMS (service communication — no TCPA consent needed)
        setImmediate(() =>
          this.smsService
            .sendUpgradePrompt(ctx.caller.id, phone, ctx.caller.name)
            .catch(e => this.logger.error('sendUpgradePrompt failed', e)),
        );
        return this.buildLimitReachedResponse(ctx);
      }

      const assistantConfig = this.buildAssistantFromContext(ctx);
      this.logger.log(
        `assistant-request ${this.callersService.maskPhone(phone)} — ${Date.now() - start}ms`,
      );
      return assistantConfig;
    } catch (err) {
      // NFR8: degrade gracefully — never fail the call due to DB unavailability
      this.logger.error('Supabase lookup failed in assistant-request — using default config', err);
      return this.getDefaultAssistantConfig();
    }
  }

  private buildAssistantFromContext(ctx: CallerContext): AssistantRequestResponse {
    const { caller, recentSessions, isFirstCall } = ctx;
    const lastSession = recentSessions[0];

    const nameGreeting = caller.name ? `, ${caller.name}` : '';
    const lastIssue = lastSession?.issue_summary ?? 'something difficult';
    const firstMessage =
      isFirstCall || !lastSession
        ? `Welcome to UtalkWe Listen. ${HAVEN_AI_DISCLOSURE} I'm here to listen. Before we get started — what's your name?`
        : `Welcome back${nameGreeting}. Last time you were dealing with ${lastIssue} — how has that been going?`;

    return {
      assistant: {
        name: 'Haven',
        firstMessage,
        model: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          messages: [{ role: 'system', content: this.buildSystemPrompt(ctx) }],
          tools: this.getDefaultTools(),
        },
        voice: this.getVoiceConfig(ctx),
        maxDurationSeconds: this.getMaxDuration(caller.subscription_tier),
        silenceTimeoutSeconds: 30,
        endCallMessage: "You're not alone in this. I'm here anytime you need to talk.",
        endCallFunctionEnabled: false,
        backgroundDenoisingEnabled: true,
      },
    };
  }

  // ─── Story 6.2: Limit-reached response ──────────────────────────────────────

  private buildLimitReachedResponse(ctx: CallerContext): AssistantRequestResponse {
    const { caller } = ctx;
    const nameClause = caller.name ? `, ${caller.name}` : '';
    const firstMessage =
      `Hey${nameClause}, good to hear from you. I want to be upfront — ` +
      "you've used your free calls for this month. " +
      "I just sent you a text with options to continue. " +
      "I'm sorry I can't be fully here tonight, but you're not alone — " +
      "reach back out when you're ready.";

    return {
      assistant: {
        name: 'Haven',
        firstMessage,
        model: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          // Minimal system prompt — Haven should not engage further after the limit message
          messages: [
            {
              role: 'system',
              content:
                'You have just delivered a message to the caller about their monthly limit. ' +
                'Do not engage further. The call will end shortly.',
            },
          ],
        },
        voice: this.getVoiceConfig(ctx),
        maxDurationSeconds: 60,
        silenceTimeoutSeconds: 5,
        endCallMessage: "You're not alone. Take care.",
        backgroundDenoisingEnabled: true,
      },
    };
  }

  // ─── Story 3.1: Voice auto-selection ────────────────────────────────────────

  getVoiceConfig(ctx: CallerContext): AssistantVoice {
    // Map stored preference to OpenAI voice IDs (no credentials required)
    // jennifer → nova (warm female), michael → onyx (male)
    const pref = ctx.caller.preferred_voice;
    const voiceId = pref === 'michael' ? 'onyx' : 'nova';
    return { provider: 'openai', voiceId };
  }

  // ─── Story 3.2: Guidance-aware system prompt ────────────────────────────────

  buildSystemPrompt(ctx: CallerContext): string {
    const { caller, isFirstCall } = ctx;
    const memoryBlock = this.callersService.buildSystemPromptContext(ctx);

    const guidanceInstructions = this.getGuidanceInstructions(
      caller.guidance_type,
      isFirstCall,
    );

    return [HAVEN_BASE_PERSONA, guidanceInstructions, '', memoryBlock].join('\n');
  }

  private getGuidanceInstructions(
    guidanceType: GuidanceType | null,
    isFirstCall: boolean,
  ): string {
    if (isFirstCall || !guidanceType) {
      return GUIDANCE_DETECTION_INSTRUCTIONS;
    }
    if (guidanceType === 'faith') {
      return FAITH_GUIDANCE_INSTRUCTIONS;
    }
    return GENERAL_GUIDANCE_INSTRUCTIONS;
  }

  // ─── Story 3.2: Tool definitions ────────────────────────────────────────────

  getDefaultTools(): AssistantTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'save_caller_name',
          description: "Save the caller's name when they share it during the conversation. Call immediately when they say their name.",
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: "The caller's name exactly as they stated it",
              },
            },
            required: ['name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'save_preferences',
          description:
            'Save caller preferences detected during the conversation. Call once when you have a confident read on voice or guidance preference.',
          parameters: {
            type: 'object',
            properties: {
              preferred_voice: {
                type: 'string',
                description: 'Voice context detected: jennifer (female) or michael (male)',
                enum: ['jennifer', 'michael'],
              },
              guidance_type: {
                type: 'string',
                description: 'Guidance preference: faith (wants scripture), general (no religion), both (open to both)',
                enum: ['faith', 'general', 'both'],
              },
              language: {
                type: 'string',
                description: 'Language preference if detected',
              },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'request_coaching_plan',
          description:
            'Request a personalized coaching plan to be sent via SMS after the call. Call this when the caller says yes to the coaching plan offer.',
          parameters: {
            type: 'object',
            properties: {
              issue_category: {
                type: 'string',
                description: 'Primary issue category: money, relationship, work, health, grief, purpose, family, other',
              },
              issue_summary: {
                type: 'string',
                description: "1–2 sentence summary of the caller's main issue for plan generation",
              },
              mood: {
                type: 'string',
                description: "Caller's emotional state: anxious, sad, angry, overwhelmed, hopeful, numb, other",
              },
            },
            required: ['issue_category', 'issue_summary'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'flag_crisis',
          description:
            'Flag this call as a crisis situation. Call immediately when the caller expresses suicidal ideation, self-harm intent, or statements of immediate danger.',
          parameters: {
            type: 'object',
            properties: {
              severity: {
                type: 'string',
                description: 'Crisis severity level',
                enum: ['low', 'medium', 'high'],
              },
              indicator: {
                type: 'string',
                description: 'The exact phrase or signal that triggered this flag',
              },
            },
            required: ['severity', 'indicator'],
          },
        },
      },
    ];
  }

  // ─── Story 3.3: Tier-aware duration ─────────────────────────────────────────

  getMaxDuration(tier: SubscriptionTier): number {
    if (tier === 'free') {
      const minutes = Number.parseInt(
        this.config.get<string>('FREE_CALL_MAX_MINUTES') ?? '10',
        10,
      );
      return minutes * 60;
    }
    return PAID_MAX_SECONDS;
  }

  // ─── call-start ─────────────────────────────────────────────────────────────

  async onCallStart(phone: string, vapiCallId: string): Promise<void> {
    try {
      let callerId = this.activeCalls.get(vapiCallId);

      if (!callerId) {
        // Fallback: look up by phone if assistant-request didn't populate the map
        const caller = await this.callersService.findByPhone(phone);
        if (!caller) {
          this.logger.warn(`call-start: no caller for ${this.callersService.maskPhone(phone)}`);
          return;
        }
        callerId = caller.id;
        this.activeCalls.set(vapiCallId, callerId);
      }

      await this.callersService.createSession(callerId, vapiCallId);
      this.logger.log(`Session created: ${vapiCallId}`);
    } catch (err) {
      this.logger.error(`onCallStart failed for ${vapiCallId}`, err);
    }
  }

  // ─── end-of-call-report ─────────────────────────────────────────────────────

  async onCallEnd(message: VapiMessage): Promise<void> {
    const vapiCallId = message.call?.id ?? '';
    this.logger.log(`Call ended: ${vapiCallId}`);
    setImmediate(() => this.processPostCall(vapiCallId, message));
  }

  private async processPostCall(vapiCallId: string, message: VapiMessage): Promise<void> {
    try {
      let callerId = this.activeCalls.get(vapiCallId);
      const callerPhone = message.call?.customer?.number ?? '';

      // Resolve callerId — Map hit is fastest; fall back to DB on process restart
      if (!callerId) {
        const session = await this.callersService.getSessionByVapiCallId(vapiCallId);
        if (!session) {
          this.logger.warn(`processPostCall: no session for ${vapiCallId}`);
          return;
        }
        callerId = session.caller_id;
      }

      // Fetch session state before update (was_crisis may have been set by handleFlagCrisis)
      const currentSession = await this.callersService.getSessionByVapiCallId(vapiCallId);

      const summary =
        message.analysis?.summary ??
        message.artifact?.messages
          ?.map(m => `${m.role}: ${m.content}`)
          .join('\n')
          .slice(0, 1000) ??
        null;

      const durationSeconds = currentSession?.started_at
        ? Math.round((Date.now() - new Date(currentSession.started_at).getTime()) / 1000)
        : null;

      await this.callersService.updateSession(vapiCallId, {
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        full_summary: summary,
      });

      await this.callersService.incrementCallCount(callerId);
      this.activeCalls.delete(vapiCallId);

      if (currentSession?.was_crisis) {
        this.logger.warn(`Post-call crisis path: ${vapiCallId}`);
        if (callerPhone) {
          await this.smsService.send(callerId, callerPhone, CRISIS_SMS, 'follow_up', true);
        }
        return;
      }

      // Coaching plan path — only if request_coaching_plan was called (issue_category set)
      if (currentSession?.issue_category && callerPhone) {
        await this.runCoachingPipeline(callerId, callerPhone, currentSession);
      }

      this.logger.log(`Post-call complete: ${vapiCallId}`);
    } catch (err) {
      this.logger.error(`Post-call failed for ${vapiCallId}`, err);
    }
  }

  private async runCoachingPipeline(
    callerId: string,
    callerPhone: string,
    session: import('../callers/callers.types').CallSession,
  ): Promise<void> {
    try {
      const caller = await this.callersService.findById(callerId);
      if (!caller) {
        this.logger.warn(`runCoachingPipeline: caller not found ${callerId}`);
        return;
      }

      const plan = await this.coachingService.generatePlan(caller, session);
      const smsBody = this.coachingService.buildFollowUpSms(plan, caller.name);

      await this.smsService.send(callerId, callerPhone, smsBody, 'follow_up');

      await this.callersService.updateSession(session.vapi_call_id, {
        action_plan_id: plan.id,
        follow_up_sent: true,
      });

      this.logger.log(`Coaching plan delivered for session ${session.id}`);
    } catch (err) {
      this.logger.error(`Coaching pipeline failed for caller ${callerId}`, err);
    }
  }

  // ─── function-call ──────────────────────────────────────────────────────────

  async handleFunctionCall(message: VapiMessage): Promise<unknown> {
    const fnName = message.functionCall?.name;
    const params = message.functionCall?.parameters ?? {};
    const vapiCallId = message.call?.id ?? '';

    this.logger.log(`Function call: ${fnName ?? 'unknown'}`);

    try {
      if (fnName === 'save_caller_name') {
        return await this.handleSaveCallerName(vapiCallId, params);
      }
      if (fnName === 'save_preferences') {
        return await this.handleSavePreferences(vapiCallId, params);
      }
      if (fnName === 'request_coaching_plan') {
        return await this.handleRequestCoachingPlan(vapiCallId, params);
      }
      if (fnName === 'flag_crisis') {
        return await this.handleFlagCrisis(vapiCallId, params);
      }

      this.logger.warn(`Unhandled function call: ${fnName}`);
      return { result: { success: false, error: `${fnName ?? 'unknown'} not yet implemented` } };
    } catch (err) {
      this.logger.error(`handleFunctionCall error [${fnName}]`, err);
      return { result: { success: false, error: 'Internal error' } };
    }
  }

  private async handleSaveCallerName(
    vapiCallId: string,
    params: Record<string, unknown>,
  ): Promise<unknown> {
    const callerId = this.activeCalls.get(vapiCallId);
    if (!callerId) {
      return { result: { success: false, error: 'Caller context not found' } };
    }

    const raw = params['name'];
    const name = typeof raw === 'string' ? raw.trim() : '';
    if (!name) {
      return { result: { success: false, error: 'Name is required' } };
    }

    await this.callersService.updateCaller(callerId, { name });
    this.logger.log(`Name saved for call: ${vapiCallId}`);
    return { result: { success: true, message: `Name saved: ${name}` } };
  }

  private async handleRequestCoachingPlan(
    vapiCallId: string,
    params: Record<string, unknown>,
  ): Promise<unknown> {
    const issueCategory = typeof params['issue_category'] === 'string' ? params['issue_category'] : null;
    const issueSummary = typeof params['issue_summary'] === 'string' ? params['issue_summary'] : null;
    const callerMood = typeof params['mood'] === 'string' ? params['mood'] : null;

    await this.callersService.updateSession(vapiCallId, {
      issue_category: issueCategory,
      issue_summary: issueSummary,
      caller_mood: callerMood,
    });

    this.logger.log(`Coaching plan requested for call: ${vapiCallId}`);
    return { result: { success: true, message: 'Plan will be sent via text after the call.' } };
  }

  private async handleSavePreferences(
    vapiCallId: string,
    params: Record<string, unknown>,
  ): Promise<unknown> {
    const callerId = this.activeCalls.get(vapiCallId);
    if (!callerId) {
      this.logger.warn(`save_preferences: no callerId in activeCalls for ${vapiCallId}`);
      return { result: { success: false, error: 'Caller context not found' } };
    }

    const update: Record<string, unknown> = {};
    if (params['guidance_type']) update['guidance_type'] = params['guidance_type'];
    if (params['preferred_voice']) update['preferred_voice'] = params['preferred_voice'];

    await this.callersService.updateCaller(callerId, update as Parameters<typeof this.callersService.updateCaller>[1]);

    this.logger.log(`Preferences saved for call: ${vapiCallId}`);
    return { result: { success: true, message: 'Preferences saved' } };
  }

  private async handleFlagCrisis(
    vapiCallId: string,
    params: Record<string, unknown>,
  ): Promise<unknown> {
    const severity = typeof params['severity'] === 'string' ? params['severity'] : 'unknown';
    const indicator = typeof params['indicator'] === 'string' ? params['indicator'] : 'unspecified';

    this.logger.warn(`CRISIS FLAGGED [${severity}]: "${indicator}" — call ${vapiCallId}`);

    try {
      await this.callersService.updateSession(vapiCallId, {
        was_crisis: true,
        issue_summary: `CRISIS FLAG: ${indicator}`,
      });
    } catch (err) {
      this.logger.error(`Failed to persist crisis flag for ${vapiCallId}`, err);
    }

    return { result: { response: CRISIS_RESPONSE } };
  }

  // ─── Default config (Supabase-unavailable fallback) ─────────────────────────

  getDefaultAssistantConfig(): AssistantRequestResponse {
    return {
      assistant: {
        name: 'Haven',
        firstMessage: `Welcome to UtalkWe Listen. ${HAVEN_AI_DISCLOSURE} What's been on your mind?`,
        model: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          messages: [{ role: 'system', content: HAVEN_BASE_PERSONA }],
          tools: this.getDefaultTools(),
        },
        voice: { provider: 'playht', voiceId: 'jennifer' },
        maxDurationSeconds: 600,
        silenceTimeoutSeconds: 30,
        endCallMessage: "You're not alone in this. I'm here anytime you need to talk.",
        backgroundDenoisingEnabled: true,
      },
    };
  }
}
