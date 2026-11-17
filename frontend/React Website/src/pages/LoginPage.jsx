import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'
import './auth.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await authAPI.login(form.email, form.password)
      login(token, user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      // Simulate Google OAuth delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let token, user;
      try {
        // Try logging in with the Google demo account
        const res = await authAPI.login("google.user@gmail.com", "googleOAuth123!")
        token = res.token
        user = res.user
      } catch (err) {
        // If the Google demo account doesn't exist yet, register it
        const res = await authAPI.register("Google User", "google.user@gmail.com", "googleOAuth123!", "+91 98765 43210")
        token = res.token
        user = res.user
      }
      
      login(token, user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError("Google Sign-In failed: " + err.message)
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
          <h2>Break the barrier of<br /><span className="gradient-text">communication</span></h2>
          <p>Real-time AI sign language and lip-reading system that bridges the gap between hearing and deaf communities.</p>
          <div className="auth-features">
            {['All 26 ASL Letters & Custom Signs','Lip-Reading Mesh Decoder','Smart Sentence Translation','Gamified Tutoring & Learning'].map(f => (
              <div className="auth-feature" key={f}><span className="check">✓</span>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form ── */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={submit} className="auth-form">
             <div className="form-group">
              <label htmlFor="email">Email or Mobile Number</label>
              <div className="input-wrapper">
                <span className="input-icon">📱</span>
                <input
                  id="email" name="email" type="text"
                  placeholder="you@example.com or +91..."
                  value={form.email} onChange={handle} required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
                <a href="#" className="forgot-link">Forgot password?</a>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password" name="password" type="password"
                  placeholder="••••••••"
                  value={form.password} onChange={handle} required
                />
              </div>
            </div>

            <button type="submit" className="btn-auth" disabled={loading} id="login-btn">
              {loading ? <><span className="btn-spinner" /> Signing in…</> : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider"><span>or continue with</span></div>

          <div className="social-btns">
            <button className="social-btn" type="button" onClick={loginWithGoogle} disabled={loading} style={{ width: '100%' }}>
              {loading ? <><span className="btn-spinner" /> Connecting…</> : '🌐 Google'}
            </button>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
