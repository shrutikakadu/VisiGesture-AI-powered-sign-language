import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'
import './auth.css'

export default function SignupPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '', mobile: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { token, user } = await authAPI.register(form.name, form.email, form.password, form.mobile)
      login(token, user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* ── Left Panel ── */}
      <div className="auth-left">
        <div className="auth-orb auth-orb1" />
        <div className="auth-orb auth-orb2" />
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">🤟 VisiGesture</Link>
          <h2>Join the future of<br /><span className="gradient-text">accessibility</span></h2>
          <p>Create your free account and start translating gestures and lips in real-time with the power of browser-based AI.</p>
          <div className="auth-features">
            {['ASL A-Z & Custom Gestures','Visual Lip-Reading Decoder','Smart Sentence Builder','Gamified Tutoring Hub'].map(f => (
              <div className="auth-feature" key={f}><span className="check">✓</span>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Create account</h1>
            <p>Start your journey with VisiGesture today</p>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input id="name" name="name" type="text"
                  placeholder="John Doe"
                  value={form.name} onChange={handle} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input id="email" name="email" type="email"
                  placeholder="you@example.com"
                  value={form.email} onChange={handle} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mobile">Mobile Number (Login access key)</label>
              <div className="input-wrapper">
                <span className="input-icon">📱</span>
                <input id="mobile" name="mobile" type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.mobile} onChange={handle} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input id="password" name="password" type="password"
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={handle} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirm password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔐</span>
                <input id="confirm" name="confirm" type="password"
                  placeholder="Repeat password"
                  value={form.confirm} onChange={handle} required />
              </div>
            </div>

            <button type="submit" className="btn-auth" disabled={loading} id="signup-btn">
              {loading ? <><span className="btn-spinner" /> Creating account…</> : 'Create Account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
