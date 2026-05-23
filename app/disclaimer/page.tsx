import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageLayout } from '../components/LegalPageLayout'

export const metadata: Metadata = {
  title: 'AI Disclaimer — UtalkWe Listen',
  description: 'Important limitations of the Haven AI voice guidance service.',
}

const LAST_UPDATED = 'May 23, 2026'

export default function DisclaimerPage() {
  return (
    <LegalPageLayout title="AI Disclaimer" lastUpdated={LAST_UPDATED}>
      <p>
        Please read this disclaimer carefully before using Haven through UtalkWe Listen. By using the
        Service, you acknowledge that you understand and accept these limitations.
      </p>

      <h2>Not professional care</h2>
      <p>
        Haven is an <strong>artificial intelligence voice companion</strong>, not a human therapist,
        counselor, social worker, physician, psychiatrist, pastor acting in a professional counseling
        role, or emergency responder. UtalkWe Listen is an AI guidance service and is{' '}
        <strong>not a licensed mental health or medical provider</strong>.
      </p>
      <p>
        Nothing Haven says should be interpreted as medical advice, mental health diagnosis, treatment
        plan, legal advice, or financial advice. Always consult qualified professionals for those
        needs.
      </p>

      <h2>Not for emergencies or crisis</h2>
      <p>
        The Service is <strong>not a crisis hotline</strong> and is not appropriate if you are in
        immediate danger or thinking about harming yourself or others.
      </p>
      <ul>
        <li>
          <strong>United States — Suicide &amp; Crisis Lifeline:</strong> call or text{' '}
          <a href="tel:988">988</a>
        </li>
        <li>
          <strong>Emergency services:</strong> dial <a href="tel:911">911</a>
        </li>
      </ul>
      <p>
        Haven may encourage you to contact 988 when certain language is detected, but automated
        detection is not perfect and should not be relied upon as your only safety measure.
      </p>

      <h2>AI accuracy and judgment</h2>
      <p>
        Haven is powered by large language models and related AI systems. AI can:
      </p>
      <ul>
        <li>Produce incorrect, outdated, or misleading information</li>
        <li>Fail to understand nuance, culture, or your full context</li>
        <li>Respond in ways that feel supportive but are not appropriate for your situation</li>
        <li>Occasionally generate content that does not reflect human review</li>
      </ul>
      <p>
        You are solely responsible for decisions you make based on conversations with Haven.
      </p>

      <h2>Faith and guidance content</h2>
      <p>
        When you choose faith-based guidance, Haven may reference scripture or spiritual themes for
        encouragement. This is pastoral-style support through AI, not clergy counseling, and may not
        align with every tradition or belief. You may switch to general (non-faith) guidance at any
        time; Haven will remember your preference.
      </p>

      <h2>Memory and personalization</h2>
      <p>
        Haven uses your phone number and stored session summaries to personalize conversations. While
        this creates continuity, it is not the same as a human relationship and may occasionally recall
        context incorrectly.
      </p>

      <h2>No guarantee of outcomes</h2>
      <p>
        We do not guarantee that use of the Service will improve your mood, resolve problems, or
        prevent harm. Individual experiences vary.
      </p>

      <h2>When to seek human help</h2>
      <p>Consider speaking with a licensed professional if you:</p>
      <ul>
        <li>Have thoughts of suicide or self-harm</li>
        <li>Are in an abusive or dangerous situation</li>
        <li>Experience symptoms that interfere with daily life for an extended period</li>
        <li>Need medication, clinical diagnosis, or court-ordered treatment</li>
      </ul>

      <h2>More information</h2>
      <p>
        Full terms: <Link href="/terms">Terms of Service</Link>
        <br />
        Data practices: <Link href="/privacy">Privacy Policy</Link>
        <br />
        Questions: <a href="mailto:support@utalwelisten.com">support@utalwelisten.com</a>
      </p>
    </LegalPageLayout>
  )
}
