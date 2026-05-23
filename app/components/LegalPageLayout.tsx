import Link from 'next/link'
import { Phone } from 'lucide-react'
import type { ReactNode } from 'react'

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/disclaimer', label: 'AI Disclaimer' },
] as const

type LegalPageLayoutProps = {
  title: string
  lastUpdated: string
  children: ReactNode
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-haven-void">
      <header className="border-b border-haven-sage/10 bg-haven-deep/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-haven-green border border-haven-gold/40 flex items-center justify-center group-hover:border-haven-gold/80 transition-all">
              <Phone size={16} className="text-haven-gold" />
            </div>
            <div>
              <div className="font-display text-haven-cream font-semibold text-lg leading-none">UtalkWe Listen</div>
              <div className="text-haven-sage text-xs tracking-widest uppercase">You Talk. We Listen.</div>
            </div>
          </Link>
          <Link
            href="/"
            className="text-haven-mist hover:text-haven-cream text-sm transition-colors whitespace-nowrap"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-haven-gold text-sm uppercase tracking-widest mb-3 font-mono">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl text-haven-cream font-light mb-3">{title}</h1>
        <p className="text-haven-sage text-sm mb-10">Last updated: {lastUpdated}</p>

        <article className="card-glass rounded-3xl p-8 md:p-12 legal-prose">{children}</article>

        <p className="mt-10 text-haven-sage text-sm text-center max-w-2xl mx-auto">
          These documents are provided for transparency. They are not legal advice. For questions, contact{' '}
          <a href="mailto:support@utalwelisten.com" className="text-haven-gold hover:text-haven-amber transition-colors">
            support@utalwelisten.com
          </a>
          .
        </p>
      </main>

      <footer className="border-t border-haven-sage/10 py-10 px-6 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-haven-sage text-xs">
          <div className="flex flex-wrap justify-center gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-haven-cream transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-center">
            Crisis support:{' '}
            <a href="tel:988" className="text-haven-gold hover:text-haven-amber">
              988
            </a>
          </p>
          <p>© {new Date().getFullYear()} UtalkWe Listen</p>
        </div>
      </footer>
    </div>
  )
}
