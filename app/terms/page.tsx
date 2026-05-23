import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageLayout } from '../components/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Terms of Service — UtalkWe Listen',
  description: 'Terms and conditions for using the UtalkWe Listen Haven AI voice guidance service.',
}

const LAST_UPDATED = 'May 23, 2026'

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of UtalkWe Listen and Haven, our
        AI voice guidance service (collectively, the &quot;Service&quot;). By calling our phone number,
        visiting our website, or purchasing a plan, you agree to these Terms.
      </p>

      <h2>1. The Service</h2>
      <p>
        UtalkWe Listen provides an AI-powered voice companion named Haven for emotional support,
        practical guidance, and optional faith-based encouragement. The Service is accessed primarily
        by phone without requiring an app download or user account.
      </p>
      <p>
        <strong>Important:</strong> Haven is not a licensed therapist, counselor, physician, or
        crisis intervention service. The Service does not provide medical, mental health, or legal
        advice. See our <Link href="/disclaimer">AI Disclaimer</Link> for more detail.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old (or the age of majority in your jurisdiction) to use paid
        features. The Service is currently available to callers in the United States. You are
        responsible for any charges your carrier applies for phone calls or SMS.
      </p>

      <h2>3. Free and paid plans</h2>
      <p>
        We may offer free calls (subject to limits such as number of calls or duration per month) and
        paid options including pay-per-minute and monthly subscriptions. Pricing and features are
        described on our website and may change with notice.
      </p>
      <ul>
        <li>
          <strong>Subscriptions:</strong> Billed through Stripe on a recurring basis until you cancel.
          Cancellation takes effect at the end of the current billing period unless otherwise stated.
        </li>
        <li>
          <strong>Pay-per-minute:</strong> Charged according to the plan you purchase. Unused prepaid
          minutes, if any, are subject to the terms shown at purchase.
        </li>
        <li>
          <strong>Refunds:</strong> Except where required by law or explicitly stated at purchase, fees
          are non-refundable once the Service has been delivered or the billing period has begun.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for unlawful, harassing, or abusive purposes</li>
        <li>Attempt to reverse engineer, scrape, or disrupt our systems</li>
        <li>Impersonate others or provide false information to obtain service</li>
        <li>Use the Service as a substitute for emergency or crisis care when you need immediate help</li>
      </ul>
      <p>
        If you are in crisis or may harm yourself or others, call or text <strong>988</strong> (Suicide
        and Crisis Lifeline) or dial <strong>911</strong> immediately.
      </p>

      <h2>5. Crisis detection</h2>
      <p>
        Haven may detect language suggesting immediate danger and encourage you to contact 988 or
        emergency services. This feature is not a guarantee of detection and does not create a duty
        of care equivalent to a human crisis counselor or emergency responder.
      </p>

      <h2>6. AI limitations</h2>
      <p>
        Haven is powered by artificial intelligence. Responses may be inaccurate, incomplete, or
        inappropriate for your situation. You are responsible for your own decisions and actions. Do not
        rely on Haven for medical diagnoses, medication guidance, legal decisions, or safety-critical
        judgments.
      </p>

      <h2>7. Privacy</h2>
      <p>
        Our collection and use of personal information is described in our{' '}
        <Link href="/privacy">Privacy Policy</Link>. By using the Service, you consent to that
        processing.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The Service, including Haven&apos;s persona, website content, and branding, is owned by UtalkWe
        Listen or its licensors. You receive a limited, personal, non-transferable license to use the
        Service for its intended purpose. You may not copy, resell, or commercially exploit the Service
        without our written permission.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF
        ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
        FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
        UNINTERRUPTED, ERROR-FREE, OR MEET YOUR EXPECTATIONS.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, UTALKWE LISTEN AND ITS AFFILIATES, OFFICERS,
        EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM
        YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR THE
        SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE TWELVE MONTHS BEFORE
        THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS ($100).
      </p>
      <p>
        Some jurisdictions do not allow certain limitations; in those cases, our liability is limited
        to the fullest extent permitted by law.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless UtalkWe Listen from claims, damages, and expenses
        (including reasonable attorneys&apos; fees) arising from your misuse of the Service or violation
        of these Terms.
      </p>

      <h2>12. Changes and termination</h2>
      <p>
        We may modify these Terms or discontinue features with notice where practicable. We may
        suspend or terminate access for violation of these Terms or to protect the Service. Sections
        that by their nature should survive termination will survive.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of the United States and the State of Maryland, without
        regard to conflict-of-law principles. Disputes will be resolved in the state or federal courts
        located in Maryland, unless applicable law requires otherwise.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms:{' '}
        <a href="mailto:support@utalwelisten.com">support@utalwelisten.com</a>
        <br />
        Related: <Link href="/privacy">Privacy Policy</Link> · <Link href="/disclaimer">AI Disclaimer</Link>
      </p>
    </LegalPageLayout>
  )
}
