import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import './Admin.css'

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

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #040b16 0%, #07111f 45%, #0f172a 100%)',
      color: '#f8fafc',
      padding: '24px 16px 48px',
      fontFamily: 'Inter, Segoe UI, sans-serif',
    },
    container: {
      maxWidth: '1100px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
    },
    hero: {
      display: 'grid',
      gap: '16px',
      gridTemplateColumns: '1.2fr 0.8fr',
    },
    card: {
      background: 'rgba(10, 18, 32, 0.95)',
      border: '1px solid rgba(148, 163, 184, 0.22)',
      borderRadius: '16px',
      padding: '22px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
    },
    profileCard: {
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
    },
    avatar: {
      width: '58px',
      height: '58px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #64ffda, #4f46e5)',
      color: '#08111d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '22px',
      fontWeight: 700,
      flexShrink: 0,
    },
    eyebrow: {
      margin: '0 0 6px',
      color: '#64ffda',
      fontSize: '12px',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      fontWeight: 700,
    },
    name: {
      margin: '0 0 6px',
      fontSize: '24px',
      fontWeight: 700,
    },
    handle: {
      margin: '0 0 10px',
      color: '#94a3b8',
    },
    bio: {
      margin: '0',
      color: '#cbd5e1',
      lineHeight: 1.6,
    },
    infoCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    sectionTitle: {
      margin: '0 0 4px',
      fontSize: '18px',
      fontWeight: 700,
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '10px',
      color: '#cbd5e1',
      paddingBottom: '8px',
      borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
    },
    formsSection: {
      display: 'grid',
      gap: '16px',
      gridTemplateColumns: '1fr 1fr',
    },
    formCard: {
      background: 'rgba(10, 18, 32, 0.95)',
      border: '1px solid rgba(148, 163, 184, 0.22)',
      borderRadius: '16px',
      padding: '22px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
    },
    label: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontSize: '14px',
      color: '#e2e8f0',
      marginBottom: '12px',
    },
    input: {
      border: '1px solid rgba(148, 163, 184, 0.26)',
      borderRadius: '10px',
      padding: '10px 12px',
      background: '#020617',
      color: '#f8fafc',
      outline: 'none',
    },
    button: {
      border: 'none',
      borderRadius: '10px',
      padding: '10px 14px',
      cursor: 'pointer',
      fontWeight: 600,
    },
    primaryButton: {
      background: '#64ffda',
      color: '#07111f',
    },
    secondaryButton: {
      background: 'transparent',
      color: '#f8fafc',
      border: '1px solid rgba(148, 163, 184, 0.22)',
    },
    actions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
    },
    messageSuccess: {
      color: '#64ffda',
      fontSize: '13px',
      margin: '8px 0 0',
    },
    messageError: {
      color: '#ff6b6b',
      fontSize: '13px',
      margin: '8px 0 0',
    },
  }

  return (
    <main style={styles.page}>
        <div style={styles.container}>
          <section style={styles.hero}>
            <div style={{ ...styles.card, ...styles.profileCard }}>
              <div style={styles.avatar}>{initials}</div>
              <div>
                <p style={styles.eyebrow}>MIITverse profile</p>
                <h1 style={styles.name}>{user.username}</h1>
                <p style={styles.handle}>@{user.username?.toLowerCase().replace(/\s+/g, '')}</p>
                <p style={styles.bio}>
                  Welcome back! Manage your profile details and keep your account secure.
                </p>
              </div>
            </div>

            <div style={{ ...styles.card, ...styles.infoCard }}>
              <h2 style={styles.sectionTitle}>Account details</h2>
              <div style={styles.infoRow}><span>Username</span><strong>{user.username}</strong></div>
              <div style={styles.infoRow}><span>Email</span><strong>{user.email}</strong></div>
              <div style={styles.infoRow}><span>User ID</span><strong>{user.id}</strong></div>
              <div style={styles.infoRow}><span>Joined</span><strong>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</strong></div>
            </div>
          </section>

          <section style={styles.formsSection}>
            <div style={styles.formCard}>
              <h2 style={styles.sectionTitle}>Update username</h2>
              <p style={{ margin: '6px 0 14px', color: '#94a3b8' }}>Change the name shown across your profile.</p>

              <form onSubmit={handleUsernameSubmit}>
                <label style={styles.label}>
                  New username
                  <input
                    style={styles.input}
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    minLength={3}
                    maxLength={30}
                  />
                </label>

                {usernameStatus && <p style={styles.messageSuccess}>{usernameStatus}</p>}
                {usernameError && <p style={styles.messageError}>{usernameError}</p>}

                <button type="submit" style={{ ...styles.button, ...styles.primaryButton, marginTop: '10px' }}>
                  Save username
                </button>
              </form>
            </div>

            <div style={styles.formCard}>
              <h2 style={styles.sectionTitle}>Change password</h2>
              <p style={{ margin: '6px 0 14px', color: '#94a3b8' }}>Keep your account secure with a fresh password.</p>

              <form onSubmit={handlePasswordSubmit}>
                <label style={styles.label}>
                  Current password
                  <input
                    style={styles.input}
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                    minLength={6}
                  />
                </label>
                <label style={styles.label}>
                  New password
                  <input
                    style={styles.input}
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={8}
                  />
                </label>
                <label style={styles.label}>
                  Confirm new password
                  <input
                    style={styles.input}
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                  />
                </label>

                {passwordStatus && <p style={styles.messageSuccess}>{passwordStatus}</p>}
                {passwordError && <p style={styles.messageError}>{passwordError}</p>}

                <button type="submit" style={{ ...styles.button, ...styles.primaryButton, marginTop: '10px' }}>
                  Change password
                </button>
              </form>
            </div>
          </section>

          <section style={styles.actions}>
            <button type="button" style={{ ...styles.button, ...styles.secondaryButton }} onClick={() => navigate('/feed')}>
              Back to Feed
            </button>
            <button type="button" style={{ ...styles.button, ...styles.secondaryButton }} onClick={handleLogout}>
              Logout
            </button>
          </section>
        </div>
      </main>
  )
}
