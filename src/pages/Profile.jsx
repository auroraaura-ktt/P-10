import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Navbar from '../components/Navbar'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, updateProfile, changePassword } = useAuth()
  const [username, setUsername] = useState(user?.username ?? '')
  const [usernameStatus, setUsernameStatus] = useState(null)
  const [usernameError, setUsernameError] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  useEffect(() => {
    setUsername(user?.username ?? '')
  }, [user?.username])

  const initials = useMemo(() => {
    return user?.username
      ? user.username
          .split(' ')
          .map((part) => part[0]?.toUpperCase())
          .join('')
      : 'U'
  }, [user?.username])

  if (!user) {
    return null
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  async function handleUsernameSubmit(event) {
    event.preventDefault()
    setUsernameError(null)
    setUsernameStatus(null)

    try {
      const updatedUser = await updateProfile({ username })
      setUsername(updatedUser.username)
      setUsernameStatus('Username updated successfully.')
    } catch (error) {
      setUsernameError(error?.data?.message || error.message || 'Could not update username.')
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setPasswordError(null)
    setPasswordStatus(null)

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    try {
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordStatus('Password updated successfully.')
    } catch (error) {
      setPasswordError(error?.data?.message || error.message || 'Could not update password.')
    }
  }

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <div className="profile-page-inner">
          <section className="profile-hero">
            <div className="profile-summary-card">
              <div className="profile-cover">
                <div className="profile-page-avatar">{initials}</div>
              </div>

              <p className="profile-eyebrow">MIITverse profile</p>
              <h1 className="profile-username">{user.username}</h1>
              <p className="profile-handle">@{user.username?.toLowerCase().replace(/\s+/g, '')}</p>

              <div className="profile-stats-row">
                <div className="profile-stat">
                  <strong>28</strong>
                  <span>Posts</span>
                </div>
                <div className="profile-stat">
                  <strong>5.4K</strong>
                  <span>Followers</span>
                </div>
                <div className="profile-stat">
                  <strong>842</strong>
                  <span>Following</span>
                </div>
              </div>

              <p className="profile-bio">
                Welcome back! Discover your profile insights, manage your account, and keep your feed fresh.
              </p>

              <div className="profile-social-links">
                <span className="social-pill facebook">Facebook</span>
                <span className="social-pill instagram">Instagram</span>
              </div>
            </div>

            <div className="profile-details-card profile-summary-details">
              <div className="profile-details-card-header">
                <h2>Account details</h2>
                <p>Securely stored and easily accessible.</p>
              </div>

              <div className="profile-details-grid">
                <div className="profile-detail-row">
                  <span>Username</span>
                  <strong>{user.username}</strong>
                </div>
                <div className="profile-detail-row">
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
                <div className="profile-detail-row">
                  <span>User ID</span>
                  <strong>{user.id}</strong>
                </div>
                <div className="profile-detail-row">
                  <span>Joined</span>
                  <strong>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-settings-section">
            <div className="profile-settings-grid">
              <div className="profile-settings-card">
                <div className="profile-details-card-header">
                  <h2>Update username</h2>
                  <p>Change the name shown across your profile.</p>
                </div>

                <form onSubmit={handleUsernameSubmit} className="profile-settings-form">
                  <label>
                    New username
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                      minLength={3}
                      maxLength={30}
                    />
                  </label>

                  {usernameStatus && <p className="form-success">{usernameStatus}</p>}
                  {usernameError && <p className="form-error">{usernameError}</p>}

                  <button type="submit" className="profile-button profile-button-primary">
                    Save username
                  </button>
                </form>
              </div>

              <div className="profile-settings-card">
                <div className="profile-details-card-header">
                  <h2>Change password</h2>
                  <p>Keep your account secure with a new password.</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="profile-settings-form">
                  <label>
                    Current password
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      required
                      minLength={6}
                    />
                  </label>
                  <label>
                    New password
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                      minLength={8}
                    />
                  </label>
                  <label>
                    Confirm new password
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      minLength={8}
                    />
                  </label>

                  {passwordStatus && <p className="form-success">{passwordStatus}</p>}
                  {passwordError && <p className="form-error">{passwordError}</p>}

                  <button type="submit" className="profile-button profile-button-primary">
                    Change password
                  </button>
                </form>
              </div>
            </div>
          </section>

          <section className="profile-actions">
            <button type="button" className="profile-button profile-button-outline" onClick={() => navigate('/feed')}>
              Back to Feed
            </button>
            <button type="button" className="profile-button profile-button-ghost" onClick={handleLogout}>
              Logout
            </button>
          </section>
        </div>
      </main>
    </>
  )
}
