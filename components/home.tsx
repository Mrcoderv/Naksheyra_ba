'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Calculator,
  Check,
  ChevronDown,
  FileCheck2,
  Landmark,
  Mail,
  MapPin,
  Menu,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react'

const serviceIcons = [BarChart3, Calculator, ShieldCheck, BriefcaseBusiness, Landmark, Sparkles]
const BRAND_NAME = 'NAKSHATRA'
const BRAND_LOGO = '/nakshatra-logo.png'
const on = (list: any[]) => (Array.isArray(list) ? list.filter((x) => x && x.enabled !== false) : [])
const show = (section: any) => !!section && section.enabled !== false

export default function Home({ initial }: { initial: any }) {
  const [content, setContent] = useState(initial)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(0)
  const [video, setVideo] = useState<any | null>(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await fetch('/api/content', { cache: 'no-store' })
        const data = await res.json()
        if (alive) setContent(data)
      } catch {}
    }
    const id = setInterval(load, 5000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  const c = content || {}
  const brand = c.brand || {}
  const hero = c.hero || {}
  const services = on(c.services?.items)
  const steps = on(c.approach?.steps)
  const team = on(c.directorAndTeam?.members)
  const achievements = on(c.achievements?.items)
  const gallery = on(c.gallery?.items)
  const videos = on(c.highlightedVideo?.items)
  const testimonials = on(c.testimonials?.items)
  const posts = on(c.posts?.items)
  const faqs = on(c.faqs?.items)
  const contact = c.contact || {}
  const footer = c.footer || {}

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f9fa] text-[#0b1b3d]">
      {show(c.topBar) && (
        <div className="bg-[#0b1b3d] px-5 py-2 text-center text-[11px] font-semibold tracking-[0.16em] text-white/80 sm:text-xs">
          {c.topBar.text}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-[#0b1b3d]/10 bg-[#f8f9fa]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Nakshatra Business Advisory home">
            <Image src={BRAND_LOGO} alt={`${BRAND_NAME} logo`} width={72} height={52} className="h-12 w-auto object-contain" unoptimized />
            <div className="hidden border-l border-[#0b1b3d]/15 pl-3 sm:block">
              <div className="text-[13px] font-extrabold tracking-[0.18em]">{BRAND_NAME}</div>
              <div className="text-[9px] font-bold tracking-[0.16em] text-[#6e0e14]">{brand.tagline}</div>
            </div>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex" aria-label="Main navigation">
            <a href="#services" className="transition-colors hover:text-[#0a7e39]">Services</a>
            <a href="#approach" className="transition-colors hover:text-[#0a7e39]">Our approach</a>
            <a href="#director" className="transition-colors hover:text-[#0a7e39]">About us</a>
            <a href="#insights" className="transition-colors hover:text-[#0a7e39]">Insights</a>
          </nav>
          <a href="#contact" className="hidden rounded-full bg-[#0a7e39] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(10,126,57,0.18)] transition-transform hover:-translate-y-0.5 sm:inline-flex">
            Book a consultation <ArrowRight className="ml-2 size-4" />
          </a>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="rounded-full border border-[#0b1b3d]/15 p-2 lg:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-[#0b1b3d]/10 px-5 py-4 lg:hidden">
            {[['#services', 'Services'], ['#approach', 'Our approach'], ['#director', 'About us'], ['#contact', 'Book a consultation']].map(([href, label]) => (
              <a key={href} className="rounded-lg px-3 py-3 font-semibold hover:bg-white" href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
          </nav>
        )}
      </header>

      {show(c.hero) && (
        <section id="top" className="relative mx-auto grid max-w-7xl items-center gap-12 overflow-hidden px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-28 lg:pt-24">
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#6e0e14]/20 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#6e0e14]">
              <Sparkles className="size-3.5 text-[#0a7e39]" /> {hero.eyebrow}
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              {hero.title}
              <br />
              <span className="text-[#0a7e39]">{hero.highlight}</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#0b1b3d]/65">{hero.subtitle}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={hero.primaryHref || '#contact'} className="inline-flex items-center rounded-full bg-[#0b1b3d] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#0a7e39]">
                {hero.primaryLabel} <ArrowRight className="ml-3 size-4" />
              </a>
              <a href={hero.secondaryHref || '#services'} className="inline-flex items-center rounded-full border border-[#0b1b3d]/20 bg-white px-6 py-4 text-sm font-bold hover:border-[#0a7e39]">
                {hero.secondaryLabel}
              </a>
            </div>
            <div className="mt-12 flex items-center gap-3 text-sm text-[#0b1b3d]/60">
              <div className="flex -space-x-2">
                <div className="grid size-8 place-items-center rounded-full border-2 border-[#f8f9fa] bg-[#6e0e14] text-xs font-bold text-white">P</div>
                <div className="grid size-8 place-items-center rounded-full border-2 border-[#f8f9fa] bg-[#0a7e39] text-xs font-bold text-white">N</div>
                <div className="grid size-8 place-items-center rounded-full border-2 border-[#f8f9fa] bg-[#0b1b3d] text-xs font-bold text-white">+</div>
              </div>
              <span>Trusted by founders and teams across Nepal</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -right-5 -top-5 z-10 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur">
              <div className="text-2xl font-black text-[#0a7e39]">{hero.statValue}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#0b1b3d]/50">{hero.statLabel}</div>
            </div>
            <div className="relative overflow-hidden rounded-[34px] bg-[#0b1b3d] p-3 shadow-2xl shadow-[#0b1b3d]/20">
              <div className="rounded-[26px] border border-white/10 bg-gradient-to-br from-[#17305e] to-[#0b1b3d] px-7 pb-8 pt-10 sm:px-12 sm:pt-14">
                <div className="mb-12 flex items-center justify-between text-white/50">
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">NBA / Advisory brief</span>
                  <span className="text-xs">2024—25</span>
                </div>
                <div className="mb-20">
                  <div className="mb-5 text-sm font-semibold text-[#7bc497]">A clearer view forward</div>
                  <div className="max-w-sm text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                    Good advice makes growth feel <span className="text-[#7bc497]">possible.</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-wrap gap-2">
                    {['Finance', 'Tax', 'Strategy'].map((t) => (
                      <span key={t} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/75">{t}</span>
                    ))}
                  </div>
                  <div className="grid size-16 place-items-center rounded-full bg-[#0a7e39] text-white"><ArrowRight className="size-6 -rotate-45" /></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 rounded-2xl border border-[#0b1b3d]/10 bg-white p-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0b1b3d]/60"><Check className="size-4 text-[#0a7e39]" /> Built for long-term value</div>
            </div>
          </div>
        </section>
      )}

      {show(c.achievements) && achievements.length > 0 && (
        <section className="border-y border-[#0b1b3d]/10 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-[#0b1b3d]/10 px-5 py-8 sm:grid-cols-4 lg:px-8">
            {achievements.map((a: any) => (
              <div key={a.id || a.label} className="px-4 text-center sm:text-left">
                <div className="text-3xl font-black">{a.value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#0b1b3d]/50">{a.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {show(c.services) && services.length > 0 && (
        <section id="services" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#6e0e14]">{c.services.eyebrow}</div>
              <h2 className="max-w-xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">{c.services.title}</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s: any, i: number) => {
              const Icon = serviceIcons[i % serviceIcons.length]
              return (
                <article key={s.id || s.title} className="group rounded-3xl border border-[#0b1b3d]/10 bg-white p-7 transition-all hover:-translate-y-1 hover:border-[#0a7e39]/40 hover:shadow-xl hover:shadow-[#0b1b3d]/5">
                  <div className="flex items-start justify-between">
                    <div className="grid size-12 place-items-center rounded-2xl bg-[#0b1b3d] text-white transition-colors group-hover:bg-[#0a7e39]"><Icon className="size-5" /></div>
                    <span className="text-sm font-bold text-[#0b1b3d]/30">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-12 text-2xl font-black">{s.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#0b1b3d]/60">{s.summary || s.text}</p>
                  <a href="#contact" className="mt-7 inline-flex items-center text-sm font-bold text-[#0a7e39]">Talk to an advisor <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" /></a>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {show(c.approach) && (
        <section id="approach" className="bg-[#0b1b3d] px-5 py-24 text-white lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#7bc497]">{c.approach.eyebrow}</div>
              <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">{c.approach.title}</h2>
              <p className="mt-6 max-w-md leading-8 text-white/60">{c.approach.subtitle}</p>
              <a href={c.approach.ctaHref || '#contact'} className="mt-8 inline-flex items-center rounded-full bg-[#0a7e39] px-5 py-3 text-sm font-bold text-white hover:bg-[#149a4c]">
                {c.approach.ctaLabel} <ArrowRight className="ml-2 size-4" />
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map((s: any, i: number) => (
                <div key={s.id || s.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-16 text-4xl font-black text-[#7bc497]">{String(i + 1).padStart(2, '0')}</div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/50">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {show(c.directorAndTeam) && team.length > 0 && (
        <section id="director" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#6e0e14]">{c.directorAndTeam.eyebrow}</div>
          <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">{c.directorAndTeam.title}</h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#0b1b3d]/65">{c.directorAndTeam.subtitle}</p>
          <TeamSlider team={team} />
        </section>
      )}

      {show(c.gallery) && gallery.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#6e0e14]">{c.gallery.eyebrow}</div>
          <h2 className="mb-10 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{c.gallery.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((g: any) => (
              <figure key={g.id || g.imageUrl} className="overflow-hidden rounded-3xl border border-[#0b1b3d]/10 bg-white">
                <Image src={g.imageUrl} alt={g.caption || 'Gallery image'} width={600} height={420} className="h-56 w-full object-cover" unoptimized />
                {g.caption && <figcaption className="px-5 py-4 text-sm text-[#0b1b3d]/60">{g.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {show(c.highlightedVideo) && videos.length > 0 && (
        <section id="insights" className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#6e0e14]">{c.highlightedVideo.eyebrow}</div>
          <h2 className="mb-10 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{c.highlightedVideo.title}</h2>
          <div className="grid gap-8">
            {videos.map((v: any) => (
              <div key={v.id || v.embedUrl} className="grid gap-6 rounded-[32px] bg-[#6e0e14] p-8 text-white sm:p-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f1b9b9]"><Play className="size-4 fill-current" /> Advisory insights</div>
                  <h3 className="text-3xl font-black tracking-tight">{v.title}</h3>
                  <p className="mt-4 max-w-lg leading-7 text-white/70">{v.description}</p>
                  <button type="button" onClick={() => setVideo(v)} className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#6e0e14] hover:bg-[#fbeeee]">
                    Watch the briefing <Play className="ml-2 size-4 fill-current" />
                  </button>
                </div>
                <button type="button" onClick={() => setVideo(v)} className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  <span className="grid h-full place-items-center"><span className="grid size-16 place-items-center rounded-full bg-[#0a7e39] transition-transform group-hover:scale-110"><Play className="size-6 fill-current" /></span></span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {show(c.testimonials) && testimonials.length > 0 && (
        <section className="bg-white px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#6e0e14]">{c.testimonials.eyebrow}</div>
            <h2 className="mb-10 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{c.testimonials.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {testimonials.map((t: any) => (
                <article key={t.id || t.quote} className="rounded-3xl border border-[#0b1b3d]/10 bg-[#f8f9fa] p-7">
                  <div className="flex gap-1 text-[#0a7e39]">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-4 fill-current" />)}</div>
                  <p className="mt-4 text-lg leading-8 text-[#0b1b3d]/75">“{t.quote}”</p>
                  <div className="mt-6 font-bold">{t.clientName}</div>
                  <div className="text-sm text-[#0b1b3d]/55">{t.company}</div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {show(c.posts) && posts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#6e0e14]">{c.posts.eyebrow}</div>
          <h2 className="mb-10 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{c.posts.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p: any) => (
              <a key={p.id || p.title} href={p.downloadUrl || '#contact'} className="group rounded-3xl border border-[#0b1b3d]/10 bg-white p-7 transition-all hover:-translate-y-1 hover:border-[#0a7e39]/40 hover:shadow-xl hover:shadow-[#0b1b3d]/5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0a7e39]">{p.category}</div>
                <h3 className="mt-4 text-xl font-black">{p.title}</h3>
                <div className="mt-3 text-sm text-[#0b1b3d]/50">{p.publicationDate}</div>
                <div className="mt-6 inline-flex items-center text-sm font-bold text-[#0a7e39]">Read / Download <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" /></div>
              </a>
            ))}
          </div>
        </section>
      )}

      {show(c.faqs) && faqs.length > 0 && (
        <section className="bg-white px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#6e0e14]">{c.faqs.eyebrow}</div>
                <h2 className="text-4xl font-black tracking-tight">{c.faqs.title}</h2>
              </div>
              <div className="divide-y divide-[#0b1b3d]/10 border-y border-[#0b1b3d]/10">
                {faqs.map((f: any, index: number) => (
                  <div key={f.id || f.question} className="py-5">
                    <button type="button" onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="flex w-full items-center justify-between text-left font-bold">
                      <span>{f.question}</span>
                      <ChevronDown className={`size-5 shrink-0 text-[#0a7e39] transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
                    </button>
                    {activeFaq === index && <p className="mt-3 max-w-2xl pr-8 text-sm leading-7 text-[#0b1b3d]/60">{f.answer}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {show(c.contact) && (
        <section id="contact" className="bg-[#e8eee9] px-5 py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#6e0e14]">{contact.eyebrow}</div>
              <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">{contact.title}</h2>
              <p className="mt-5 max-w-md leading-7 text-[#0b1b3d]/60">{contact.subtitle}</p>
              <div className="mt-8 flex items-center gap-3 text-sm font-semibold">
                <div className="grid size-10 place-items-center rounded-full bg-[#0a7e39] text-white"><FileCheck2 className="size-4" /></div>
                {contact.note}
              </div>
              <div className="mt-8 space-y-2 text-sm text-[#0b1b3d]/70">
                {contact.address && <div className="flex items-center gap-2"><MapPin className="size-4 text-[#0a7e39]" /> {contact.address}</div>}
                {contact.email && <div className="flex items-center gap-2"><Mail className="size-4 text-[#0a7e39]" /> {contact.email}</div>}
                {contact.phone && <div className="flex items-center gap-2"><Phone className="size-4 text-[#0a7e39]" /> {contact.phone}</div>}
              </div>
            </div>
            <form className="rounded-3xl bg-white p-6 shadow-xl shadow-[#0b1b3d]/5 sm:p-8" action="https://api.web3forms.com/submit" method="POST">
              <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY" />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">Your name<input name="name" required className="mt-2 w-full rounded-xl border border-[#0b1b3d]/15 bg-[#f8f9fa] px-4 py-3 font-normal outline-none transition focus:border-[#0a7e39]" placeholder="Your name" /></label>
                <label className="text-sm font-semibold">Email address<input name="email" type="email" required className="mt-2 w-full rounded-xl border border-[#0b1b3d]/15 bg-[#f8f9fa] px-4 py-3 font-normal outline-none transition focus:border-[#0a7e39]" placeholder="you@company.com" /></label>
              </div>
              <label className="mt-4 block text-sm font-semibold">How can we help?<textarea name="message" required rows={4} className="mt-2 w-full resize-none rounded-xl border border-[#0b1b3d]/15 bg-[#f8f9fa] px-4 py-3 font-normal outline-none transition focus:border-[#0a7e39]" placeholder="Tell us about your goals..." /></label>
              <button type="submit" className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#0a7e39] px-5 py-4 font-bold text-white transition-colors hover:bg-[#0b1b3d]">Send enquiry <ArrowRight className="ml-2 size-4" /></button>
            </form>
          </div>
          {contact.mapUrl && (
            <div className="mx-auto mt-12 max-w-7xl overflow-hidden rounded-3xl border border-[#0b1b3d]/10 bg-white shadow-xl shadow-[#0b1b3d]/5">
              <iframe
                src={contact.mapUrl}
                title={contact.mapTitle || 'Office location map'}
                className="h-80 w-full sm:h-96"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          )}
        </section>
      )}

      {show(c.footer) && (
        <footer className="bg-[#0b1b3d] px-5 py-10 text-white lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <div className="text-lg font-black tracking-[0.12em]">{BRAND_NAME}</div>
              <div className="mt-1 text-xs font-bold tracking-[0.16em] text-[#7bc497]">{footer.tagline}</div>
              <p className="mt-5 text-sm text-white/50">{footer.note}</p>
            </div>
            <div className="text-left text-sm text-white/55 sm:text-right">
              <div>{contact.address}</div>
              <div className="mt-2">{contact.email}</div>
              <div className="mt-6 text-xs text-white/30">{footer.copyright}</div>
            </div>
          </div>
        </footer>
      )}

      {video && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1b3d]/80 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={video.title}>
          <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <button type="button" onClick={() => setVideo(null)} className="absolute right-3 top-3 z-10 rounded-full bg-white/15 p-2 text-white" aria-label="Close video"><X className="size-5" /></button>
            <iframe src={video.embedUrl} title={video.title} className="h-full w-full" allowFullScreen />
          </div>
        </div>
      )}

      {show(c.notificationPopup) && <Notice popup={c.notificationPopup} />}
    </main>
  )
}

function TeamSlider({ team }: { team: any[] }) {
  const viewport = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const el = viewport.current
    const card = el?.firstElementChild as HTMLElement | null
    if (!el || !card) return
    const gap = 24
    const measure = card.getBoundingClientRect().width + gap
    setStep(measure)
    if (team.length < 2) return
    const id = setInterval(() => {
      if (el.scrollWidth <= el.clientWidth + 4) return
      if (el.scrollLeft + measure >= el.scrollWidth - 4) el.scrollTo({ left: 0, behavior: 'smooth' })
      else el.scrollBy({ left: measure, behavior: 'smooth' })
    }, 5000)
    return () => clearInterval(id)
  }, [team.length])

  const move = (dir: number) => viewport.current?.scrollBy({ left: dir * step, behavior: 'smooth' })

  return (
    <div className="mt-10">
      <div
        ref={viewport}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {team.map((m: any) => (
          <article
            key={m.id || m.name}
            className="w-full shrink-0 snap-start rounded-3xl border border-[#0b1b3d]/10 bg-white p-7 sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
          >
            {m.imageUrl && <Image src={m.imageUrl} alt={m.name} width={80} height={80} className="mb-5 size-20 object-contain" unoptimized />}
            <h3 className="text-xl font-black">{m.name}</h3>
            <div className="mt-1 text-sm font-bold text-[#0a7e39]">{m.title}</div>
            <p className="mt-3 text-sm leading-7 text-[#0b1b3d]/60">{m.bio}</p>
          </article>
        ))}
      </div>
      {team.length > 1 && (
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={() => move(-1)} aria-label="Previous team member" className="grid size-11 place-items-center rounded-full border border-[#0b1b3d]/15 bg-white text-2xl leading-none transition-colors hover:bg-[#0a7e39] hover:text-white">‹</button>
          <button type="button" onClick={() => move(1)} aria-label="Next team member" className="grid size-11 place-items-center rounded-full border border-[#0b1b3d]/15 bg-white text-2xl leading-none transition-colors hover:bg-[#0a7e39] hover:text-white">›</button>
        </div>
      )}
    </div>
  )
}

function Notice({ popup }: { popup: any }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    try {
      if (sessionStorage.getItem('nba_notice') !== 'seen') setOpen(true)
    } catch {}
  }, [])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1b3d]/70 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={popup.title}>
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full bg-[#0b1b3d]/5 p-2" aria-label="Close"><X className="size-5" /></button>
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#6e0e14]">NBA update</div>
        <h2 className="mt-3 text-2xl font-black">{popup.title}</h2>
        <p className="mt-3 leading-7 text-[#0b1b3d]/65">{popup.message}</p>
        <a href={popup.documentUrl} onClick={() => { try { sessionStorage.setItem('nba_notice', 'seen') } catch {} }} className="mt-6 inline-flex items-center rounded-full bg-[#0a7e39] px-5 py-3 text-sm font-bold text-white">
          {popup.buttonLabel} <ArrowRight className="ml-2 size-4" />
        </a>
      </div>
    </div>
  )
}
