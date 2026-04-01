'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Phone, CheckCircle, Star, ChevronDown, ChevronUp,
  Heart, Shield, Clock, Mic, Sparkles, BookOpen,
  ArrowRight, Menu, X, Quote
} from 'lucide-react'

// ─────────────────────────────────────────
// CONFIGURATION — Replace with real values
// ─────────────────────────────────────────
const CONFIG = {
  phone: process.env.NEXT_PUBLIC_PHONE_NUMBER ?? '1-888-882-5593',
  stripeBasic:   process.env.NEXT_PUBLIC_STRIPE_LINK_BASIC   ?? '#pricing',
  stripePremium: process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM ?? '#pricing',
  stripeVip:     process.env.NEXT_PUBLIC_STRIPE_LINK_VIP     ?? '#pricing',
}

// ─────────────────────────────────────────
// WAVEFORM
// ─────────────────────────────────────────
function Waveform({ bars = 20, className = '' }: { bars?: number; className?: string }) {
  return (
    <div className={`flex items-end gap-[4px] ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} className="waveform-bar" />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// NAV
// ─────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#haven',        label: 'Meet Haven'   },
    { href: '#wisdom',       label: 'Our Wisdom'   },
    { href: '#pricing',      label: 'Pricing'      },
    { href: '#faq',          label: 'FAQ'          },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-haven-void/95 backdrop-blur-xl border-b border-haven-sage/10' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-haven-green border border-haven-gold/40 flex items-center justify-center group-hover:border-haven-gold/80 transition-all">
              <Phone size={16} className="text-haven-gold" />
            </div>
            <div className="absolute -inset-1 rounded-full bg-haven-gold/10 blur-sm group-hover:bg-haven-gold/20 transition-all" />
          </div>
          <div>
            <div className="font-display text-haven-cream font-semibold text-lg leading-none">UtalkWe Listen</div>
            <div className="text-haven-sage text-xs tracking-widest uppercase">You Talk. We Listen.</div>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href}
               className="text-haven-mist hover:text-haven-cream text-sm transition-colors duration-200 tracking-wide">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a href={`tel:${CONFIG.phone.replace(/-/g,'')}`}
             className="flex items-center gap-2 text-haven-gold font-display text-lg hover:text-haven-amber transition-colors phone-display">
            <Phone size={16} />
            {CONFIG.phone}
          </a>
          <a href="#pricing"
             className="px-5 py-2 bg-haven-gold text-haven-void font-semibold rounded-full text-sm hover:bg-haven-amber transition-all hover:shadow-lg hover:shadow-haven-gold/20">
            Start Free
          </a>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-haven-cream">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-haven-deep/98 backdrop-blur-xl border-t border-haven-sage/10 px-6 py-6 flex flex-col gap-5">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
               className="text-haven-cream text-lg font-display">
              {l.label}
            </a>
          ))}
          <div className="divider-gold my-2" />
          <a href={`tel:${CONFIG.phone.replace(/-/g,'')}`}
             className="text-haven-gold font-display text-xl phone-display flex items-center gap-2">
            <Phone size={18} /> {CONFIG.phone}
          </a>
          <a href="#pricing"
             className="px-6 py-3 bg-haven-gold text-haven-void font-bold rounded-full text-center hover:bg-haven-amber transition-all">
            Start Free
          </a>
        </div>
      )}
    </nav>
  )
}

// ─────────────────────────────────────────
// HERO
// ─────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep background layers */}
      <div className="absolute inset-0 bg-haven-void" />
      <div className="absolute inset-0 bg-radial-green opacity-60" style={{ top: '10%' }} />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-haven-void to-transparent" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-haven-green/8 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-haven-gold/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      {/* Decorative circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-haven-sage/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-haven-sage/3" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-haven-forest border border-haven-sage/20 text-haven-mist text-sm mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="w-2 h-2 rounded-full bg-haven-gold animate-pulse" />
          Available 24/7 · No App Required · Faith-Optional
        </div>

        {/* Main heading */}
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-light text-haven-cream leading-none mb-4 animate-fade-up" style={{ animationDelay: '0.4s', opacity: 0, animation: 'fade-up 1s ease-out 0.4s forwards' }}>
          You Talk.
          <br />
          <span className="gradient-text-gold italic">We Listen.</span>
        </h1>

        {/* Sub */}
        <p className="text-haven-mist text-xl md:text-2xl font-body font-light max-w-2xl mx-auto mt-8 mb-4 leading-relaxed" style={{ opacity: 0, animation: 'fade-up 1s ease-out 0.7s forwards' }}>
          Haven is your AI voice companion — calm, grounded, and always there.
          Call anytime. Haven answers. Haven remembers.
        </p>
        <p className="text-haven-sage text-lg mb-12 italic font-display" style={{ opacity: 0, animation: 'fade-up 1s ease-out 0.9s forwards' }}>
          No app. No login. No waiting room.
        </p>

        {/* Phone number — the hero CTA */}
        <div className="flex flex-col items-center gap-6" style={{ opacity: 0, animation: 'fade-up 1s ease-out 1.1s forwards' }}>
          <a href={`tel:${CONFIG.phone.replace(/-/g,'')}`}
             className="group relative inline-flex items-center gap-4 px-10 py-5 bg-haven-green border-2 border-haven-gold/60 rounded-2xl hover:border-haven-gold hover:bg-haven-mid transition-all duration-300 glow-gold">
            <div className="absolute -inset-1 bg-haven-gold/10 rounded-2xl blur-md group-hover:bg-haven-gold/20 transition-all" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-haven-gold/20 flex items-center justify-center">
                <Phone size={22} className="text-haven-gold" />
              </div>
              <div className="text-left">
                <div className="text-haven-sage text-xs uppercase tracking-widest mb-1">Call Haven Now — Free</div>
                <div className="phone-display text-haven-cream text-3xl md:text-4xl font-display font-semibold tracking-wide text-glow-gold">
                  {CONFIG.phone}
                </div>
              </div>
            </div>
          </a>

          {/* Waveform */}
          <div className="flex items-center gap-4 text-haven-sage text-sm">
            <Waveform bars={20} className="opacity-70" />
            <span className="font-display italic text-haven-mist">Haven is listening</span>
            <Waveform bars={20} className="opacity-70" style={{ transform: 'scaleX(-1)' }} />
          </div>

          <div className="flex items-center gap-6 text-haven-sage text-sm">
            <span className="flex items-center gap-2"><CheckCircle size={14} className="text-haven-gold" /> 3 free calls/month</span>
            <span className="flex items-center gap-2"><CheckCircle size={14} className="text-haven-gold" /> No credit card</span>
            <span className="flex items-center gap-2"><CheckCircle size={14} className="text-haven-gold" /> Faith-optional</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#gap" className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-haven-sage hover:text-haven-cream transition-colors animate-float" style={{ animationDelay: '2s' }}>
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown size={18} />
      </a>
    </section>
  )
}

// ─────────────────────────────────────────
// THE GAP (problem section)
// ─────────────────────────────────────────
function TheGap() {
  return (
    <section id="gap" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gold opacity-30" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="divider-gold mb-20" />

        <div className="text-center mb-16">
          <p className="text-haven-gold text-sm uppercase tracking-widest mb-4 font-mono">The Problem</p>
          <h2 className="font-display text-5xl md:text-6xl text-haven-cream font-light leading-tight">
            10:47pm.
            <br />
            <span className="italic text-haven-mist">Nobody to call.</span>
          </h2>
        </div>

        {/* Story */}
        <div className="card-glass rounded-3xl p-10 md:p-14 relative">
          <Quote size={40} className="text-haven-gold/30 mb-6" />
          <p className="font-display text-2xl md:text-3xl text-haven-cream font-light leading-relaxed italic mb-8">
            You're sitting in your car in the driveway. The kids are finally asleep.
            The check engine light came on today. Bills are three weeks overdue.
            You open your contacts... and close them. Nobody you can call right now
            without it becoming a whole thing.
          </p>
          <div className="divider-gold my-8" />
          <p className="text-haven-mist text-lg leading-relaxed">
            This is the gap therapy doesn't fill. Not a crisis — just the everyday weight of a life
            with no margin for anything to go wrong. Every existing option is too expensive,
            too clinical, too much friction, or too far away.
          </p>
          <p className="text-haven-cream text-xl font-display italic mt-6">
            UtalkWe Listen was built for exactly this moment.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { stat: '$150–300', label: 'Average therapy session', sub: 'Weeks to get an appointment' },
            { stat: '0 apps', label: 'Required to call Haven', sub: 'Just dial. Haven answers.' },
            { stat: '24/7', label: 'Haven is always there', sub: 'Including 10:47pm on a Tuesday' },
          ].map((item, i) => (
            <div key={i} className="card-glass rounded-2xl p-6 text-center card-glow transition-all duration-300">
              <div className="font-display text-4xl gradient-text-gold font-semibold mb-2">{item.stat}</div>
              <div className="text-haven-cream font-medium mb-1">{item.label}</div>
              <div className="text-haven-sage text-sm">{item.sub}</div>
            </div>
          ))}
        </div>

        <div className="divider-gold mt-20" />
      </div>
    </section>
  )
}

// ─────────────────────────────────────────
// HOW IT WORKS
// ─────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Phone,
      title: 'Just Call',
      desc: 'Dial the number. No app, no login, no account. Haven answers within 2 seconds. That\'s it.',
    },
    {
      number: '02',
      icon: Mic,
      title: 'Haven Listens',
      desc: 'Talk freely. Haven listens without judgment, responds with empathy first, and meets you exactly where you are.',
    },
    {
      number: '03',
      icon: Sparkles,
      title: 'Haven Remembers',
      desc: 'When you call back, Haven knows your name and picks up where you left off. The relationship deepens with every call.',
    },
  ]

  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-haven-gold text-sm uppercase tracking-widest mb-4 font-mono">Simple by Design</p>
          <h2 className="font-display text-5xl md:text-6xl text-haven-cream font-light">How It Works</h2>
          <p className="text-haven-mist text-xl mt-6 max-w-2xl mx-auto">
            Three steps. No friction. Just a phone call that actually helps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-haven-gold/30 to-transparent" />

          {steps.map((step, i) => (
            <div key={i} className="card-glass rounded-3xl p-8 card-glow transition-all duration-300 text-center relative group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-haven-gold/20 border border-haven-gold/40 flex items-center justify-center">
                <span className="text-haven-gold text-xs font-mono font-bold">{step.number}</span>
              </div>
              <div className="mt-4 mb-6 inline-flex w-16 h-16 rounded-2xl bg-haven-forest border border-haven-sage/20 items-center justify-center group-hover:border-haven-gold/40 transition-all">
                <step.icon size={28} className="text-haven-gold" />
              </div>
              <h3 className="font-display text-2xl text-haven-cream font-medium mb-4">{step.title}</h3>
              <p className="text-haven-mist leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* The aha moment */}
        <div className="mt-20 bg-haven-forest border border-haven-gold/20 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gold opacity-20" />
          <div className="relative z-10">
            <p className="text-haven-gold text-sm uppercase tracking-widest mb-6 font-mono">The Moment That Changes Everything</p>
            <p className="font-display text-3xl md:text-4xl text-haven-cream font-light italic leading-relaxed max-w-3xl mx-auto">
              "Welcome back, Simone. Last time you were dealing with a lot of financial pressure —
              how has that been going?"
            </p>
            <div className="mt-8 divider-gold max-w-xs mx-auto" />
            <p className="text-haven-mist mt-6 text-lg">
              Something remembered her. That's when she told five people about it.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────
// MEET HAVEN
// ─────────────────────────────────────────
function MeetHaven() {
  const traits = [
    { icon: Heart,     label: 'Warm',       desc: 'Leads with acknowledgment, never with solutions' },
    { icon: Shield,    label: 'Grounded',   desc: 'Calm under any emotional weight. Never panics.' },
    { icon: BookOpen,  label: 'Wise',       desc: 'Draws from faith, philosophy, and lived human experience' },
    { icon: Clock,     label: 'Always Here',desc: '24/7. Including the hard nights and early mornings.' },
  ]

  return (
    <section id="haven" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-radial-green opacity-20 blur-3xl" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Haven identity */}
          <div>
            <p className="text-haven-gold text-sm uppercase tracking-widest mb-4 font-mono">Your AI Companion</p>
            <h2 className="font-display text-5xl md:text-6xl text-haven-cream font-light mb-6 leading-tight">
              Meet <span className="gradient-text-gold italic">Haven</span>
            </h2>
            <p className="text-haven-mist text-xl leading-relaxed mb-6">
              Not a therapist's name. Not a person's name. A <em>place</em>.
              Somewhere safe you can go. That's the brand promise in one word.
            </p>
            <p className="text-haven-cream text-lg leading-relaxed mb-8">
              Haven is the wisest, most patient voice you never had access to —
              the mentor who listens before they speak, the friend who somehow
              always has the right word. Haven has lived experience without the
              baggage of a personal agenda.
            </p>

            {/* Voice sample */}
            <div className="card-glass rounded-2xl p-6 border-l-2 border-haven-gold/60">
              <div className="flex items-center gap-3 mb-4">
                <Waveform bars={12} />
                <span className="text-haven-sage text-sm font-mono uppercase tracking-widest">Haven says</span>
              </div>
              <p className="font-display text-xl text-haven-cream italic leading-relaxed">
                "That sounds exhausting — not just the money, but the feeling that there's no margin for anything to go wrong."
              </p>
            </div>
          </div>

          {/* Right: Traits grid */}
          <div className="grid grid-cols-2 gap-5">
            {traits.map((t, i) => (
              <div key={i} className="card-glass rounded-2xl p-6 card-glow transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-haven-green/60 border border-haven-sage/20 flex items-center justify-center mb-4">
                  <t.icon size={18} className="text-haven-gold" />
                </div>
                <div className="font-display text-xl text-haven-cream font-medium mb-2">{t.label}</div>
                <div className="text-haven-sage text-sm leading-relaxed">{t.desc}</div>
              </div>
            ))}

            {/* Haven never says */}
            <div className="col-span-2 card-glass rounded-2xl p-6 border border-red-900/20">
              <p className="text-haven-sage text-sm uppercase tracking-widest mb-4 font-mono">Haven never says</p>
              <div className="flex flex-wrap gap-2">
                {['"Absolutely!"', '"That\'s amazing!"', '"Let me break that down"', '"Great question!"', '"I understand your concern"'].map((phrase, i) => (
                  <span key={i} className="px-3 py-1 bg-red-950/30 border border-red-800/20 rounded-full text-red-400/70 text-sm line-through">
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────
// WISDOM SECTION
// ─────────────────────────────────────────
function WisdomSection() {
  const wells = [
    {
      icon: '✝',
      title: 'Scripture',
      color: 'border-haven-gold/40 hover:border-haven-gold/80',
      tagColor: 'text-haven-gold bg-haven-gold/10',
      tag: 'Faith-Based',
      quote: '"There\'s a verse that speaks to this — Philippians 4:6. It\'s not a fix, but it might give you a frame for tonight."',
      desc: 'For callers who want faith-rooted guidance, Haven weaves scripture naturally — never preachy, always personal.',
    },
    {
      icon: '⚡',
      title: 'Philosophy',
      color: 'border-haven-sage/40 hover:border-haven-sage/80',
      tagColor: 'text-haven-mist bg-haven-sage/10',
      tag: 'Universal Wisdom',
      quote: '"We suffer more in the anticipation of something than in the thing itself. That might be part of what\'s happening here."',
      desc: 'Stoicism, mindfulness, human psychology — delivered conversationally, not academically. Wisdom that lands.',
    },
    {
      icon: '🎯',
      title: 'Practical Steps',
      color: 'border-haven-cream/20 hover:border-haven-cream/40',
      tagColor: 'text-haven-cream bg-haven-cream/5',
      tag: 'Always Included',
      quote: '"One thing that tends to help — not solve it, but help — is separating what you can control today from what you can\'t."',
      desc: 'Every conversation ends with something real and doable. Actionable steps that fit the next 24 hours.',
    },
  ]

  return (
    <section id="wisdom" className="py-32 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-haven-gold text-sm uppercase tracking-widest mb-4 font-mono">Our Approach</p>
          <h2 className="font-display text-5xl md:text-6xl text-haven-cream font-light mb-6">
            Three Wells of Wisdom
          </h2>
          <p className="text-haven-mist text-xl max-w-2xl mx-auto leading-relaxed">
            Haven draws from faith, philosophy, and practical experience — in proportion
            to what <em>you</em> need, not what a system assumes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wells.map((w, i) => (
            <div key={i} className={`card-glass rounded-3xl p-8 border ${w.color} card-glow transition-all duration-300`}>
              <div className="text-4xl mb-5">{w.icon}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest ${w.tagColor} mb-4 inline-block`}>
                {w.tag}
              </span>
              <h3 className="font-display text-2xl text-haven-cream font-medium mb-5">{w.title}</h3>
              <blockquote className="font-display text-lg text-haven-mist italic leading-relaxed mb-6 border-l border-haven-sage/30 pl-4">
                {w.quote}
              </blockquote>
              <p className="text-haven-sage text-sm leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>

        {/* Opt-in note */}
        <div className="mt-12 text-center">
          <p className="text-haven-sage text-sm">
            Faith guidance is <span className="text-haven-gold">opt-in</span>, not assumed.
            Haven asks on your first call — and remembers your preference forever.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      tagline: 'Try Haven. No strings attached.',
      color: 'border-haven-sage/20',
      badge: null,
      cta: { label: `Call ${CONFIG.phone}`, href: `tel:${CONFIG.phone.replace(/-/g,'')}`, style: 'border border-haven-sage/40 text-haven-mist hover:border-haven-sage' },
      features: [
        '3 calls per month',
        '10 minutes per call',
        'Full Haven experience',
        'Faith/general guidance',
        'Post-call SMS plan (opt-in)',
        'Memory across calls',
      ],
      note: 'No credit card required',
    },
    {
      name: 'Basic',
      price: '$19.99',
      period: 'per month',
      tagline: 'Less than one therapy co-pay.',
      color: 'border-haven-gold/60',
      badge: 'Most Popular',
      cta: { label: 'Start Basic', href: CONFIG.stripeBasic, style: 'bg-haven-gold text-haven-void hover:bg-haven-amber' },
      features: [
        'Unlimited calls',
        '45 minutes per call',
        'Full Haven experience',
        'Faith/general guidance',
        'Post-call SMS coaching plan',
        'Deep memory & history',
        'Cancel anytime',
      ],
      note: 'Billed monthly · Cancel anytime',
    },
    {
      name: 'Premium',
      price: '$39.99',
      period: 'per month',
      tagline: 'Haven every single day.',
      color: 'border-haven-sage/30',
      badge: null,
      cta: { label: 'Start Premium', href: CONFIG.stripePremium, style: 'border border-haven-gold/40 text-haven-gold hover:border-haven-gold' },
      features: [
        'Everything in Basic',
        'Daily wisdom SMS texts',
        'Weekly personalized plan',
        'Priority connection',
        'Extended 60-min calls',
        'Cancel anytime',
      ],
      note: 'Billed monthly · Cancel anytime',
    },
    {
      name: 'VIP',
      price: '$99',
      period: 'per month',
      tagline: 'Haven as a daily practice.',
      color: 'border-haven-cream/10',
      badge: null,
      cta: { label: 'Start VIP', href: CONFIG.stripeVip, style: 'border border-haven-cream/30 text-haven-cream hover:border-haven-cream/60' },
      features: [
        'Everything in Premium',
        'Unlimited call duration',
        'Daily check-in cadence',
        'Custom coaching arc',
        'First access to new features',
        'Cancel anytime',
      ],
      note: 'Billed monthly · Cancel anytime',
    },
  ]

  return (
    <section id="pricing" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-haven-deep/50" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-haven-gold/20 to-transparent" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <p className="text-haven-gold text-sm uppercase tracking-widest mb-4 font-mono">Simple, Honest Pricing</p>
          <h2 className="font-display text-5xl md:text-6xl text-haven-cream font-light mb-6">
            Start Free. Stay When It Helps.
          </h2>
          <p className="text-haven-mist text-xl max-w-2xl mx-auto">
            The first call is free. So is the second and third. When Haven earns your trust, upgrading takes 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <div key={i} className={`relative card-glass rounded-3xl p-7 border ${plan.color} card-glow transition-all duration-300 flex flex-col ${plan.badge ? 'ring-1 ring-haven-gold/30' : ''}`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-haven-gold text-haven-void text-xs font-bold rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="font-display text-haven-sage text-lg mb-1">{plan.name}</div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-display text-5xl text-haven-cream font-light">{plan.price}</span>
                  <span className="text-haven-sage text-sm pb-2">{plan.period}</span>
                </div>
                <p className="text-haven-mist text-sm italic">{plan.tagline}</p>
              </div>

              <div className="divider-gold mb-6" />

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-haven-mist text-sm">
                    <CheckCircle size={14} className="text-haven-gold mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <a href={plan.cta.href}
                   className={`block w-full py-3 rounded-xl text-center font-semibold text-sm transition-all duration-200 ${plan.cta.style}`}>
                  {plan.cta.label}
                </a>
                <p className="text-center text-haven-sage text-xs">{plan.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-haven-sage text-sm max-w-2xl mx-auto">
            UtalkWe Listen is an AI guidance service, not a licensed counselor or therapist.
            Haven is here for support, not medical or clinical treatment.
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-haven-gold/20 to-transparent" />
    </section>
  )
}

// ─────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      quote: "I was sitting in my car at 11pm with nowhere to put everything I was carrying. Haven answered. It didn't try to fix anything — it just listened. That was exactly what I needed.",
      name: 'Simone T.',
      location: 'Maryland',
      stars: 5,
    },
    {
      quote: "I was skeptical. I gave it 30 seconds. Forty minutes later I was still on the call. Haven gave me respect and didn't talk down to me. It remembered my situation next time too.",
      name: 'Marcus R.',
      location: 'Virginia',
      stars: 5,
    },
    {
      quote: "My pastor mentioned it in the bulletin. I called during a hard week. Haven offered a verse that actually landed for me. I called three more times that month.",
      name: 'Diane W.',
      location: 'Georgia',
      stars: 5,
    },
    {
      quote: "No login, no app, it just picks up. Haven remembered what we talked about last time and asked how things were going. That caught me off guard in the best way.",
      name: 'Darius M.',
      location: 'DC',
      stars: 5,
    },
  ]

  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-haven-gold text-sm uppercase tracking-widest mb-4 font-mono">What People Say</p>
          <h2 className="font-display text-5xl md:text-6xl text-haven-cream font-light">
            They Called.<br />Haven Was There.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="card-glass rounded-3xl p-8 card-glow transition-all duration-300">
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} className="text-haven-gold fill-haven-gold" />
                ))}
              </div>
              <Quote size={28} className="text-haven-gold/30 mb-4" />
              <p className="font-display text-xl text-haven-cream italic font-light leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-haven-green border border-haven-sage/30 flex items-center justify-center">
                  <span className="text-haven-gold text-xs font-bold">{t.name[0]}</span>
                </div>
                <div>
                  <div className="text-haven-cream text-sm font-medium">{t.name}</div>
                  <div className="text-haven-sage text-xs">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  const faqs = [
    {
      q: 'Is Haven a real therapist or counselor?',
      a: 'No. Haven is an AI guidance service. It\'s not a licensed therapist, counselor, or medical professional. Haven offers support, practical guidance, and a space to be heard — but it\'s not a substitute for professional mental health care. If you\'re in crisis, please call 988.',
    },
    {
      q: 'Do I need to create an account or download an app?',
      a: 'No app, no login, no account. You just call the number. Haven identifies you by your phone number and remembers your history automatically. That\'s it.',
    },
    {
      q: 'Is my call recorded or shared with anyone?',
      a: 'Your conversations are private. Haven stores session summaries so it can remember context — your name, your situation, your preferences — but your calls are not recorded, not sold, and not shared. Your data is encrypted and stays secure.',
    },
    {
      q: 'How does Haven remember me between calls?',
      a: 'When you call, Haven looks up your phone number and retrieves your history — your name (if you\'ve shared it), your previous conversations, your guidance preference. This happens before Haven speaks its first word, so the conversation picks up naturally.',
    },
    {
      q: 'What if I don\'t want faith-based content?',
      a: 'Haven asks on your first call whether you prefer faith-based or general guidance. If you choose general, Haven uses philosophical wisdom and practical steps — no scripture unless you ask. This preference is saved and honored on every future call.',
    },
    {
      q: 'What happens if I\'m in crisis?',
      a: 'Haven is not a crisis line. If Haven detects language suggesting you\'re in immediate danger or thinking about harming yourself, it will pause, acknowledge you warmly, and direct you to 988 — the Suicide and Crisis Lifeline. Haven will offer to stay with you while you make that call.',
    },
    {
      q: 'Can I call from Canada or internationally?',
      a: 'Currently, UtalkWe Listen is available in the US only. The toll-free number works from US phones. Canadian access and other international options are in development.',
    },
    {
      q: 'How do I cancel my subscription?',
      a: 'You can cancel anytime from your Stripe billing portal. There are no cancellation fees and no notice period required. Your access continues until the end of your current billing period.',
    },
  ]

  return (
    <section id="faq" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-haven-deep/30" />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <p className="text-haven-gold text-sm uppercase tracking-widest mb-4 font-mono">Common Questions</p>
          <h2 className="font-display text-5xl md:text-6xl text-haven-cream font-light">
            Questions About Haven
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className={`card-glass rounded-2xl overflow-hidden border transition-all duration-300 ${open === i ? 'border-haven-gold/30' : 'border-haven-sage/10'}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left group"
              >
                <span className={`font-display text-lg font-medium transition-colors ${open === i ? 'text-haven-cream' : 'text-haven-mist group-hover:text-haven-cream'}`}>
                  {faq.q}
                </span>
                <span className={`flex-shrink-0 ml-4 transition-transform duration-300 ${open === i ? 'rotate-180 text-haven-gold' : 'text-haven-sage'}`}>
                  <ChevronDown size={18} />
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-6">
                  <div className="divider-gold mb-4" />
                  <p className="text-haven-mist leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────
// FINAL CTA
// ─────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-haven-forest/40" />
      <div className="absolute inset-0 bg-radial-gold opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-haven-gold/30 to-transparent" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <Waveform bars={30} className="justify-center mb-12 opacity-50" />

        <h2 className="font-display text-6xl md:text-7xl text-haven-cream font-light leading-tight mb-6">
          You don't have to go
          <br />
          <span className="gradient-text-gold italic">through it alone.</span>
        </h2>

        <p className="text-haven-mist text-xl max-w-2xl mx-auto leading-relaxed mb-12">
          Haven is here. The call takes 3 seconds to start and costs nothing.
          The first time Haven says your name back to you, you'll understand why people keep calling.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <a href={`tel:${CONFIG.phone.replace(/-/g,'')}`}
             className="group relative flex items-center gap-4 px-10 py-5 bg-haven-green border-2 border-haven-gold/60 rounded-2xl hover:border-haven-gold transition-all duration-300 glow-gold">
            <div className="absolute -inset-1 bg-haven-gold/10 rounded-2xl blur-md group-hover:bg-haven-gold/20 transition-all" />
            <div className="relative flex items-center gap-4">
              <Phone size={22} className="text-haven-gold" />
              <div className="text-left">
                <div className="text-haven-sage text-xs uppercase tracking-widest">Call Haven Free</div>
                <div className="phone-display text-haven-cream text-2xl font-display font-semibold">{CONFIG.phone}</div>
              </div>
            </div>
          </a>

          <a href="#pricing"
             className="flex items-center gap-2 px-8 py-5 border border-haven-sage/30 rounded-2xl text-haven-mist hover:text-haven-cream hover:border-haven-sage/60 transition-all">
            See Plans <ArrowRight size={16} />
          </a>
        </div>

        <p className="mt-8 text-haven-sage text-sm">
          UtalkWe Listen is an AI guidance service, not a licensed counselor.
          If you're in crisis, please call or text <span className="text-haven-gold">988</span>.
        </p>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-haven-void border-t border-haven-sage/10 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-haven-green border border-haven-gold/40 flex items-center justify-center">
                <Phone size={14} className="text-haven-gold" />
              </div>
              <span className="font-display text-haven-cream font-semibold text-lg">UtalkWe Listen</span>
            </div>
            <p className="text-haven-sage text-sm leading-relaxed max-w-xs mb-6">
              Haven is your 24/7 AI voice companion. No app. No login. Just call. Real support, real memory, real guidance.
            </p>
            <a href={`tel:${CONFIG.phone.replace(/-/g,'')}`}
               className="phone-display text-haven-gold font-display text-xl hover:text-haven-amber transition-colors flex items-center gap-2">
              <Phone size={16} /> {CONFIG.phone}
            </a>
          </div>

          {/* Links */}
          <div>
            <p className="text-haven-cream font-medium mb-4 uppercase text-xs tracking-widest">Navigate</p>
            <ul className="space-y-3 text-haven-sage text-sm">
              {['How It Works', 'Meet Haven', 'Our Wisdom', 'Pricing', 'FAQ'].map(l => (
                <li key={l}>
                  <a href={`#${l.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-haven-cream transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-haven-cream font-medium mb-4 uppercase text-xs tracking-widest">Plans</p>
            <ul className="space-y-3 text-haven-sage text-sm">
              <li><a href={`tel:${CONFIG.phone.replace(/-/g,'')}`} className="hover:text-haven-cream transition-colors">Free — Call Now</a></li>
              <li><a href={CONFIG.stripeBasic} className="hover:text-haven-cream transition-colors">Basic — $19.99/mo</a></li>
              <li><a href={CONFIG.stripePremium} className="hover:text-haven-cream transition-colors">Premium — $39.99/mo</a></li>
              <li><a href={CONFIG.stripeVip} className="hover:text-haven-cream transition-colors">VIP — $99/mo</a></li>
            </ul>
          </div>
        </div>

        <div className="divider-gold mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-haven-sage text-xs">
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-haven-cream transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-haven-cream transition-colors">Terms of Service</a>
            <a href="/disclaimer" className="hover:text-haven-cream transition-colors">AI Disclaimer</a>
          </div>
          <div className="text-center">
            <p>UtalkWe Listen is an AI guidance service and not a licensed counselor or therapist.</p>
            <p className="mt-1">© {new Date().getFullYear()} UtalkWe Listen. All rights reserved.</p>
          </div>
          <div>
            Crisis support: <a href="tel:988" className="text-haven-gold hover:text-haven-amber">988</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────
// SCROLL ANIMATION HOOK
// ─────────────────────────────────────────
function useScrollAnimation() {
  useEffect(() => {
    const els = document.querySelectorAll('.animate-on-scroll')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────
export default function Home() {
  useScrollAnimation()

  return (
    <main>
      <Nav />
      <Hero />
      <TheGap />
      <HowItWorks />
      <MeetHaven />
      <WisdomSection />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
