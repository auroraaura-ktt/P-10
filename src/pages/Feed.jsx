import { useState, useEffect } from "react"
import { useAuth } from '../context/useAuth'
import BottomNav from "../components/BottomNav"
import LeftSidebar from "../components/LeftSidebar"
import RightSidebar from "../components/RightSidebar"
import TopBar from "../components/TopBar"
import CreatePost from "../components/CreatePost"
import StoriesBar from "../components/StoriesBar"
import PostList from "../components/PostList"

export default function Feed() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem("feed-posts")
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts))
        return
      }

      const legacyPosts = localStorage.getItem("testPosts")
      if (legacyPosts) {
        setPosts(JSON.parse(legacyPosts))
        return
      }

      setPosts([
        {
          id: "welcome-post",
          userId: user?.id || "system",
          username: "MiitVerse",
          profilePicture: null,
          content: "Welcome to the new feed. Start a conversation with your community.",
          image: null,
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: [],
          reposts: 0,
        },
      ])
    } catch (error) {
      console.error("Failed to load feed posts:", error)
      setPosts([])
    }
  }, [user?.id])

  const handleAddPost = (newPost) => {
    setPosts((currentPosts) => {
      const nextPosts = [newPost, ...currentPosts]
      localStorage.setItem("feed-posts", JSON.stringify(nextPosts))
      return nextPosts
    })
  }

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
        <PostList posts={posts} />
      </main>

      <RightSidebar />
      <BottomNav />
    </div>
  );
}