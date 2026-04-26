import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import type {
  AccessCheckResult,
  Caller,
  CallerContext,
  CallerUpdate,
  CallSession,
  SessionUpdate,
} from './callers.types';

@Injectable()
export class CallersService {
  private readonly logger = new Logger(CallersService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly config: ConfigService,
  ) {}

  // ─── Phone normalization & masking ───────────────────────────────────────────

  /**
   * Normalize phone to E.164 format: +1XXXXXXXXXX
   * Handles: +12125551234, 12125551234, 2125551234, (212) 555-1234
   */
  normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    if (phone.startsWith('+')) return phone;
    return `+${digits}`;
  }

  maskPhone(phone: string): string {
    if (phone.length < 7) return '***';
    return `${phone.slice(0, 3)}***${phone.slice(-4)}`;
  }

  // ─── Caller CRUD ────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Caller | null> {
    const { data, error } = await this.supabase
      .from('callers')
      .select('*')
      .eq('id', id)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    return data as Caller;
  }

  async findAffirmationOptedIn(): Promise<Caller[]> {
    const { data, error } = await this.supabase
      .from('callers')
      .select('*')
      .eq('daily_affirmation_opt_in', true);

    if (error) throw error;
    return (data ?? []) as Caller[];
  }

  async findByPhone(phone: string): Promise<Caller | null> {
    const normalized = this.normalizePhone(phone);
    const { data, error } = await this.supabase
      .from('callers')
      .select('*')
      .eq('phone', normalized)
      .single();

    if (error?.code === 'PGRST116') return null; // not found
    if (error) throw error;
    return data as Caller;
  }

  async createCaller(phone: string): Promise<Caller> {
    const normalized = this.normalizePhone(phone);
    const { data, error } = await this.supabase
      .from('callers')
      .insert({ phone: normalized })
      .select()
      .single();

    if (error) throw error;
    this.logger.log(`New caller created: ${this.maskPhone(phone)}`);
    return data as Caller;
  }

  async updateCaller(id: string, updates: CallerUpdate): Promise<Caller> {
    const { data, error } = await this.supabase
      .from('callers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Caller;
  }

  async incrementCallCount(callerId: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_call_count', {
      caller_id_input: callerId,
    });

    if (error) {
      // Fallback: manual increment if RPC not available
      const { data: caller, error: fetchErr } = await this.supabase
        .from('callers')
        .select('call_count')
        .eq('id', callerId)
        .single();

      if (fetchErr) throw fetchErr;

      const { error: updateErr } = await this.supabase
        .from('callers')
        .update({ call_count: (caller as { call_count: number }).call_count + 1 })
        .eq('id', callerId);

      if (updateErr) throw updateErr;
    }
  }

  // ─── Session CRUD ───────────────────────────────────────────────────────────

  async createSession(callerId: string, vapiCallId: string): Promise<CallSession> {
    const { data, error } = await this.supabase
      .from('call_sessions')
      .insert({ caller_id: callerId, vapi_call_id: vapiCallId })
      .select()
      .single();

    if (error) throw error;
    return data as CallSession;
  }

  async updateSession(vapiCallId: string, updates: SessionUpdate): Promise<void> {
    const { error } = await this.supabase
      .from('call_sessions')
      .update(updates)
      .eq('vapi_call_id', vapiCallId);

    if (error) throw error;
  }

  async getSessionByVapiCallId(vapiCallId: string): Promise<CallSession | null> {
    const { data, error } = await this.supabase
      .from('call_sessions')
      .select('*')
      .eq('vapi_call_id', vapiCallId)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    return data as CallSession;
  }

  async getRecentSessions(callerId: string, limit: number): Promise<CallSession[]> {
    const { data, error } = await this.supabase
      .from('call_sessions')
      .select('*')
      .eq('caller_id', callerId)
      .not('ended_at', 'is', null) // completed sessions only
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as CallSession[];
  }

  // ─── Context building ───────────────────────────────────────────────────────

  async getOrCreateCallerContext(phone: string): Promise<CallerContext> {
    const normalized = this.normalizePhone(phone);
    this.logger.log(`getOrCreateCallerContext: raw=${phone} normalized=${normalized}`);

    const existing = await this.findByPhone(normalized);
    const isFirstCall = existing === null;
    const caller: Caller = isFirstCall ? await this.createCaller(normalized) : existing;

    this.logger.log(
      `Caller ${isFirstCall ? 'CREATED' : 'FOUND'}: id=${caller.id} name=${caller.name ?? 'NONE'} callCount=${caller.call_count}`,
    );

    const recentSessions = isFirstCall
      ? []
      : await this.getRecentSessions(caller.id, 3);

    return { caller, recentSessions, isFirstCall };
  }

  buildSystemPromptContext(ctx: CallerContext): string {
    const { caller, recentSessions, isFirstCall } = ctx;
    const lastSession = recentSessions[0];

    const lines: string[] = [
      'CALLER PROFILE:',
      `- Phone: ${this.maskPhone(caller.phone)}`,
      `- Name: ${caller.name ?? 'not provided'}`,
      `- Guidance preference: ${caller.guidance_type ?? 'not set'}`,
      `- Subscription: ${caller.subscription_tier}`,
      `- Daily affirmations: ${caller.daily_affirmation_opt_in ? 'opted in' : 'not enrolled'}`,
      `- Total calls: ${caller.call_count}`,
    ];

    // Minutes balance context — only relevant for non-subscribers
    if (caller.subscription_tier === 'free') {
      lines.push(`- Minutes remaining: ${caller.minutes_balance}`);

      if (caller.minutes_balance > 0 && caller.minutes_balance <= 3) {
        lines.push(
          '',
          'LOW BALANCE: This caller has only a few minutes left. Near the end of the call, gently let them know they can grab more minutes — Haven will text them options when the call ends. Do not interrupt the conversation about it.',
        );
      }
    }

    if (!isFirstCall && lastSession) {
      lines.push(
        '',
        'RETURNING CALLER — You have spoken with this person before. USE this context:',
        `- Last issue: ${lastSession.issue_summary ?? 'not recorded'}`,
        `- Last session: ${(lastSession.full_summary ?? '').slice(0, 200)}`,
        `- Sessions on file: ${recentSessions.length}`,
      );

      if (recentSessions.length > 1) {
        const topics = recentSessions
          .map(s => s.issue_summary)
          .filter(Boolean)
          .slice(0, 3);
        if (topics.length > 0) {
          lines.push(`- Recent topics: ${topics.join('; ')}`);
        }
      }

      lines.push(
        '',
        'IMPORTANT: You know this caller. Greet them warmly by name. Reference their previous conversations.',
        'Do NOT ask their name again. Do NOT introduce yourself as if this is their first time.',
      );
    }

    return lines.join('\n');
  }

  // ─── Access control (prepaid minutes model) ─────────────────────────────────

  /**
   * Decision tree:
   *   1. Subscriber (tier !== 'free')                          → allow (unlimited)
   *   2. Non-subscriber with minutes_balance > 0               → allow (capped to balance)
   *   3. Non-subscriber with 0 balance                         → deny (no_minutes)
   */
  async canAccessCall(callerId: string): Promise<AccessCheckResult> {
    const { data: caller, error } = await this.supabase
      .from('callers')
      .select('subscription_tier, minutes_balance')
      .eq('id', callerId)
      .single();

    if (error) throw error;

    const row = caller as { subscription_tier: string; minutes_balance: number };
    const tier = row.subscription_tier as import('./callers.types').SubscriptionTier;
    const minutesBalance = row.minutes_balance ?? 0;

    if (tier !== 'free') {
      return { allowed: true, tier };
    }

    if (minutesBalance > 0) {
      return { allowed: true, tier: 'free', remainingMinutes: minutesBalance };
    }

    return { allowed: false, tier: 'free', reason: 'no_minutes', remainingMinutes: 0 };
  }

  // ─── Minutes balance management ─────────────────────────────────────────────

  /**
   * Deducts minutes from balance based on call duration in seconds.
   * Uses ceiling: a 61s call = 2 minutes deducted.
   * Floors at 0 — never goes negative.
   * Returns the new balance after deduction.
   */
  async deductMinutes(callerId: string, secondsUsed: number): Promise<number> {
    const { data, error } = await this.supabase.rpc('deduct_minutes', {
      caller_id_input: callerId,
      seconds_used: secondsUsed,
    });

    if (error) {
      this.logger.error(`deduct_minutes RPC failed for ${callerId}`, error);
      throw error;
    }

    const newBalance = typeof data === 'number' ? data : 0;
    this.logger.log(
      `deductMinutes: callerId=${callerId} seconds=${secondsUsed} newBalance=${newBalance}`,
    );
    return newBalance;
  }

  /**
   * Adds minutes to a caller's balance after a successful pack purchase.
   * Returns the new balance.
   */
  async addMinutes(callerId: string, minutesToAdd: number): Promise<number> {
    const { data, error } = await this.supabase.rpc('add_minutes', {
      caller_id_input: callerId,
      minutes_to_add: minutesToAdd,
    });

    if (error) {
      this.logger.error(`add_minutes RPC failed for ${callerId}`, error);
      throw error;
    }

    const newBalance = typeof data === 'number' ? data : 0;
    this.logger.log(
      `addMinutes: callerId=${callerId} added=${minutesToAdd} newBalance=${newBalance}`,
    );
    return newBalance;
  }
}
