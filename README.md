# UtalkWe Listen — Website

The official marketing site for UtalkWe Listen, built with Next.js 14, Tailwind CSS, and Stripe Payment Links.

---

## Quick Deploy to Vercel

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Option B — GitHub Integration
1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import from GitHub
3. Add environment variables (see below)
4. Deploy

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Your Stripe Payment Links
# Create at: dashboard.stripe.com > Payment Links
NEXT_PUBLIC_STRIPE_LINK_BASIC=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_PREMIUM=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_VIP=https://buy.stripe.com/...

# Your Twilio toll-free number
NEXT_PUBLIC_PHONE_NUMBER=1-888-882-5593

# Your production URL
NEXT_PUBLIC_SITE_URL=https://utalwelisten.com
```

### Setting up Stripe Payment Links

1. Go to [Stripe Dashboard → Payment Links](https://dashboard.stripe.com/payment-links)
2. Create 3 products:
   - **Basic** — $19.99/month recurring
   - **Premium** — $39.99/month recurring  
   - **VIP** — $99/month recurring
3. For each, click "Create payment link"
4. **Important:** In the payment link settings, add a custom field for "Phone Number" — this is how you'll connect Stripe payments back to callers
5. Copy each link URL into your env variables

---

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in .env.local values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Site Sections

| Section | Description |
|---------|-------------|
| Hero | Phone number CTA with animated waveform |
| The Gap | Problem framing — 10:47pm, no one to call |
| How It Works | 3 steps: Call → Listen → Remember |
| Meet Haven | AI persona, traits, voice examples |
| Three Wells of Wisdom | Faith / Philosophy / Practical |
| Pricing | 4 tiers with Stripe payment links |
| Testimonials | Social proof |
| FAQ | 8 common questions |
| Final CTA | Phone number + pricing CTA |
| Footer | Links, legal, 988 crisis line |

---

## Design System

| Token | Value | Use |
|-------|-------|-----|
| `haven-void` | `#080f0b` | Page background |
| `haven-cream` | `#f4ede0` | Primary text |
| `haven-gold` | `#c9943a` | Accent, CTA, highlights |
| `haven-sage` | `#5f8c6e` | Secondary text |
| `haven-green` | `#1e4a2c` | Card backgrounds, buttons |

Fonts: **Cormorant Garamond** (display) + **Source Serif 4** (body) — loaded from Google Fonts.

---

## Legal Notes

The site includes the required disclaimer on every pricing section and the footer:
> "UtalkWe Listen is an AI guidance service and not a licensed counselor or therapist."

You will need to create:
- `/app/privacy/page.tsx` — Privacy Policy
- `/app/terms/page.tsx` — Terms of Service
- `/app/disclaimer/page.tsx` — AI Disclaimer

These are linked in the footer. Consult a lawyer for the actual content.
