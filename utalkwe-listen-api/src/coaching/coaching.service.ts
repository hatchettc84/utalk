import Anthropic from '@anthropic-ai/sdk';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Caller, CallSession, GuidanceType } from '../callers/callers.types';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import type { CoachingPlan, CoachingPlanInput, PlanStep } from './coaching.types';

const COACHING_MODEL = 'claude-3-5-sonnet-20241022';

@Injectable()
export class CoachingService {
  private readonly logger = new Logger(CoachingService.name);
  private readonly anthropic: Anthropic;

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly config: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: config.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  // ─── Plan generation ─────────────────────────────────────────────────────────

  async generatePlan(
    caller: Pick<Caller, 'id' | 'name' | 'guidance_type'>,
    session: Pick<CallSession, 'id' | 'issue_category' | 'issue_summary' | 'caller_mood'>,
  ): Promise<CoachingPlan> {
    let planInput: CoachingPlanInput;

    try {
      planInput = await this.callAnthropicForPlan(caller, session);
    } catch (err) {
      this.logger.error('Anthropic API failed — using fallback plan', err);
      planInput = this.getFallbackPlan(session.issue_category, caller.guidance_type);
    }

    return this.savePlan(caller.id, session.id, planInput);
  }

  private async callAnthropicForPlan(
    caller: Pick<Caller, 'name' | 'guidance_type'>,
    session: Pick<CallSession, 'issue_category' | 'issue_summary' | 'caller_mood'>,
  ): Promise<CoachingPlanInput> {
    const isFaith = caller.guidance_type === 'faith';
    const prompt = this.buildPrompt(
      session.issue_category ?? 'general',
      session.issue_summary ?? 'The caller needed support.',
      session.caller_mood ?? 'not recorded',
      isFaith,
    );

    const response = await this.anthropic.messages.create({
      model: COACHING_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    return this.parseResponse(text, session.issue_category ?? 'general');
  }

  private buildPrompt(
    issueCategory: string,
    issueSummary: string,
    callerMood: string,
    isFaith: boolean,
  ): string {
    const scriptureRule = isFaith
      ? 'Include a relevant Bible reference and short quote in the "scripture" field of each step.'
      : 'Do NOT include a "scripture" field in any step.';
    const wisdomRule = isFaith
      ? 'A relevant scripture reference and short quote.'
      : 'A philosophical quote or practical anchor (no scripture).';

    return `You are generating a personalized 7-day coaching plan for someone who just completed a support call with Haven, an AI guidance service.

CALL CONTEXT:
- Issue category: ${issueCategory}
- Summary: ${issueSummary}
- Caller mood: ${callerMood}
- Guidance preference: ${isFaith ? 'faith-based' : 'general (secular)'}

Generate the plan as a JSON object matching this EXACT structure. Return ONLY the JSON — no explanation, no markdown:

{
  "title": "Brief, warm plan title (max 50 chars)",
  "category": "${issueCategory}",
  "wisdom_anchor": "${wisdomRule}",
  "duration_days": 7,
  "steps": [
    {
      "day": 1,
      "action": "Specific, achievable action (1-2 sentences)",
      "tip": "Encouragement or context for this action (1-2 sentences)"
    }
  ]
}

Rules:
- Generate exactly 7 steps (day 1 through 7)
- Actions must be concrete, specific, and achievable in a single day
- ${scriptureRule}
- Keep the tone warm, direct, and practical
- Return ONLY the JSON object`;
  }

  private parseResponse(text: string, issueCategory: string): CoachingPlanInput {
    const jsonMatch = /\{[\s\S]*\}/.exec(text);
    if (!jsonMatch) throw new Error('No JSON object found in Anthropic response');

    const parsed = JSON.parse(jsonMatch[0]) as CoachingPlanInput;

    if (!parsed.title || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      throw new Error('Invalid plan structure in Anthropic response');
    }

    return {
      title: parsed.title,
      category: parsed.category ?? issueCategory,
      wisdom_anchor: parsed.wisdom_anchor ?? '',
      duration_days: parsed.duration_days ?? 7,
      steps: parsed.steps,
    };
  }

  // ─── Fallback plan ───────────────────────────────────────────────────────────

  getFallbackPlan(issueCategory: string | null, guidanceType: GuidanceType | null): CoachingPlanInput {
    const category = issueCategory ?? 'general';
    const isFaith = guidanceType === 'faith';

    const steps: PlanStep[] = [
      {
        day: 1,
        action: 'Write down three things that are within your control right now.',
        tip: "Clarity often starts with knowing what's yours to hold and what you can release.",
        ...(isFaith && { scripture: 'Psalm 46:10 — "Be still, and know that I am God."' }),
      },
      {
        day: 2,
        action: 'Take a 10-minute walk outside — no phone, no music.',
        tip: 'Your body carries stress. Movement is one of the fastest ways to shift your state.',
        ...(isFaith && { scripture: 'Isaiah 40:31 — "They will walk and not be faint."' }),
      },
      {
        day: 3,
        action: 'Call or message one person who makes you feel safe.',
        tip: "You don't have to share everything. Showing up with people you trust is enough.",
        ...(isFaith && { scripture: 'Proverbs 17:17 — "A friend loves at all times."' }),
      },
      {
        day: 4,
        action: 'Identify one small task you have been avoiding and do only the first step.',
        tip: 'Avoidance drains energy. One small move forward shifts the momentum.',
        ...(isFaith && { scripture: 'Philippians 4:13 — "I can do all things through Christ who strengthens me."' }),
      },
      {
        day: 5,
        action: 'Spend 5 minutes writing about what you are grateful for — not what you should feel, what you actually feel.',
        tip: 'Gratitude is not pretending things are fine. It is finding what is real and good alongside what is hard.',
        ...(isFaith && { scripture: '1 Thessalonians 5:18 — "Give thanks in all circumstances."' }),
      },
      {
        day: 6,
        action: 'Set one boundary today — say no to one thing that costs you more than it gives.',
        tip: 'Protecting your energy is not selfish. It is necessary.',
        ...(isFaith && { scripture: 'Proverbs 4:23 — "Guard your heart, for everything you do flows from it."' }),
      },
      {
        day: 7,
        action: 'Reflect: what has shifted this week? Write one sentence about what you want to carry forward.',
        tip: 'Growth is not always visible in the moment. Naming it makes it real.',
        ...(isFaith && { scripture: 'Lamentations 3:22–23 — "His mercies are new every morning."' }),
      },
    ];

    return {
      title: 'Your 7-Day Grounding Plan',
      category,
      wisdom_anchor: isFaith
        ? 'Psalm 23:4 — "Even though I walk through the valley, I will fear no evil."'
        : '"You cannot calm the storm — but you can calm yourself, and the storm will pass."',
      duration_days: 7,
      steps,
    };
  }

  // ─── DB persistence ──────────────────────────────────────────────────────────

  private async savePlan(
    callerId: string,
    sessionId: string,
    plan: CoachingPlanInput,
  ): Promise<CoachingPlan> {
    const { data, error } = await this.supabase
      .from('coaching_plans')
      .insert({
        caller_id: callerId,
        session_id: sessionId,
        category: plan.category,
        title: plan.title,
        steps: plan.steps,
        wisdom_anchor: plan.wisdom_anchor,
        duration_days: plan.duration_days,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CoachingPlan;
  }

  // ─── SMS formatting ──────────────────────────────────────────────────────────

  buildFollowUpSms(plan: CoachingPlan, callerName: string | null = null): string {
    const firstStep = plan.steps[0];
    const lines = [
      'UtalkWe Listen',
      '',
      `${callerName ?? 'Friend'}, here's your plan:`,
      `"${plan.wisdom_anchor ?? 'You are stronger than you know.'}"`,
      '',
      `Day 1: ${firstStep?.action ?? 'Take one small step forward today.'}`,
      firstStep?.tip ?? '',
    ];

    if (firstStep?.scripture) {
      lines.push('', firstStep.scripture);
    }

    lines.push('', "You've got this. Call anytime.");
    return lines.join('\n');
  }
}
