import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageLayout } from '../components/LegalPageLayout'

export const metadata: Metadata = {
  title: 'SMS Opt-In Disclosure — UtalkWe Listen',
  description:
    'How callers opt in to receive text messages from UtalkWe Listen, what we send, message frequency, and how to opt out.',
}

const LAST_UPDATED = 'June 2, 2026'

export default function SmsDisclosurePage() {
  return (
    <LegalPageLayout title="SMS Opt-In Disclosure" lastUpdated={LAST_UPDATED}>
      <p>
        UtalkWe Listen operates a phone-based emotional support service. Callers dial our toll-free
        number and speak with <em>Haven</em>, our AI listening companion. This page describes how
        callers opt in to receive text messages from us, what kinds of messages we send, message
        frequency, and how to opt out.
      </p>

      <h2>1. How callers opt in (verbal disclosure)</h2>
      <p>
        At the start of every new caller&apos;s first call, Haven speaks the following disclosure
        aloud before the conversation begins:
      </p>
      <blockquote>
        <p>
          &ldquo;Welcome to UtalkWe Listen. I&apos;m Haven — an AI guidance service, not a licensed
          counselor. <strong>By continuing this call, you agree to receive text messages from
          UtalkWe Listen at this number — including a short follow-up after our call and occasional
          service updates. Message frequency varies. Message and data rates may apply. Text STOP at
          any time to opt out, or HELP for help.</strong> I&apos;m here to listen. Before we get
          started — what&apos;s your name?&rdquo;
        </p>
      </blockquote>
      <p>
        By continuing the call after this disclosure, the caller provides verbal consent. Every
        call is recorded by our voice provider and the recording is retained as the auditable
        record of consent.
      </p>

      <h2>2. What messages we send</h2>
      <ul>
        <li>
          <strong>Post-call follow-up.</strong> One SMS shortly after a call ends, thanking the
          caller and (when requested) summarizing reflection points from the conversation.
        </li>
        <li>
          <strong>Purchase confirmation.</strong> A transactional SMS after a successful Stripe
          purchase, confirming minutes credited or subscription activation.
        </li>
        <li>
          <strong>Service updates.</strong> Occasional notices about plan status, balance, or
          important changes to the service.
        </li>
        <li>
          <strong>Daily affirmation (opt-in only, paid subscribers).</strong> One short morning
          affirmation per day, sent only after a separate explicit opt-in on a call.
        </li>
        <li>
          <strong>Crisis safety SMS.</strong> When a conversation triggers our crisis protocol, one
          SMS with crisis resources (988 hotline). This is sent for safety regardless of opt-in
          status and cannot be opted out.
        </li>
      </ul>

      <h2>3. Message frequency</h2>
      <p>
        Approximately one message per call. A typical active caller receives between 4 and 12 SMS
        per month. We do not send marketing blasts, bulk sends, or scheduled drip campaigns.
      </p>

      <h2>4. Sample messages</h2>
      <p>Every SMS from UtalkWe Listen identifies the sender by name. Examples:</p>
      <ul>
        <li>
          <strong>Post-call follow-up:</strong> &ldquo;Hey Mike, this is Haven from UtalkWe
          Listen. Thank you for calling today. It takes courage to reach out, and what you shared
          matters. I&apos;m here whenever you need to talk. Take care of yourself today. —
          Haven&rdquo;
        </li>
        <li>
          <strong>Purchase confirmation:</strong> &ldquo;Hey Mike — this is Haven. Got your
          30-minute pack. You now have 30 minutes. Call anytime — I&apos;m here.&rdquo;
        </li>
        <li>
          <strong>Crisis safety:</strong> &ldquo;If you are in crisis, please call or text 988 —
          the Suicide and Crisis Lifeline. You don&apos;t have to go through this alone. —
          Haven&rdquo;
        </li>
      </ul>

      <h2>5. How to opt out and get help</h2>
      <p>
        Reply <strong>STOP</strong> (or STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT) to any message and
        we will stop texting you immediately. Reply <strong>HELP</strong> for support information.
        Message and data rates may apply.
      </p>

      <h2>6. Data sharing — SMS consent</h2>
      <p>
        We do not share or sell mobile phone numbers, SMS opt-in data, or text messaging originator
        consent with third parties or affiliates for marketing or promotional purposes. Mobile
        information may be shared only with service providers that assist in delivering our services
        (such as Twilio, our SMS carrier; Vapi, our voice provider; Supabase, our database; and
        Stripe, our payment processor).
      </p>
      <p>
        <strong>
          The above excludes text messaging originator opt-in data and consent; this information
          will not be shared with any third parties.
        </strong>
      </p>

      <h2>7. More information</h2>
      <p>
        See our <Link href="/privacy">Privacy Policy</Link> and{' '}
        <Link href="/terms">Terms of Service</Link> for full details. Questions:{' '}
        <a href="mailto:support@utalkwelisten.com">support@utalkwelisten.com</a>.
      </p>
    </LegalPageLayout>
  )
}
