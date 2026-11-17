import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Aurora from '../components/Aurora'
import BlurText from '../components/BlurText'
import robotHand from '../assets/robot-hand-main.png'
import './landing.css'

/* ── Scroll reveal hook ─────────────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); obs.unobserve(el) } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return ref
}

/* ── Animated counter ───────────────────────────────────────────────────── */
function AnimNum({ target, suffix = '' }) {
  const ref = useRef(null)
  const started = useRef(false)
  const [val, setVal] = useState('0')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const raw = parseFloat(target)
        const isFloat = target.includes('.')
        const dur = 1800
        const t0 = performance.now()
        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          const v = raw * ease
          setVal(isFloat ? v.toFixed(1) : Math.round(v).toString())
          if (p < 1) requestAnimationFrame(tick)
          else setVal(target)
        }
        requestAnimationFrame(tick)
        obs.unobserve(el)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])

  return <span ref={ref}>{val}{suffix}</span>
}

/* ── Data ───────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '📹', title: 'A–Z Gesture Recognition', desc: 'Real-time hand tracking processed at 30 fps with custom mathematical heuristics.' },
  { icon: '🏠', title: 'Smart Home Control',    desc: 'Control lights, fans, AC, TV & locks with hand gestures via MQTT.' },
  { icon: '👄', title: 'AI Lip-Reading',         desc: 'Advanced Face Mesh mapping that decodes silent lip movements on camera.' },
  { icon: '⚡', title: 'Ultra-Fast Response',   desc: 'Sub-50 ms WASM local execution so every gesture is decoded instantly.' },
  { icon: '📚', title: 'Gamified Tutoring',     desc: 'Practice individual characters, gain XP, and level up with interactive quizzes.' },
  { icon: '♿', title: 'Accessibility First',    desc: 'Designed with and for the deaf and hard-of-hearing communities worldwide.' },
  { icon: '🔒', title: 'Privacy Secure',         desc: 'All AI processing runs in-browser — your camera data never leaves your device.' },
  { icon: '💬', title: 'Smart Sentence Builder', desc: 'Chain detected gestures and translate them into polished English sentences.' },
  { icon: '🔥', title: 'Progress Tracking',     desc: 'Gamified dashboard with practice streaks, earned badges, and accuracy graphs.' },
  { icon: '🔊', title: 'Speech Synthesis (TTS)', desc: 'Read your translated sentences out loud with local text-to-speech engine.' },
]

const STEPS = [
  { num: '01', icon: '📷', title: 'Choose Mode',        desc: 'Select Gesture Recognition or Lip-Reading and enable your camera feed.' },
  { num: '02', icon: '🤖', title: 'Interactive AI',     desc: 'MediaPipe landmarks track your hand or lips, feeding our local translation engine.' },
  { num: '03', icon: '💬', title: 'Generate Sentence',  desc: 'Polished sentences are built automatically. Speak them out loud or copy to clipboard.' },
]

const STATS = [
  { value: '98.7', suffix: '%', label: 'Recognition Accuracy', icon: '🎯' },
  { value: '35',   suffix: '+', label: 'Gestures Supported',   icon: '🤟' },
  { value: '50',   suffix: 'ms', label: 'Response Time',       icon: '⚡' },
  { value: '10',   suffix: 'K+', label: 'Active Users',        icon: '👥' },
]

const STORIES = [
  { name: 'Priya S.',     role: 'Deaf educator, Mumbai',     quote: 'VisiGesture broke communication barriers in my classroom. My students can now practice gestures and build sentences independently.', rating: 5, avatar: 'PS' },
  { name: 'James K.',     role: 'Software Engineer, London',  quote: 'The smart home integration is game-changing. I control my entire apartment with simple hand signs — pure independence.', rating: 5, avatar: 'JK' },
  { name: 'Dr. Anita R.', role: 'Accessibility Researcher',   quote: 'Finally, a local-first AI system that genuinely serves the accessibility community. The lip-reading is remarkable.', rating: 5, avatar: 'AR' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(() =>
    (localStorage.getItem('visigesture_theme') || 'dark') === 'dark'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('visigesture_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Section reveal refs */
  const heroRef     = useReveal(0.05)
  const featRef     = useReveal(0.08)
  const howRef      = useReveal(0.08)
  const statsRef    = useReveal(0.1)
  const storiesRef  = useReveal(0.08)
  const ctaRef      = useReveal(0.1)

  /* 3D tilt */
  const handleTilt = useCallback((e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rx = -(y - rect.height / 2) / 12
    const ry =  (x - rect.width / 2) / 12
    card.style.setProperty('--rx', `${rx}deg`)
    card.style.setProperty('--ry', `${ry}deg`)
  }, [])
  const resetTilt = useCallback((e) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }, [])

  return (
    <div className="landing-root">
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">🤟 VisiGesture</Link>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how"      onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#stats"    onClick={() => setMenuOpen(false)}>Stats</a>
            <a href="#stories"  onClick={() => setMenuOpen(false)}>Stories</a>
            <Link to="/login"  onClick={() => setMenuOpen(false)} className="nav-signin">Sign In</Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} className="nav-cta">Get Started</Link>
          </div>
          <button className="nav-burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── Hero (Aurora background) ───────────────────────────── */}
      <section ref={heroRef} className="hero-section reveal-section" style={{ position: 'relative', overflow: 'hidden' }}>
        {isDark && (
          <div className="hero-aurora-bg aurora-dark">
            <Aurora colorStops={['#7cff67', '#B497CF', '#27a5ff']} amplitude={1} blend={0.5} />
          </div>
        )}

        <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-text">
            <div className="hero-badge">• AI-Powered Gestures & Lip-Reading</div>
            <h1 className="hero-title">
              <BlurText text="Visual Translation" animateBy="letters" direction="top" delay={30} stepDuration={0.5} className="hero-line hero-line-1" />
              <BlurText text="Without Barriers" animateBy="letters" direction="top" delay={30} stepDuration={0.5} className="hero-line hero-line-2" />
              <BlurText text="VisiGesture Portal" animateBy="letters" direction="top" delay={30} stepDuration={0.5} className="hero-line hero-line-3" />
            </h1>
            <p className="hero-desc">
              Real-time ASL letter detection and custom gesture classification.
              Features visual lip-reading meshes, a smart sentence translator, and gamified practice modules—entirely in your browser.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn-primary launch-btn">🚀 Launch App Free</Link>
              <a href="#how" className="btn-secondary">▶ Learn More</a>
            </div>
            <div className="hero-mini-stats">
              <div className="mini-stat"><span>98.7%</span><small>Accuracy</small></div>
              <div className="mini-stat"><span>35+</span><small>Gestures</small></div>
              <div className="mini-stat"><span>&lt;50ms</span><small>Latency</small></div>
              <div className="mini-stat"><span>Face+Hand</span><small>Decoders</small></div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-visual-wrapper">
              <img src={robotHand} alt="3D Robot Hand Gesture AI" className="hero-robot-hand" />
              <div className="hero-visual-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (Grid pattern + staggered reveal) ──────────── */}
      <section id="features" className="features-section section-reveal reveal-section" ref={featRef}>
        <div className="features-bg-grid" />
        <div className="features-bg-orb features-bg-orb-1" />
        <div className="features-bg-orb features-bg-orb-2" />
        <div className="section-inner" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header-center">
            <div className="section-badge">✦ Capabilities</div>
            <h2 className="section-title">
              <BlurText text="Everything You Need" animateBy="words" direction="bottom" delay={60} stepDuration={0.4} />
            </h2>
            <p className="section-sub center">A complete AI-powered sign language platform built for accessibility, speed, and real-world use.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                className="feature-card stagger-item tilt-card-3d"
                key={i}
                style={{ transitionDelay: `${i * 60}ms` }}
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="feature-card-glow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (Timeline connector + stagger) ─────────── */}
      <section id="how" className="how-section section-reveal reveal-section" ref={howRef}>
        <div className="how-bg-blob how-bg-blob-1" />
        <div className="how-bg-blob how-bg-blob-2" />
        <div className="section-inner" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header-center">
            <div className="section-badge">◈ Process</div>
            <h2 className="section-title">
              <BlurText text="How It Works" animateBy="words" direction="bottom" delay={60} stepDuration={0.4} />
            </h2>
            <p className="section-sub center">Three simple steps from gesture to understanding.</p>
          </div>
          <div className="steps-row">
            <div className="steps-connector" />
            {STEPS.map((s, i) => (
              <div
                className="step-card stagger-item tilt-card-3d"
                key={i}
                style={{ transitionDelay: `${i * 150}ms` }}
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                <div className="step-num">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats (Glow pulse + animated counters) ──────────────── */}
      <section id="stats" className="stats-section section-reveal reveal-section" ref={statsRef}>
        <div className="stats-bg-glow" />
        <div className="section-inner" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header-center">
            <div className="section-badge">◉ Numbers</div>
            <h2 className="section-title">
              <BlurText text="Proven by Numbers" animateBy="words" direction="bottom" delay={60} stepDuration={0.4} />
            </h2>
            <p className="section-sub center">Performance metrics that speak for themselves.</p>
          </div>
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div className="stat-card stagger-item" key={i} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">
                  <AnimNum target={s.value} suffix={s.suffix} />
                </div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-card-shine" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stories (Avatar circles + stagger) ──────────────────── */}
      <section id="stories" className="stories-section section-reveal reveal-section" ref={storiesRef}>
        <div className="stories-bg-mesh" />
        <div className="section-inner" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header-center">
            <div className="section-badge">♦ Testimonials</div>
            <h2 className="section-title">
              <BlurText text="Real Stories" animateBy="words" direction="bottom" delay={60} stepDuration={0.4} />
            </h2>
            <p className="section-sub center">From people whose lives have been changed by VisiGesture.</p>
          </div>
          <div className="stories-grid">
            {STORIES.map((s, i) => (
              <div className="story-card stagger-item" key={i} style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="story-top">
                  <div className="story-avatar">{s.avatar}</div>
                  <div className="story-stars">{'★'.repeat(s.rating)}</div>
                </div>
                <p className="story-quote">"{s.quote}"</p>
                <div className="story-author">
                  <strong>{s.name}</strong>
                  <small>{s.role}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (Gradient pulse + aurora) ──────────────────────── */}
      <section className="cta-section section-reveal reveal-section" ref={ctaRef}>
        {isDark && (
          <div className="cta-bg-aurora">
            <Aurora colorStops={['#7cff67', '#B497CF', '#27a5ff']} amplitude={1} blend={0.5} />
          </div>
        )}
        <div className="cta-bg-orb cta-bg-orb-1" />
        <div className="cta-bg-orb cta-bg-orb-2" />
        <div className="section-inner cta-inner" style={{ position: 'relative', zIndex: 2 }}>
          <div className="cta-badge">🚀 Ready to Start?</div>
          <h2>
            <BlurText text="Start Breaking Barriers Today" animateBy="words" direction="bottom" delay={50} stepDuration={0.4} />
          </h2>
          <p>Join thousands of users making communication truly accessible with AI-powered sign language recognition.</p>
          <div className="cta-actions">
            <Link to="/signup" className="btn-primary btn-large">🚀 Get Started Free — No Credit Card</Link>
          </div>
          <div className="cta-trust">
            <span>✓ No credit card required</span>
            <span>✓ Free forever for basic use</span>
            <span>✓ Open source components</span>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo">🤟 VisiGesture</div>
            <p>Breaking barriers of communication using advanced client-side computer vision and visual lip mesh analysis.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <Link to="/signup">Get Started</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className="footer-col">
            <h4>Tech</h4>
            <a href="#">React + Vite</a>
            <a href="#">Spring Boot</a>
            <a href="#">MediaPipe AI</a>
            <a href="#">MQTT Protocol</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 VisiGesture — Visual Gesture & Lip-Reading Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
