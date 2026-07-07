import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { apiRequest } from '../lib/api'

const RESEND_COOLDOWN_MS = 3 * 60 * 1000
const PENDING_VERIFICATION_KEY = 'miitverse-pending-verification'

function readPendingVerification() {
  try {
    const raw = window.localStorage.getItem(PENDING_VERIFICATION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function savePendingVerification(data) {
  if (!data?.email) return

  window.localStorage.setItem(
    PENDING_VERIFICATION_KEY,
    JSON.stringify({
      email: data.email,
      resendAvailableAt: data.resendAvailableAt,
      verificationExpiresAt: data.verificationExpiresAt,
    })
  )
}

function clearPendingVerification() {
  window.localStorage.removeItem(PENDING_VERIFICATION_KEY)
}

function getDeadlineMs(value) {
  const timestamp = value ? new Date(value).getTime() : 0
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function formatCountdown(totalMs) {
  const totalSeconds = Math.max(Math.ceil(totalMs / 1000), 0)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function Verify() {
  const navigate = useNavigate()
  const location = useLocation()
  const storedPending = useMemo(() => readPendingVerification(), [])
  const stateEmail = location.state?.email || ''
  const initialEmail = stateEmail || storedPending?.email || ''
  const initialResendAvailableAt = location.state?.resendAvailableAt || storedPending?.resendAvailableAt
  const initialVerificationExpiresAt = location.state?.verificationExpiresAt || storedPending?.verificationExpiresAt
  const initialResendDeadlineMs = getDeadlineMs(initialResendAvailableAt) || (initialEmail ? Date.now() + RESEND_COOLDOWN_MS : 0)

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')
  const [resendDeadlineMs, setResendDeadlineMs] = useState(initialResendDeadlineMs)
  const [remainingMs, setRemainingMs] = useState(() => Math.max(initialResendDeadlineMs - Date.now(), 0))
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    if (!initialEmail) return

    savePendingVerification({
      email: initialEmail,
      resendAvailableAt: new Date(initialResendDeadlineMs).toISOString(),
      verificationExpiresAt: initialVerificationExpiresAt,
    })
  }, [initialEmail, initialResendDeadlineMs, initialVerificationExpiresAt])

  useEffect(() => {
    const updateRemaining = () => {
      setRemainingMs(Math.max(resendDeadlineMs - Date.now(), 0))
    }

    updateRemaining()

    if (resendDeadlineMs <= Date.now()) return undefined

    const timerId = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(timerId)
  }, [resendDeadlineMs])

  function rememberCooldown(data) {
    const nextResendAvailableAt = data?.resendAvailableAt || new Date(Date.now() + RESEND_COOLDOWN_MS).toISOString()
    const pending = {
      email: data?.email || email,
      resendAvailableAt: nextResendAvailableAt,
      verificationExpiresAt: data?.verificationExpiresAt,
    }

    savePendingVerification(pending)
    setResendDeadlineMs(getDeadlineMs(nextResendAvailableAt))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    if (!/^\d{8}$/.test(code)) {
      setError('Verification code must be 8 digits')
      setLoading(false)
      return
    }

    try {
      setInfo('Verifying your email...')
      await apiRequest('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      })

      clearPendingVerification()
      setInfo('Email verified successfully. Redirecting to login...')
      window.setTimeout(() => {
        navigate('/login')
      }, 1000)
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    setInfo('')
    setResendLoading(true)

    try {
      const data = await apiRequest('/auth/verify/resend', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })

      rememberCooldown({ ...data, email })
      setInfo('Verification email resent. Check your inbox.')
    } catch (err) {
      if (err.data?.resendAvailableAt) {
        rememberCooldown({ email, resendAvailableAt: err.data.resendAvailableAt })
      }

      setError(err.message || 'Unable to resend verification email')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Verify email</h1>
        <p>Enter the 8-digit code sent to your email.</p>

        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || resendLoading}
          />
        </label>

        <label>
          Verification Code (8 digits)
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="00000000"
            maxLength="8"
            required
            disabled={loading || resendLoading}
          />
        </label>

        {error && <p className="auth-error">{error}</p>}
        {info && <p style={{ color: '#0066cc' }}>{info}</p>}

        <button type="submit" disabled={loading || code.length !== 8}>
          {loading ? 'Verifying...' : 'Verify & Create Account'}
        </button>

        {remainingMs > 0 ? (
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            Resend available in {formatCountdown(remainingMs)}
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || !email}
            style={{ marginTop: '16px' }}
          >
            {resendLoading ? 'Resending...' : 'Resend verification email'}
          </button>
        )}

        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Check your spam folder if you do not see the code.
        </p>
      </form>
    </div>
  )
}
