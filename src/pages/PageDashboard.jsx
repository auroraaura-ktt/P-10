import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import './Admin.css'

export default function PageDashboard() {
  const { slug } = useParams()
  const { token } = useAuth()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadPage() {
      setLoading(true)
      setError('')

      try {
        const data = await apiRequest(`/auth/pages/${encodeURIComponent(slug)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (active) {
          setPage(data.page)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load page')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadPage()
    return () => {
      active = false
    }
  }, [slug, token])

  const pageTitle = useMemo(() => page?.pageName || 'Page Dashboard', [page])

  if (loading) {
    return <div className="admin-page-shell">Loading page dashboard...</div>
  }

  if (error || !page) {
    return <div className="admin-page-shell"><p className="message message-error">{error || 'Page not found.'}</p><Link to="/admin">Back to admin</Link></div>
  }

  return (
    <div className="admin-page-shell">
      <div className="admin-page-heading">
        <h1>{pageTitle}</h1>
        <p>{page.description || 'This page dashboard is ready for posts and updates.'}</p>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <h3>Posts</h3>
          <h2>{page.posts?.length || 0}</h2>
          <p>Published updates</p>
        </div>
        <div className="stat-card">
          <h3>Followers</h3>
          <h2>0</h2>
          <p>New audience</p>
        </div>
        <div className="stat-card">
          <h3>Reach</h3>
          <h2>0</h2>
          <p>Engagement score</p>
        </div>
      </section>

      <section className="admin-page-accounts" style={{ marginTop: '24px' }}>
        <div className="admin-create-header">
          <h2>Page Overview</h2>
          <p>This dashboard is connected to the database and ready for real page content.</p>
        </div>
        <div className="admin-create-form">
          <p><strong>Email:</strong> {page.email}</p>
          <p><strong>Slug:</strong> {page.slug}</p>
          <p><strong>Status:</strong> {page.verified ? 'Verified' : 'Pending'}</p>
        </div>
      </section>
    </div>
  )
}
