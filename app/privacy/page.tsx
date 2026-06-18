import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageLayout } from '../components/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy — UtalkWe Listen',
  description: 'How UtalkWe Listen collects, uses, and protects your information when you use Haven.',
}

const LAST_UPDATED = 'June 2, 2026'

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p>
        UtalkWe Listen (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Haven AI voice guidance
        service available at{' '}
        <a href="https://utalkwelisten.com">utalkwelisten.com</a> and by phone. This Privacy Policy
        explains what information we collect, how we use it, and the choices you have.
      </p>

      <h2>1. Information we collect</h2>
      <h3>Phone number</h3>
      <p>
        When you call Haven, we receive your phone number from our telephony provider. Your phone
        number is the primary identifier we use to recognize returning callers and maintain
        conversation context across calls.
      </p>
      <h3>Call and conversation data</h3>
      <p>
        During a call, audio is processed in real time to power Haven&apos;s responses. We may store
        session summaries, topics discussed, guidance preferences (such as faith-based vs. general
        guidance), and related metadata needed to personalize future conversations. We do not sell
        full call recordings.
      </p>
      <h3>SMS messages</h3>
      <p>
        If you opt in to post-call SMS (for example, a follow-up plan or daily affirmation texts),
        we collect your phone number and message delivery status through our SMS provider. Opt-in is
        captured verbally at the start of your first call to UtalkWe Listen. See our{' '}
        <Link href="/sms-disclosure">SMS Opt-In Disclosure</Link> for the full script, message
        types, frequency, and opt-out details. Message and data rates may apply. Reply{' '}
        <strong>STOP</strong> to any message to opt out, or <strong>HELP</strong> for help.
      </p>
      <h3>Payment information</h3>
      <p>
        Paid plans are processed by Stripe. We do not store full credit card numbers on our servers.
        Stripe provides us with billing identifiers, subscription status, and the phone number you
        associate with your purchase when required to link payment to your caller account.
      </p>
      <h3>Website usage</h3>
      <p>
        When you visit our website, we may collect standard technical data such as browser type,
        device type, pages viewed, and referring URL. We may use cookies or similar technologies for
        basic site functionality and analytics.
      </p>

      <h2>2. How we use your information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, operate, and improve the Haven voice service</li>
        <li>Remember your preferences and conversation context between calls</li>
        <li>Process subscriptions and pay-per-minute purchases</li>
        <li>Send optional SMS you have agreed to receive</li>
        <li>Detect crisis-related language and direct callers to appropriate resources (such as 988)</li>
        <li>Protect against fraud, abuse, and security incidents</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. How we share information</h2>
      <p>
        We do not sell your personal information. We share data only with service providers that help
        us run UtalkWe Listen, including:
      </p>
      <ul>
        <li>Voice and telephony partners (call routing and AI voice processing)</li>
        <li>Cloud database and hosting providers</li>
        <li>Payment processing (Stripe)</li>
        <li>SMS delivery providers (when you opt in)</li>
      </ul>
      <p>
        These providers are contractually required to use your data only to perform services for us.
        We may also disclose information if required by law, to protect rights and safety, or in
        connection with a business transfer (such as a merger), with notice where appropriate.
      </p>
      <p>
        <strong>
          The above excludes text messaging originator opt-in data and consent; this information
          will not be shared with any third parties.
        </strong>{' '}
        We do not share or sell your mobile phone number, SMS opt-in data, or text messaging
        originator consent with third parties or affiliates for marketing or promotional purposes.
        Consent to receive SMS from UtalkWe Listen is a direct, one-to-one agreement between you
        and us; it is not transferable, resaleable, or used to power third-party marketing.
      </p>

      <h2>4. Data retention</h2>
      <p>
        We retain caller profiles and session summaries for as long as needed to provide the service
        and honor your history with Haven, unless you request deletion or we are required to delete
        data sooner. Billing records may be retained as required for tax and accounting purposes.
      </p>

      <h2>5. Security</h2>
      <p>
        We use administrative, technical, and organizational measures designed to protect your
        information, including encryption in transit and access controls on our systems. No method of
        transmission or storage is completely secure; we cannot guarantee absolute security.
      </p>

      <h2>6. Your choices and rights</h2>
      <p>Depending on where you live, you may have the right to:</p>
      <ul>
        <li>Request access to personal information we hold about you</li>
        <li>Request correction or deletion of your data</li>
        <li>Opt out of marketing SMS (reply STOP where applicable)</li>
        <li>Object to or restrict certain processing</li>
      </ul>
      <p>
        To make a privacy request, email{' '}
        <a href="mailto:privacy@utalkwelisten.com">privacy@utalkwelisten.com</a>. We may need to verify
        your identity using the phone number associated with your account.
      </p>

      <h2>7. Children</h2>
      <p>
        UtalkWe Listen is not directed to children under 13, and we do not knowingly collect personal
        information from children under 13. If you believe a child has provided us information,
        contact us and we will delete it.
      </p>

      <h2>8. U.S. service only</h2>
      <p>
        The service is currently offered to callers in the United States. If you access the service
        from outside the U.S., your information may be processed in the United States where our
        providers operate.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the revised version on this
        page with an updated &quot;Last updated&quot; date. Continued use of the service after changes
        constitutes acceptance of the updated policy.
      </p>

      <h2>10. Contact us</h2>
      <p>
        Questions about this Privacy Policy:{' '}
        <a href="mailto:privacy@utalkwelisten.com">privacy@utalkwelisten.com</a>
        <br />
        See also our <Link href="/terms">Terms of Service</Link>,{' '}
        <Link href="/disclaimer">AI Disclaimer</Link>, and{' '}
        <Link href="/sms-disclosure">SMS Opt-In Disclosure</Link>.
      </p>
    </LegalPageLayout>
  )
}
