import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/useAuth'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
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

      if (user.role !== 'admin') {
        setError('This account is not allowed to access admin.')
        return
      }

      const from = location.state?.from?.pathname || '/admin'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Admin login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
        <p>Use an admin account to enter the dashboard.</p>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Enter Admin'}
        </button>

        <p>
          Not an admin? <Link to="/login">Go to regular login</Link>
        </p>
      </form>
    </div>
  )
}