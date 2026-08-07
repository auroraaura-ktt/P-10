import { useState, useEffect } from "react"
import { useAuth } from '../context/useAuth'
import BottomNav from "../components/BottomNav"
import LeftSidebar from "../components/LeftSidebar"
import RightSidebar from "../components/RightSidebar"
import TopBar from "../components/TopBar"
import CreatePost from "../components/CreatePost"
import StoriesBar from "../components/StoriesBar"
import PostList from "../components/PostList"
import { getVisiblePosts, toggleFollowRelationship } from "../lib/socialFeed"
import { apiRequest } from "../lib/api"

export default function Feed() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [posts, setPosts] = useState([])
  const [following, setFollowing] = useState([])

  useEffect(() => {
    async function loadFeedData() {
      try {
        const savedFollowing = localStorage.getItem("feed-following")
        if (savedFollowing) {
          setFollowing(JSON.parse(savedFollowing))
        }

        if (!user?.id) {
          setPosts([
            {
              id: "welcome-post",
              userId: "system",
              username: "MiitVerse",
              profilePicture: null,
              content: "Welcome to the new feed. Start a conversation with your community.",
              image: null,
              createdAt: new Date().toISOString(),
              likes: 0,
              comments: [],
              reposts: 0,
              visibility: "public",
            },
          ])
          return
        }

        const [{ posts: serverPosts }, { following: serverFollowing }] = await Promise.all([
          apiRequest('/social/posts'),
          apiRequest('/social/follows'),
        ])

        setPosts(serverPosts || [])
        setFollowing(serverFollowing || [])
        localStorage.setItem("feed-following", JSON.stringify(serverFollowing || []))
      } catch (error) {
        console.error("Failed to load feed posts:", error)
        setPosts([])
      }
    }

    loadFeedData()
  }, [user?.id])

  const handleAddPost = async (newPost) => {
    if (!user?.id) {
      setPosts((currentPosts) => {
        const nextPosts = [newPost, ...currentPosts]
        localStorage.setItem("feed-posts", JSON.stringify(nextPosts))
        return nextPosts
      })
      return
    }

    try {
      const { post } = await apiRequest('/social/posts', {
        method: 'POST',
        body: JSON.stringify(newPost),
      })

      setPosts((currentPosts) => [post, ...currentPosts])
    } catch (error) {
      console.error('Failed to save post:', error)
      setPosts((currentPosts) => {
        const nextPosts = [newPost, ...currentPosts]
        localStorage.setItem("feed-posts", JSON.stringify(nextPosts))
        return nextPosts
      })
    }
  }

  const handleFollowToggle = async (targetUser) => {
    if (!user?.id) {
      setFollowing((currentFollowing) => {
        const nextFollowing = toggleFollowRelationship(currentFollowing, targetUser)
        localStorage.setItem("feed-following", JSON.stringify(nextFollowing))
        return nextFollowing
      })
      return
    }

    try {
      const { following: nextFollowing } = await apiRequest('/social/follows', {
        method: 'POST',
        body: JSON.stringify({ targetUser }),
      })

      setFollowing(nextFollowing || [])
      localStorage.setItem("feed-following", JSON.stringify(nextFollowing || []))
    } catch (error) {
      console.error('Failed to update follow state:', error)
    }
  }

  const visiblePosts = getVisiblePosts(posts, user?.id ?? null, following)

  return (
    <div className={`feed-layout ${darkMode ? "dark" : ""}`}>
      <LeftSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="feed-center">
        <TopBar setSidebarOpen={setSidebarOpen} darkMode={darkMode} setDarkMode={setDarkMode} />

        <section className="feed-welcome">
          <div>
            <h2>Welcome back, {user?.username || 'MiitVerse member'}!</h2>
            <p>Check your latest feed posts and manage your account from your profile.</p>
          </div>
        </section>

        <StoriesBar />
        <CreatePost onAddPost={handleAddPost} />
        <PostList posts={visiblePosts} />
      </main>

      <RightSidebar following={following} onFollowToggle={handleFollowToggle} />
      <BottomNav />
    </div>
  );
}