import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import './Admin.css'

export default function Admin() {
  const { user, token, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [pageFormData, setPageFormData] = useState({
    pageName: '',
    email: '',
    password: '',
  })
  const [activeSection, setActiveSection] = useState('dashboard')
  const [creatingUser, setCreatingUser] = useState(false)
  const [createMessage, setCreateMessage] = useState({ type: '', text: '' })
  const [creatingPageAccount, setCreatingPageAccount] = useState(false)
  const [pageAccountMessage, setPageAccountMessage] = useState({ type: '', text: '' })
  const [pages, setPages] = useState([])
  const [loadingPages, setLoadingPages] = useState(false)

  const [resetPasswordUserId, setResetPasswordUserId] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' })

  const [testPostData, setTestPostData] = useState({
    author: '',
    content: '',
    image: '',
  })
  const [creatingTestPost, setCreatingTestPost] = useState(false)
  const [testPostMessage, setTestPostMessage] = useState({ type: '', text: '' })
  const [postsList, setPostsList] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [postsFilter, setPostsFilter] = useState('all') // all | user | page | suspended

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    setError(null)

    try {
      const data = await apiRequest('/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message || 'Failed to load users')
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }, [token])

  const loadPages = useCallback(async () => {
    setLoadingPages(true)

    try {
      const data = await apiRequest('/auth/pages', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setPages(data.pages || [])
    } catch (err) {
      setPages([])
      setPageAccountMessage({ type: 'error', text: err.message || 'Failed to load pages' })
    } finally {
      setLoadingPages(false)
    }
  }, [token])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePageFormChange = (e) => {
    const { name, value } = e.target
    setPageFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleTestPostChange = (e) => {
    const { name, value } = e.target
    setTestPostData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateTestPost = (e) => {
    e.preventDefault()
    setCreatingTestPost(true)
    setTestPostMessage({ type: '', text: '' })

    try {
      const newPost = {
        id: Date.now(),
        author: testPostData.author || 'Test User',
        avatar: '📝',
        timestamp: new Date().toLocaleString(),
        content: testPostData.content,
        image: testPostData.image || null,
        likes: 0,
        comments: 0,
        shares: 0,
      }

      const existingPosts = JSON.parse(localStorage.getItem('testPosts') || '[]')
      const updatedPosts = [newPost, ...existingPosts]
      localStorage.setItem('testPosts', JSON.stringify(updatedPosts))

      setTestPostMessage({
        type: 'success',
        text: 'Test post created successfully! Check the Feed page to see it.',
      })
      setTestPostData({ author: '', content: '', image: '' })
    } catch (err) {
      setTestPostMessage({
        type: 'error',
        text: 'Failed to create test post',
      })
    } finally {
      setCreatingTestPost(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreatingUser(true)
    setCreateMessage({ type: '', text: '' })

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      setCreateMessage({
        type: 'success',
        text: data.message || `Verification code sent to ${formData.email}.`,
      })
      setFormData({ username: '', email: '', password: '' })
      await loadUsers()
    } catch (err) {
      setCreateMessage({
        type: 'error',
        text: err.message || 'Failed to create user',
      })
    } finally {
      setCreatingUser(false)
    }
  }

  const handleCreatePageAccount = async (e) => {
    e.preventDefault()
    setCreatingPageAccount(true)
    setPageAccountMessage({ type: '', text: '' })

    try {
      const data = await apiRequest('/auth/create-page-account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pageFormData),
      })

      setPageAccountMessage({
        type: 'success',
        text: data.message || `Page account ${pageFormData.pageName || pageFormData.email} created successfully.`,
      })
      setPageFormData({ pageName: '', email: '', password: '' })
      await loadUsers()
      await loadPages()
    } catch (err) {
      setPageAccountMessage({
        type: 'error',
        text: err.message || 'Failed to create page account',
      })
    } finally {
      setCreatingPageAccount(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setResettingPassword(true)
    setResetMessage({ type: '', text: '' })

    try {
      const data = await apiRequest('/users/reset-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: resetPasswordUserId,
          newPassword,
        }),
      })

      setResetMessage({
        type: 'success',
        text: `Password reset for ${data.user.username} successfully!`,
      })
      setResetPasswordUserId(null)
      setNewPassword('')
      await loadUsers()
    } catch (err) {
      setResetMessage({
        type: 'error',
        text: err.message || 'Failed to reset password',
      })
    } finally {
      setResettingPassword(false)
    }
  }

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Delete user '${username}'? This cannot be undone.`)) {
      return
    }

    try {
      await apiRequest(`/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    }
  }

  async function loadAllPosts() {
    setLoadingPosts(true)
    try {
      // fetch all posts from server (admin-only)
      const data = await apiRequest('/social/posts/all', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const fetchedPages = await (async () => {
        try {
          const pagesData = await apiRequest('/auth/pages', { headers: { Authorization: `Bearer ${token}` } })
          return pagesData.pages || []
        } catch (e) {
          return pages || []
        }
      })()

      const posts = (data.posts || []).map((p) => {
        const matchedPage = (fetchedPages || []).find((pg) => pg.id === p.userId)
        const isPage = Boolean(matchedPage)
        return {
          ...p,
          source: isPage ? 'page' : 'user',
          author: p.username || p.author || 'User',
          pageName: matchedPage?.pageName || null,
        }
      })

      setPostsList(posts)
    } catch (err) {
      setPostsList([])
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleDeletePost = (post) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return

    ;(async () => {
      try {
        await apiRequest(`/social/posts/${encodeURIComponent(post.id)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        await loadAllPosts()
      } catch (err) {
        setError(err.message || 'Failed to delete post')
      }
    })()
  }

  const handleToggleSuspend = (post) => {
    const toggle = !post.suspended

    ;(async () => {
      try {
        await apiRequest(`/social/posts/${encodeURIComponent(post.id)}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ suspended: toggle }),
        })
        await loadAllPosts()
      } catch (err) {
        setError(err.message || 'Failed to update post')
      }
    })()
  }

  const newestUsers = users.slice(0, 4)

  useEffect(() => {
    if (activeSection === 'users') {
      loadUsers()
    }

    if (activeSection === 'page-accounts') {
      loadPages()
    }
    if (activeSection === 'posts') {
      loadAllPosts()
    }
  }, [activeSection, loadUsers, loadPages])

  const sidebarItems = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'users', label: '👥 Manage Users' },
    { key: 'page-accounts', label: '🌐 Page Accounts' },
    { key: 'posts', label: '📝 Posts' },
    { key: 'events', label: '📅 Events' },
    { key: 'reports', label: '🚩 Reports' },
  ]

  const pageTitles = {
    dashboard: 'Dashboard Overview',
    users: 'Manage Users',
    'page-accounts': 'Page Accounts',
    posts: 'Posts',
    events: 'Events',
    reports: 'Reports',
  }

  const pageDescriptions = {
    dashboard: 'Welcome back, Admin',
    users: 'Create and manage personal accounts from here.',
    'page-accounts': 'Create special MIIT page accounts without email verification.',
    posts: 'Manage posts and content moderation.',
    events: 'Create and manage upcoming events.',
    reports: 'Review flagged reports and moderation tasks.',
  }

  const goToSection = (key) => {
    setActiveSection(key)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return (
          <>
            <section className="admin-users">
              <div className="admin-users-header">
                <h2>Manage Users</h2>
                <p>Load and manage all registered accounts from this page.</p>
              </div>

              {loadingUsers && <p>Loading users...</p>}
              {error && <p className="error-text">{error}</p>}

              {!loadingUsers && users.length === 0 && !error && (
                <p>No users loaded yet. Use the sidebar to refresh this view.</p>
              )}

              {users.length > 0 && (
                <div className="admin-users-table-wrap">
                  <table className="admin-users-table">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem.id}>
                          <td>{userItem.fullName || userItem.username}</td>
                          <td>{userItem.email}</td>
                          <td>{userItem.role}</td>
                          <td>{new Date(userItem.createdAt).toLocaleString()}</td>
                          <td className="admin-action-cell">
                            <button
                              type="button"
                              className="admin-reset-btn"
                              onClick={() => setResetPasswordUserId(userItem.id)}
                            >
                              Reset Password
                            </button>
                            <button
                              type="button"
                              className="admin-delete-btn"
                              onClick={() => handleDeleteUser(userItem.id, userItem.fullName || userItem.username)}
                              disabled={userItem.id === user?.id}
                              title={userItem.id === user?.id ? 'You cannot delete your own admin account' : 'Delete this user'}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )
      case 'page-accounts':
        return (
          <section id="page-accounts" className="admin-page-accounts">
            <div className="admin-create-header">
              <h2>Create Page Account</h2>
              <p>Create a special MIIT page account with a virtual @miitverse.com identity. These accounts do not require a real inbox and can be used like regular signed-in accounts.</p>
            </div>

            {pageAccountMessage.text && (
              <p className={`message message-${pageAccountMessage.type}`}>
                {pageAccountMessage.text}
              </p>
            )}

            <div className="admin-create-form">
              <div className="form-group">
                <label htmlFor="pageName">Page Name</label>
                <input
                  type="text"
                  id="pageName"
                  name="pageName"
                  value={pageFormData.pageName}
                  onChange={handlePageFormChange}
                  placeholder="MiitVerse BlueMark"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pageEmail">Email</label>
                <input
                  type="email"
                  id="pageEmail"
                  name="email"
                  value={pageFormData.email}
                  onChange={handlePageFormChange}
                  placeholder="page@miitverse.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pagePassword">Password</label>
                <input
                  type="password"
                  id="pagePassword"
                  name="password"
                  value={pageFormData.password}
                  onChange={handlePageFormChange}
                  required
                />
              </div>

              <button type="submit" className="form-submit" disabled={creatingPageAccount} onClick={handleCreatePageAccount}>
                {creatingPageAccount ? 'Creating account...' : 'Create Page Account'}
              </button>
            </div>

            <div className="admin-users-table-wrap" style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>Created Pages</h3>
              {loadingPages && <p>Loading pages...</p>}
              {!loadingPages && pages.length === 0 && <p>No pages created yet.</p>}
              {!loadingPages && pages.length > 0 && (
                <div className="admin-page-list">
                  {pages.map((pageItem) => (
                    <div className="admin-page-card" key={pageItem.id}>
                      <div>
                        <h4>{pageItem.pageName}</h4>
                        <p>{pageItem.email}</p>
                      </div>
                      <div className="admin-page-card-actions">
                        <span className="admin-page-badge">{pageItem.role || 'page'}</span>
                        <button
                          type="button"
                          className="admin-reset-btn"
                          onClick={() => setResetPasswordUserId(pageItem.ownerId || pageItem.id)}
                        >
                          Reset Password
                        </button>
                        <a className="admin-button" href={`/page/${pageItem.slug}`}>
                          Open Dashboard
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )
      case 'posts':
        return (
          <section id="posts" className="admin-page-accounts">
            <div className="admin-create-header">
              <h2>Posts Management</h2>
              <p>Review posts created by users and page accounts. You can delete or suspend posts from here.</p>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <button type="button" className={`admin-nav-item ${postsFilter === 'all' ? 'active' : ''}`} onClick={() => setPostsFilter('all')}>All</button>
              <button type="button" className={`admin-nav-item ${postsFilter === 'user' ? 'active' : ''}`} onClick={() => setPostsFilter('user')} style={{ marginLeft: '8px' }}>User Posts</button>
              <button type="button" className={`admin-nav-item ${postsFilter === 'page' ? 'active' : ''}`} onClick={() => setPostsFilter('page')} style={{ marginLeft: '8px' }}>Page Posts</button>
              <button type="button" className={`admin-nav-item ${postsFilter === 'suspended' ? 'active' : ''}`} onClick={() => setPostsFilter('suspended')} style={{ marginLeft: '8px' }}>Suspended</button>
              <button type="button" onClick={() => loadAllPosts()} style={{ marginLeft: '12px' }}>Refresh</button>
            </div>

            {loadingPosts && <p>Loading posts...</p>}

            {!loadingPosts && postsList.length === 0 && (
              <p>No posts found in local storage.</p>
            )}

            {!loadingPosts && postsList.length > 0 && (
              <div className="admin-posts-list">
                {postsList.filter((p) => {
                  if (postsFilter === 'all') return true
                  if (postsFilter === 'user') return p.source === 'user'
                  if (postsFilter === 'page') return p.source === 'page'
                  if (postsFilter === 'suspended') return p.suspended
                  return true
                }).map((post) => (
                  <div key={post.id} className="admin-post-row">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{post.source === 'page' ? `${post.pageName} (page)` : post.author}</strong>
                        <small>{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</small>
                      </div>
                      <p style={{ marginTop: '6px' }}>{post.content}</p>
                      {post.image ? <img src={post.image} alt="post" style={{ maxWidth: '240px', marginTop: '6px' }} /> : null}
                    </div>
                    <div className="admin-post-actions">
                      <button type="button" className="admin-delete-btn" onClick={() => handleDeletePost(post)}>Delete</button>
                      <button type="button" className="admin-reset-btn" onClick={() => handleToggleSuspend(post)}>{post.suspended ? 'Unsuspend' : 'Suspend'}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      case 'events':
      case 'reports':
        return (
          <section className="admin-page-accounts">
            <div className="admin-create-header">
              <h2>{pageTitles[activeSection]}</h2>
              <p>{pageDescriptions[activeSection]}</p>
            </div>
            <div className="admin-create-form">
              <p className="message message-success">This section is ready for future management features.</p>
            </div>
          </section>
        )
      default:
        return (
          <>
            <section id="dashboard" className="stats-grid">
              <div className="stat-card">
                <h3>👥 Users</h3>
                <h2>{users.length || 12540}</h2>
                <p>+8% this month</p>
              </div>

              <div className="stat-card">
                <h3>📝 Posts</h3>
                <h2>48,221</h2>
                <p>+15% this month</p>
              </div>

              <div className="stat-card">
                <h3>📅 Events</h3>
                <h2>327</h2>
                <p>+4% this month</p>
              </div>

              <div className="stat-card">
                <h3>🚩 Reports</h3>
                <h2>18</h2>
                <p>Needs review</p>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="activity-card">
                <h2>Recent Activity</h2>
                <div className="activity-item">
                  <strong>John Doe</strong> created a new event
                </div>
                <div className="activity-item">
                  <strong>Sarah</strong> posted a new update
                </div>
                <div className="activity-item">
                  <strong>Michael</strong> reported a post
                </div>
                <div className="activity-item">
                  <strong>Emma</strong> joined MiitVerse
                </div>
              </div>

              <div className="users-card">
                <h2>Newest Users</h2>
                {newestUsers.length > 0 ? (
                  newestUsers.map((userItem) => (
                    <div className="user-row" key={userItem.id}>
                      <span>{userItem.fullName || userItem.username}</span>
                      <span>{new Date(userItem.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="user-row">
                    <span>No users loaded</span>
                    <span>—</span>
                  </div>
                )}
              </div>
            </section>
          </>
        )
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src="/miitLogo.png" alt="MiitVerse Logo" />

          <div className="admin-logo-text">
            <h2>
              <span className="miit">Miit</span>
              <span className="verse">Verse</span>
            </h2>
            <p>Official Social Hub of MIIT</p>
            <span className="admin-panel">Admin Panel</span>
          </div>
        </div>

        <nav>
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={`admin-nav-item ${activeSection === item.key ? 'active' : ''}`}
                  onClick={() => goToSection(item.key)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back, Admin</p>
          </div>

          <div className="admin-profile">
            <img src="https://i.pravatar.cc/150?img=8" alt="admin" />
            <span>{user?.username || user?.email}</span>
          </div>
        </div>

        <div className="admin-actions">
          <button className="admin-logout" type="button" onClick={logout}>
            Log out
          </button>
        </div>

        <div className="admin-page-shell">
          <div className="admin-page-heading">
            <h1>{pageTitles[activeSection]}</h1>
            <p>{pageDescriptions[activeSection]}</p>
          </div>

          {renderContent()}
        </div>

        {resetPasswordUserId && (
          <section className="admin-reset-password">
            <div className="reset-password-modal">
              <div className="reset-password-header">
                <h3>Reset Password</h3>
                <button
                  type="button"
                  className="reset-password-close"
                  onClick={() => setResetPasswordUserId(null)}
                >
                  ✕
                </button>
              </div>

              {resetMessage.text && (
                <p className={`message message-${resetMessage.type}`}>
                  {resetMessage.text}
                </p>
              )}

              <form onSubmit={handleResetPassword} className="reset-password-form">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="reset-password-actions">
                  <button
                    type="submit"
                    className="form-submit"
                    disabled={resettingPassword}
                  >
                    {resettingPassword ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <button
                    type="button"
                    className="form-cancel"
                    onClick={() => {
                      setResetPasswordUserId(null)
                      setNewPassword('')
                      setResetMessage({ type: '', text: '' })
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
