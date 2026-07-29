import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/useAuth'
import { canUseUserLogin } from '../lib/authAccess'
import '../styles/AuthDesign.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(form)

      if (!canUseUserLogin(user.role)) {
        setError('This account is for admin access. Please use the admin login page.')
        return
      }

      navigate('/feed')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="logo-section">
        <div className="logo-container">
          <img
            src="/miitLogo.png"
            alt="MIIT Logo"
            className="miit-logo"
          />
          <h1 className="logo-title">
            <span className="miit">Miit</span><span className="verse">Verse</span>
          </h1>
          <p className="logo-subtitle">Official Social Hub of MIIT</p>
        </div>
      </div>

      <div className="form-section">
        <div className="auth-container">
          <h2>Login</h2>
          <p style={{ textAlign: 'center', color: '#8892b0', marginBottom: '24px' }}>
            Use your account to access MiitVerse.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </div>

            {error && <p style={{ color: '#ff6b6b', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="toggle-text">
            Need an account? <Link to="/register" style={{ color: '#64ffda', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
          </p>
          <p className="toggle-text">
            <Link to="/admin-login" style={{ color: '#64ffda', textDecoration: 'none', fontWeight: '600' }}>Admin Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}