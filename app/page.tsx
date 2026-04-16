"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Message { role: "user" | "assistant"; content: string; }

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, 2200, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className="stat-card"
    >
      <div className="stat-number">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ─── SECTION REVEAL ──────────────────────────────────────────────────────────
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal-block ${vis ? "revealed" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to Dubai Mall. I'm your dedicated sales concierge. Ask me about leasing, sponsorships, or event bookings." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async (text: string) => {
  if (!text.trim() || loading) return;

  const userMsg: Message = { role: "user", content: text };

  setMessages(prev => [...prev, userMsg]);
  setInput("");
  setLoading(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [...messages, userMsg]
      })
    });

    const data = await res.json();

    setMessages(prev => [
      ...prev,
      { role: "assistant", content: data.reply }
    ]);

  } catch (err) {
    setMessages(prev => [
      ...prev,
      { role: "assistant", content: "Server error. Try again." }
    ]);
  }

  setLoading(false);
}, [messages, loading]);

  const quickTaps = ["Retail leasing", "Event venues", "Sponsorship tiers", "Visitor demographics"];

  return (
    <div className="chatbot-wrap">
      <button className="chat-toggle" onClick={() => setOpen(o => !o)}>
        {open ? "✕" : "CONCIERGE AI"}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span className="chat-dot" />
            Sales Concierge
          </div>

          <div className="chat-quick">
            {quickTaps.map(q => (
              <button key={q} className="quick-pill" onClick={() => send(q)}>{q}</button>
            ))}
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg msg-${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="msg msg-assistant">
                <span className="typing-dots"><span /><span /><span /></span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="Ask anything…"
              className="chat-input"
            />
            <button className="chat-send" onClick={() => send(input)}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "hero", label: "Home" },
  { id: "why", label: "Why Dubai Mall" },
  { id: "retail", label: "Retail" },
  { id: "events", label: "Events" },
  { id: "leasing", label: "Lease" },
  { id: "contact", label: "Contact" },
];

function Nav({ active }: { active: string }) {
  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <nav className="nav">
      <div className="nav-logo">DUBAI MALL</div>
      <div className="nav-links">
        {NAV_ITEMS.map(n => (
          <button
            key={n.id}
            className={`nav-link ${active === n.id ? "active" : ""}`}
            onClick={() => scroll(n.id)}
          >
            {n.label}
          </button>
        ))}
      </div>
      <button className="nav-cta" onClick={() => scroll("contact")}>Book a Call</button>
    </nav>
  );
}

// ─── LEASING CARD ────────────────────────────────────────────────────────────
const LEASING_TIERS = [
  {
    tier: "Flagship",
    tag: "PRIME LOCATIONS",
    desc: "Premium positioning in high-footfall corridors. Ideal for global luxury houses and flagship launches.",
    features: ["Ground & first floor priority", "Custom fit-out support", "Co-marketing inclusion", "VIP tenant concierge"],
    cta: "Request Flagship Pack",
  },
  {
    tier: "Pop-Up",
    tag: "FLEXIBLE TERMS",
    desc: "Short-term, high-impact presence. Perfect for brand activations, product drops, and test markets.",
    features: ["1 week – 6 month terms", "Fully built spaces available", "Prime placement options", "Activation support"],
    cta: "Enquire Now",
  },
  {
    tier: "F&B",
    tag: "CULINARY DISTRICT",
    desc: "Join 200+ restaurants in the world's most visited dining destination. Multiple zones from casual to fine dining.",
    features: ["Multiple dining zones", "Outdoor terrace options", "High-volume foot traffic", "Anchor F&B opportunities"],
    cta: "F&B Leasing Pack",
  },
];

// ─── EVENT MODULES ────────────────────────────────────────────────────────────
const EVENTS = [
  { title: "Grand Atrium", cap: "5,000", area: "12,000 sq ft", type: "Concerts · Award Shows · Product Launches" },
  { title: "Expo Hall", cap: "15,000", area: "50,000 sq ft", type: "Conventions · Trade Shows · Brand Expos" },
  { title: "Open Plaza", cap: "20,000+", area: "Outdoor", type: "Festivals · Film Screenings · Cultural Events" },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeSection, setActiveSection] = useState("hero");
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track active section for nav
  useEffect(() => {
    const sections = NAV_ITEMS.map(n => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { threshold: 0.4 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setTimeout(() => setHeroLoaded(true), 200);
  }, []);

  // Parallax mouse track
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <style>{CSS}</style>
      <Nav active={activeSection} />

      {/* ── HERO ── */}
      <section id="hero" className="hero">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/mall.mp4" type="video/mp4" />
        </video>
        <div className="hero-grain" />
        <div className="hero-overlay" />

        {/* Parallax orbs */}
        <div
          className="orb orb-1"
          style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)` }}
        />
        <div
          className="orb orb-2"
          style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
        />

        <div className={`hero-content ${heroLoaded ? "hero-loaded" : ""}`}>
          <div className="hero-eyebrow">EST. 2008 · DUBAI, UAE</div>
          <h1 className="hero-title">
            The World's Most<br />
            <em>Visited</em> Destination
          </h1>
          <p className="hero-sub">
            Where 100 million people converge each year.<br />
            Where brands become icons.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => scroll("leasing")}>Lease Space</button>
            <button className="btn-ghost" onClick={() => scroll("events")}>Book a Venue</button>
          </div>
          <div className="hero-scroll-hint" onClick={() => scroll("why")}>
            <span>Scroll</span>
            <div className="scroll-line" />
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section id="why" className="section-why section-bg">
        <div className="section-inner">
          <Reveal>
            <div className="section-eyebrow">THE NUMBERS</div>
            <h2 className="section-title">Scale That<br />Defines a City</h2>
          </Reveal>

          <div className="stats-grid">
            <StatCard value={100} suffix="M+" label="Annual Visitors" delay={0} />
            <StatCard value={1200} suffix="+" label="Global Brands" delay={150} />
            <StatCard value={59} suffix="M" label="Square Feet" delay={300} />
            <StatCard value={200} suffix="+" label="Dining Venues" delay={450} />
          </div>

          <Reveal delay={200}>
            <div className="why-body">
              <p className="why-text">
                Dubai Mall isn't a shopping centre. It's the commercial heart of a city that has become
                the world's crossroads — where East meets West, where luxury meets aspiration, and where
                a single presence reaches audiences from 190+ nations simultaneously.
              </p>
              <div className="why-flags">
                <div className="flag-stat"><strong>190+</strong><span>Nationalities</span></div>
                <div className="flag-stat"><strong>#1</strong><span>Most Visited Mall Globally</span></div>
                <div className="flag-stat"><strong>$2.5B+</strong><span>Annual Retail Sales</span></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── RETAIL ── */}
      <section id="retail" className="section-retail">
        <div className="retail-marquee-wrap">
          <div className="retail-marquee">
            {["CHANEL", "LOUIS VUITTON", "GUCCI", "ROLEX", "HERMÈS", "DIOR", "PRADA", "APPLE", "VALENTINO", "BURBERRY",
              "CHANEL", "LOUIS VUITTON", "GUCCI", "ROLEX", "HERMÈS", "DIOR", "PRADA", "APPLE", "VALENTINO", "BURBERRY"].join(" · ")}
          </div>
        </div>

        <div className="section-inner">
          <Reveal>
            <div className="section-eyebrow">RETAIL ENVIRONMENT</div>
            <h2 className="section-title">Where Every Major<br />Brand Calls Home</h2>
          </Reveal>

          <div className="retail-grid">
  {[
    { title: "Global Luxury Brands", img: "/retail1.jpg" },
    { title: "Immersive Shopping Spaces", img: "/retail2.jpg" },
    { title: "Premium Experience", img: "/retail3.jpg" },
  ].map((item, i) => (
    <Reveal key={i} delay={i * 120}>
      <div
        className="image-card"
        style={{ backgroundImage: `url(${item.img})` }}
      >
        <div className="image-overlay">
          {item.title}
        </div>
      </div>
    </Reveal>
  ))}
</div>
        </div>
      </section>

      {/* ── ATTRACTIONS ── */}
      <section className="section-attractions">
        <div className="section-inner">
          <Reveal>
            <div className="section-eyebrow">BEYOND RETAIL</div>
            <h2 className="section-title">Attractions That<br />Move Millions</h2>
          </Reveal>

          <div className="attr-list">
            {[
              { name: "Dubai Aquarium & Underwater Zoo", visitors: "3M+/yr", icon: "🦈" },
              { name: "Dubai Ice Rink", visitors: "Olympic-size", icon: "⛸" },
              { name: "VR Park — 30+ experiences", visitors: "Fully Immersive", icon: "🥽" },
              { name: "KidZania Dubai", visitors: "Kids' City", icon: "🏙" },
              { name: "Dubai Fountain — World's Largest", visitors: "6,000 lights", icon: "💧" },
              { name: "At the Top — Burj Khalifa", visitors: "Connected", icon: "🏙" },
            ].map((a, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="attr-row">
                  <span className="attr-icon">{a.icon}</span>
                  <span className="attr-name">{a.name}</span>
                  <span className="attr-visitors">{a.visitors}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section id="events" className="section-events">
        <div className="section-inner">
          <Reveal>
            <div className="section-eyebrow">EVENTS PLATFORM</div>
            <h2 className="section-title">A Stage for the<br />World's Biggest Moments</h2>
          </Reveal>

          <div className="events-grid">
  {[
    { title: "Global Events & Concerts", img: "/event1.jpg" },
    { title: "Brand Activations", img: "/event2.jpg" },
    { title: "Dubai Shopping Festival", img: "/event3.jpg" },
  ].map((item, i) => (
    <Reveal key={i} delay={i * 150}>
      <div
        className="image-card"
        style={{ backgroundImage: `url(${item.img})` }}
      >
        <div className="image-overlay">
          {item.title}
        </div>
      </div>
    </Reveal>
  ))}
</div>

          <Reveal delay={200}>
            <div className="events-highlights">
              <div className="highlight-item">
                <strong>Dubai Shopping Festival</strong>
                <span>35M+ visitors · 30-day retail celebration</span>
              </div>
              <div className="highlight-item">
                <strong>Global Brand Activations</strong>
                <span>Ferrari · Samsung · Rolex · Cartier</span>
              </div>
              <div className="highlight-item">
                <strong>Concerts & Live Performances</strong>
                <span>World-class entertainment programming</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── LEASING ── */}
      <section id="leasing" className="section-leasing">
        <div className="section-inner">
          <Reveal>
            <div className="section-eyebrow">LEASING PATHS</div>
            <h2 className="section-title">Your Space.<br />Your Terms.</h2>
          </Reveal>

          <div className="leasing-grid">
            {LEASING_TIERS.map((t, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="lease-card">
                  <div className="lease-tag">{t.tag}</div>
                  <h3 className="lease-tier">{t.tier}</h3>
                  <p className="lease-desc">{t.desc}</p>
                  <ul className="lease-features">
                    {t.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  <button className="lease-btn" onClick={() => scroll("contact")}>{t.cta} →</button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT / CTA ── */}
      <section id="contact" className="section-contact">
        <div className="contact-bg-text">DUBAI MALL</div>
        <div className="section-inner contact-inner">
          <Reveal>
            <div className="section-eyebrow">READY TO BEGIN?</div>
            <h2 className="section-title contact-title">Let's Build<br />Your Presence Here</h2>
            <p className="contact-sub">
              Our commercial team will reach out within 24 hours. Every deal is tailored.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="contact-form">
              <div className="form-row">
                <input className="form-input" placeholder="Your Name" />
                <input className="form-input" placeholder="Company" />
              </div>
              <div className="form-row">
                <input className="form-input" placeholder="Email Address" />
                <select className="form-input form-select">
                  <option value="">Enquiry Type</option>
                  <option>Retail Leasing</option>
                  <option>Pop-Up Space</option>
                  <option>Event / Venue Booking</option>
                  <option>Sponsorship / Brand Partnership</option>
                  <option>F&B Leasing</option>
                </select>
              </div>
              <textarea className="form-input form-textarea" placeholder="Tell us about your brand and what you're looking for…" />
              <button className="form-submit">Submit Enquiry →</button>
            </div>
          </Reveal>

          <div className="contact-direct">
            <a href="mailto:commercial@dubaimall.com">commercial@dubaimall.com</a>
            <span>·</span>
            <span>+971 4 362 7500</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-logo">DUBAI MALL</div>
        <div className="footer-tagline">Downtown Dubai · United Arab Emirates</div>
        <div className="footer-links">
          <span>© 2024 Emaar Malls</span>
          <span>·</span>
          <a href="#">Privacy</a>
          <span>·</span>
          <a href="#">Terms</a>
        </div>
      </footer>

      <Chatbot />
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Barlow:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #C9A96E;
    --gold-light: #E8D5B0;
    --black: #080808;
    --white: #F5F3EF;
    --grey: #1A1A1A;
    --mid: #888;
    --ff-display: 'Cormorant Garamond', serif;
    --ff-body: 'Barlow', sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--black);
    color: var(--white);
    font-family: var(--ff-body);
    overflow-x: hidden;
  }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px;
    background: linear-gradient(to bottom, rgba(8,8,8,0.9) 0%, transparent 100%);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(201,169,110,0.15);
  }
  .nav-logo {
    font-family: var(--ff-display);
    font-size: 1.2rem;
    letter-spacing: 0.25em;
    color: var(--gold);
  }
  .nav-links { display: flex; gap: 32px; }
  .nav-link {
    background: none; border: none; cursor: pointer;
    font-family: var(--ff-body); font-size: 0.75rem; letter-spacing: 0.15em;
    text-transform: uppercase; color: rgba(245,243,239,0.6);
    transition: color 0.3s;
  }
  .nav-link:hover, .nav-link.active { color: var(--gold); }
  .nav-cta {
    background: var(--gold); color: var(--black);
    border: none; cursor: pointer;
    font-family: var(--ff-body); font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.15em; text-transform: uppercase;
    padding: 10px 24px; border-radius: 2px;
    transition: background 0.3s;
  }
  .nav-cta:hover { background: var(--gold-light); }

  /* ── HERO ── */
  .hero {
    position: relative; height: 100vh;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .hero-video {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; opacity: 0.5;
  }
  .hero-grain {
    position: absolute; inset: 0; z-index: 1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.6; pointer-events: none;
  }
  .hero-overlay {
    position: absolute; inset: 0; z-index: 2;
    background: linear-gradient(135deg, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.3) 50%, rgba(8,8,8,0.7) 100%);
  }
  .orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: 0.12;
    transition: transform 0.1s linear; z-index: 2; pointer-events: none;
  }
  .orb-1 { width: 600px; height: 600px; background: var(--gold); top: -100px; left: -100px; }
  .orb-2 { width: 400px; height: 400px; background: #8B6914; bottom: -50px; right: -50px; }
  .hero-content {
    position: relative; z-index: 3;
    text-align: center; padding: 0 24px;
    opacity: 0; transform: translateY(40px);
    transition: opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1);
  }
  .hero-content.hero-loaded { opacity: 1; transform: translateY(0); }
  .hero-eyebrow {
    font-size: 0.65rem; letter-spacing: 0.35em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 24px;
    transition-delay: 0.2s;
  }
  .hero-title {
    font-family: var(--ff-display); font-size: clamp(3rem, 8vw, 7rem);
    font-weight: 300; line-height: 1.0; margin-bottom: 28px;
    color: var(--white);
  }
  .hero-title em { font-style: italic; color: var(--gold); }
  .hero-sub {
    font-size: 1rem; font-weight: 300; line-height: 1.7;
    color: rgba(245,243,239,0.7); margin-bottom: 48px;
    max-width: 480px; margin-inline: auto;
  }
  .hero-actions { display: flex; gap: 16px; justify-content: center; margin-bottom: 72px; }
  .btn-primary {
    background: var(--gold); color: var(--black);
    border: none; cursor: pointer;
    font-family: var(--ff-body); font-size: 0.75rem; font-weight: 600;
    letter-spacing: 0.15em; text-transform: uppercase;
    padding: 16px 40px; border-radius: 2px;
    transition: background 0.3s, transform 0.2s;
  }
  .btn-primary:hover { background: var(--gold-light); transform: translateY(-2px); }
  .btn-ghost {
    background: transparent; color: var(--white);
    border: 1px solid rgba(245,243,239,0.4); cursor: pointer;
    font-family: var(--ff-body); font-size: 0.75rem; font-weight: 400;
    letter-spacing: 0.15em; text-transform: uppercase;
    padding: 16px 40px; border-radius: 2px;
    transition: border-color 0.3s, color 0.3s, transform 0.2s;
  }
  .btn-ghost:hover { border-color: var(--gold); color: var(--gold); transform: translateY(-2px); }
  .hero-scroll-hint {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    cursor: pointer; opacity: 0.5;
    font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
    transition: opacity 0.3s;
  }
  .hero-scroll-hint:hover { opacity: 1; }
  .scroll-line {
    width: 1px; height: 40px;
    background: linear-gradient(to bottom, var(--gold), transparent);
    animation: scrollPulse 2s ease-in-out infinite;
  }
  @keyframes scrollPulse {
    0%, 100% { transform: scaleY(1); opacity: 1; }
    50% { transform: scaleY(0.5); opacity: 0.4; }
  }

  /* ── REVEAL ── */
  .reveal-block {
    opacity: 0; transform: translateY(32px);
    transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal-block.revealed { opacity: 1; transform: translateY(0); }

  /* ── SHARED SECTION ── */
  .section-inner { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
  .section-eyebrow {
    font-size: 0.65rem; letter-spacing: 0.35em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 16px;
  }
  .section-title {
    font-family: var(--ff-display); font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-weight: 300; line-height: 1.1; margin-bottom: 64px;
    color: var(--white);
  }

  /* ── STATS ── */
  .section-why { background: var(--black); padding: 140px 0; }
  .stats-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 2px; margin-bottom: 80px;
  }
  .stat-card {
    background: var(--grey); padding: 48px 32px;
    border: 1px solid rgba(201,169,110,0.1);
    transition: border-color 0.3s, background 0.3s;
  }
  .stat-card:hover { border-color: var(--gold); background: rgba(201,169,110,0.05); }
  .stat-number {
    font-family: var(--ff-display); font-size: 3.5rem;
    font-weight: 300; color: var(--gold); margin-bottom: 8px;
  }
  .stat-label { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--mid); }
  .why-body { display: flex; gap: 80px; align-items: flex-start; }
  .why-text { flex: 1; font-size: 1.1rem; font-weight: 300; line-height: 1.8; color: rgba(245,243,239,0.7); }
  .why-flags { display: flex; flex-direction: column; gap: 32px; min-width: 200px; }
  .flag-stat { display: flex; flex-direction: column; gap: 4px; }
  .flag-stat strong { font-family: var(--ff-display); font-size: 2rem; color: var(--gold); }
  .flag-stat span { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mid); }

  /* ── RETAIL ── */
  .section-retail { background: #0D0D0D; padding: 140px 0; overflow: hidden; }
  .retail-marquee-wrap {
    overflow: hidden; border-top: 1px solid rgba(201,169,110,0.2);
    border-bottom: 1px solid rgba(201,169,110,0.2);
    padding: 20px 0; margin-bottom: 100px;
  }
  .retail-marquee {
    white-space: nowrap;
    font-size: 0.7rem; letter-spacing: 0.3em; color: var(--gold);
    animation: marquee 30s linear infinite;
  }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .retail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
  .retail-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(201,169,110,0.1);
    padding: 48px 36px;
    transition: background 0.4s, border-color 0.4s, transform 0.4s;
    cursor: default;
  }
  .retail-card:hover {
    background: rgba(201,169,110,0.06);
    border-color: var(--gold);
    transform: translateY(-4px);
  }
  .retail-card-tag { font-size: 0.6rem; letter-spacing: 0.3em; color: var(--gold); margin-bottom: 20px; }
  .retail-card-title {
    font-family: var(--ff-display); font-size: 2rem;
    font-weight: 300; margin-bottom: 16px;
  }
  .retail-card-desc { font-size: 0.9rem; font-weight: 300; line-height: 1.7; color: rgba(245,243,239,0.6); margin-bottom: 32px; }
  .retail-card-btn {
    background: none; border: none; cursor: pointer;
    font-family: var(--ff-body); font-size: 0.7rem; letter-spacing: 0.15em;
    text-transform: uppercase; color: var(--gold);
    padding: 0; transition: letter-spacing 0.3s;
  }
  .retail-card-btn:hover { letter-spacing: 0.25em; }

  /* ── ATTRACTIONS ── */
  .section-attractions { background: var(--black); padding: 140px 0; }
  .attr-list { display: flex; flex-direction: column; gap: 0; }
  .attr-row {
    display: flex; align-items: center; gap: 24px;
    padding: 28px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
    transition: background 0.3s; padding-inline: 16px;
  }
  .attr-row:hover { background: rgba(201,169,110,0.04); }
  .attr-icon { font-size: 1.5rem; width: 40px; text-align: center; }
  .attr-name { flex: 1; font-size: 1rem; font-weight: 300; }
  .attr-visitors { font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); }

  /* ── EVENTS ── */
  .section-events { background: #0A0A0A; padding: 140px 0; }
  .events-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 80px; }
  .event-card {
    background: rgba(201,169,110,0.04);
    border: 1px solid rgba(201,169,110,0.15);
    padding: 48px 36px;
    display: flex; flex-direction: column; gap: 12px;
    transition: border-color 0.3s, background 0.3s, transform 0.3s;
  }
  .event-card:hover { border-color: var(--gold); background: rgba(201,169,110,0.08); transform: translateY(-4px); }
  .event-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .event-venue { font-family: var(--ff-display); font-size: 1.6rem; font-weight: 300; flex: 1; }
  .event-cap {
    font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--gold); white-space: nowrap; padding-top: 8px;
  }
  .event-area { font-size: 0.75rem; color: var(--mid); letter-spacing: 0.1em; }
  .event-type { font-size: 0.85rem; color: rgba(245,243,239,0.6); line-height: 1.6; flex: 1; }
  .event-btn {
    background: none; border: 1px solid rgba(201,169,110,0.4); cursor: pointer;
    font-family: var(--ff-body); font-size: 0.7rem; letter-spacing: 0.15em;
    text-transform: uppercase; color: var(--gold);
    padding: 12px 20px; border-radius: 2px; margin-top: auto;
    transition: background 0.3s, color 0.3s;
  }
  .event-btn:hover { background: var(--gold); color: var(--black); }
  .events-highlights {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 2px; border-top: 1px solid rgba(201,169,110,0.15);
    padding-top: 48px;
  }
  .highlight-item { display: flex; flex-direction: column; gap: 8px; padding: 0 20px; }
  .highlight-item:not(:last-child) { border-right: 1px solid rgba(201,169,110,0.15); }
  .highlight-item strong { font-family: var(--ff-display); font-size: 1.2rem; font-weight: 400; }
  .highlight-item span { font-size: 0.8rem; color: var(--mid); }

  /* ── LEASING ── */
  .section-leasing { background: var(--black); padding: 140px 0; }
  .leasing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
  .lease-card {
    background: var(--grey); border: 1px solid rgba(201,169,110,0.1);
    padding: 56px 40px; display: flex; flex-direction: column; gap: 16px;
    transition: border-color 0.4s, transform 0.4s;
  }
  .lease-card:hover { border-color: var(--gold); transform: translateY(-4px); }
  .lease-tag { font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); }
  .lease-tier { font-family: var(--ff-display); font-size: 2.5rem; font-weight: 300; }
  .lease-desc { font-size: 0.9rem; font-weight: 300; line-height: 1.7; color: rgba(245,243,239,0.6); }
  .lease-features { list-style: none; display: flex; flex-direction: column; gap: 12px; flex: 1; }
  .lease-features li {
    font-size: 0.85rem; color: rgba(245,243,239,0.8);
    padding-left: 16px; position: relative;
  }
  .lease-features li::before {
    content: ''; position: absolute; left: 0; top: 50%;
    width: 6px; height: 1px; background: var(--gold);
  }
  .lease-btn {
    background: var(--gold); color: var(--black);
    border: none; cursor: pointer;
    font-family: var(--ff-body); font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.15em; text-transform: uppercase;
    padding: 16px 24px; border-radius: 2px; margin-top: 8px;
    transition: background 0.3s;
  }
  .lease-btn:hover { background: var(--gold-light); }

  /* ── CONTACT ── */
  .section-contact {
    background: #0D0D0D; padding: 140px 0;
    position: relative; overflow: hidden;
  }
  .contact-bg-text {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    font-family: var(--ff-display); font-size: clamp(6rem, 20vw, 18rem);
    font-weight: 300; color: rgba(201,169,110,0.04);
    white-space: nowrap; pointer-events: none; letter-spacing: 0.1em;
    user-select: none;
  }
  .contact-inner { position: relative; z-index: 1; }
  .contact-title { margin-bottom: 0; }
  .contact-sub {
    font-size: 1rem; color: rgba(245,243,239,0.6); font-weight: 300;
    margin-bottom: 64px; margin-top: 24px;
  }
  .contact-form { display: flex; flex-direction: column; gap: 2px; max-width: 800px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
  .form-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,169,110,0.15);
    color: var(--white); font-family: var(--ff-body); font-size: 0.9rem;
    padding: 18px 24px; outline: none;
    transition: border-color 0.3s, background 0.3s;
    appearance: none; border-radius: 0;
  }
  .form-input::placeholder { color: rgba(245,243,239,0.3); }
  .form-input:focus { border-color: var(--gold); background: rgba(201,169,110,0.05); }
  .form-select { cursor: pointer; background-image: none; }
  .form-select option { background: #1a1a1a; }
  .form-textarea { height: 140px; resize: vertical; }
  .form-submit {
    background: var(--gold); color: var(--black);
    border: none; cursor: pointer;
    font-family: var(--ff-body); font-size: 0.75rem; font-weight: 600;
    letter-spacing: 0.2em; text-transform: uppercase;
    padding: 20px 48px; align-self: flex-start; border-radius: 2px;
    margin-top: 8px; transition: background 0.3s, transform 0.2s;
  }
  .form-submit:hover { background: var(--gold-light); transform: translateY(-2px); }
  .contact-direct {
    display: flex; gap: 16px; align-items: center; margin-top: 48px;
    font-size: 0.85rem; color: rgba(245,243,239,0.4);
  }
  .contact-direct a { color: var(--gold); text-decoration: none; }
  .contact-direct a:hover { text-decoration: underline; }

  /* ── FOOTER ── */
  .footer {
    background: var(--black); border-top: 1px solid rgba(201,169,110,0.15);
    padding: 48px; text-align: center;
    display: flex; flex-direction: column; gap: 12px; align-items: center;
  }
  .footer-logo { font-family: var(--ff-display); font-size: 1.2rem; letter-spacing: 0.3em; color: var(--gold); }
  .footer-tagline { font-size: 0.75rem; letter-spacing: 0.15em; color: var(--mid); text-transform: uppercase; }
  .footer-links { display: flex; gap: 16px; font-size: 0.75rem; color: rgba(245,243,239,0.3); }
  .footer-links a { color: rgba(245,243,239,0.3); text-decoration: none; }
  .footer-links a:hover { color: var(--gold); }

  /* ── CHATBOT ── */
  .chatbot-wrap { position: fixed; bottom: 32px; right: 32px; z-index: 200; }
  .chat-toggle {
    background: var(--gold); color: var(--black);
    border: none; cursor: pointer;
    font-family: var(--ff-body); font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    padding: 14px 24px; border-radius: 2px;
    box-shadow: 0 8px 40px rgba(201,169,110,0.3);
    transition: background 0.3s, transform 0.2s;
  }
  .chat-toggle:hover { background: var(--gold-light); transform: translateY(-2px); }
  .chat-panel {
    position: absolute; bottom: 56px; right: 0;
    width: 360px; background: #111;
    border: 1px solid rgba(201,169,110,0.25);
    display: flex; flex-direction: column;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
    animation: chatIn 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes chatIn {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .chat-header {
    padding: 16px 20px; border-bottom: 1px solid rgba(201,169,110,0.15);
    font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold); display: flex; align-items: center; gap: 10px;
  }
  .chat-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #3CFF7A;
    box-shadow: 0 0 8px #3CFF7A; animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  .chat-quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px 16px; border-bottom: 1px solid rgba(201,169,110,0.1); }
  .quick-pill {
    background: rgba(201,169,110,0.1); border: 1px solid rgba(201,169,110,0.2);
    color: var(--gold); cursor: pointer;
    font-family: var(--ff-body); font-size: 0.65rem; letter-spacing: 0.1em;
    padding: 5px 12px; border-radius: 20px; text-transform: uppercase;
    transition: background 0.2s;
  }
  .quick-pill:hover { background: rgba(201,169,110,0.2); }
  .chat-messages {
    flex: 1; overflow-y: auto; padding: 16px; height: 280px;
    display: flex; flex-direction: column; gap: 12px;
    scrollbar-width: thin; scrollbar-color: rgba(201,169,110,0.2) transparent;
  }
  .msg { font-size: 0.85rem; line-height: 1.6; padding: 12px 16px; max-width: 90%; border-radius: 2px; }
  .msg-assistant { background: rgba(255,255,255,0.05); color: rgba(245,243,239,0.85); align-self: flex-start; }
  .msg-user { background: rgba(201,169,110,0.15); color: var(--white); align-self: flex-end; border: 1px solid rgba(201,169,110,0.25); }
  .typing-dots { display: flex; gap: 4px; padding: 4px 0; }
  .typing-dots span {
    width: 6px; height: 6px; border-radius: 50%; background: var(--gold);
    animation: typingDot 1.2s ease-in-out infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingDot { 0%,80%,100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
  .chat-input-row { display: flex; border-top: 1px solid rgba(201,169,110,0.15); }
  .chat-input {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: var(--ff-body); font-size: 0.85rem;
    color: var(--white); padding: 14px 16px;
  }
  .chat-input::placeholder { color: rgba(245,243,239,0.3); }
  .chat-send {
    background: var(--gold); color: var(--black);
    border: none; cursor: pointer; padding: 14px 20px;
    font-size: 1rem; transition: background 0.2s;
  }
  .chat-send:hover { background: var(--gold-light); }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .nav { padding: 16px 24px; }
    .nav-links { display: none; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .retail-grid, .events-grid, .leasing-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .why-body { flex-direction: column; gap: 40px; }
    .events-highlights { grid-template-columns: 1fr; }
    .highlight-item { border-right: none !important; border-bottom: 1px solid rgba(201,169,110,0.15); padding-bottom: 24px; }
    .section-inner { padding: 0 24px; }
    .chat-panel { width: 300px; }
  }
`;
