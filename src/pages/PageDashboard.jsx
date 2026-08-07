import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { buildPagePost, normalizePagePosts } from '../lib/pagePosts'
import './Admin.css'

export default function PageDashboard() {
  const { slug } = useParams()
  const { token, user } = useAuth()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [posts, setPosts] = useState([])
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [message, setMessage] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState('')

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

  useEffect(() => {
    let active = true

    async function loadPosts() {
      setLoading(true)
      try {
        if (!page?.id) {
          setPosts([])
          return
        }

        const data = await apiRequest(`/social/posts?userId=${encodeURIComponent(page.id)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (active) {
          setPosts(normalizePagePosts(data.posts || []))
        }
      } catch (e) {
        if (active) setPosts([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPosts()
    return () => {
      active = false
    }
  }, [page?.id, token, slug])

  const pageTitle = useMemo(() => page?.pageName || 'Page Dashboard', [page])

  const handlePostSubmit = (event) => {
    event.preventDefault()
    const trimmed = draft.trim()

    if (!trimmed && !imagePreview) {
      setMessage('Write something or attach an image before publishing to the page.')
      return
    }
    ;(async () => {
      setPosting(true)
      try {
        const body = {
          content: trimmed,
          image: imagePreview || null,
        }

        const data = await apiRequest('/social/posts', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })

        const nextPost = buildPagePost({
          ...data.post,
        })

        const nextPosts = normalizePagePosts([nextPost, ...posts])
        setPosts(nextPosts)
        setDraft('')
        setImagePreview(null)
        setImageError('')
        setMessage('Post published to the page feed.')
      } catch (err) {
        setMessage(err.message || 'Failed to publish post')
      } finally {
        setPosting(false)
      }
    })()
  }

  const handleImageChange = (event) => {
    setImageError('')
    const file = event.target.files && event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageError('Only image files are allowed')
      return
    }

    // limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be 5MB or smaller')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setImageError('')
    // reset file input value if needed — handled by uncontrolled input change
  }

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
          <h2>{posts.length}</h2>
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
          <h2>Create Page Post</h2>
          <p>Share a status update, announcement, or public message from this page.</p>
        </div>

        <form className="admin-create-form" onSubmit={handlePostSubmit}>
          <label htmlFor="pagePost">Page update</label>
          <textarea
            id="pagePost"
            name="pagePost"
            rows="4"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              if (message) {
                setMessage('')
              }
            }}
            placeholder={`Write something for ${pageTitle}`}
          />

          <div style={{ marginTop: '8px' }}>
            <label htmlFor="pageImage">Attach image (optional)</label>
            <input
              id="pageImage"
              name="pageImage"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleImageChange(e)
                if (message) setMessage('')
              }}
            />
            {imageError ? <p className="message message-error">{imageError}</p> : null}
            {imagePreview ? (
              <div style={{ marginTop: '8px' }}>
                <img src={imagePreview} alt="preview" style={{ maxWidth: '100%', maxHeight: '240px' }} />
                <div>
                  <button type="button" onClick={handleRemoveImage} style={{ marginTop: '6px' }}>Remove image</button>
                </div>
              </div>
            ) : null}
          </div>

          <button type="submit" disabled={posting}>
            {posting ? 'Publishing...' : 'Publish Post'}
          </button>
          {message ? <p className="message message-success">{message}</p> : null}
        </form>
      </section>

      <section className="admin-page-accounts" style={{ marginTop: '24px' }}>
        <div className="admin-create-header">
          <h2>Page Feed</h2>
          <p>Recent posts published from this special page account.</p>
        </div>

        {posts.length === 0 ? (
          <p>No posts yet. Publish the first update above.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="admin-create-form" style={{ marginTop: '12px' }}>
              <p><strong>{pageTitle}</strong></p>
              <p>{post.content}</p>
              {post.image ? <img src={post.image} alt="post" style={{ maxWidth: '100%', marginTop: '8px' }} /> : null}
              <small>{new Date(post.createdAt).toLocaleString()}</small>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
