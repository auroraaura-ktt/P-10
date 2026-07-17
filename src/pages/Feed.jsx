import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import BottomNav from "../components/BottomNav";
import { useState, useEffect } from "react";

export default function Feed() {
const [sidebarOpen, setSidebarOpen] = useState(false);
const [darkMode, setDarkMode] = useState(false);
const [testPosts, setTestPosts] = useState([]);

// Load test posts from localStorage on component mount
useEffect(() => {
  const savedPosts = localStorage.getItem('testPosts');
  if (savedPosts) {
    try {
      setTestPosts(JSON.parse(savedPosts));
    } catch (err) {
      console.error('Failed to load test posts:', err);
    }
  }
}, []);

  return (
    <div className={`feed-layout ${darkMode ? "dark" : ""}`}>

      {/* LEFT SIDEBAR (ONLY ONE) */}
      <aside className={`left-sidebar ${sidebarOpen ? "active" : ""}`}>

        <div className="close-btn" onClick={() => setSidebarOpen(false)}>
          ✕
        </div>

        <div className="sidebar-logo">
          <img src="/miitLogo.png" alt="MiitVerse" />

          <div className="logo-info">
            <h2>Miit<span>Verse</span></h2>
            <p>Official Social Hub of MIIT</p>
          </div>
        </div>

        <ul>
          <li>🏠 Home</li>
          <li>🔍 Explore</li>
          <li>📅 Events</li>
          <li>👥 Community</li>
          <li>💬 Messages</li>
        </ul>

        <div className="profile-card">
          <div className="profile-avatar-large">MK</div>
          <h3>Minn Khant</h3>
          <p>2022-MIIT-CSE-057</p>
        </div>

      </aside>

      {/* OVERLAY (OUTSIDE SIDEBAR) */}
      {sidebarOpen && (
        <div
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN FEED */}
      <main className="feed-center">

        <div className="feed-topbar">

          <div
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </div>

          <input
            className="search-bar"
            placeholder="Type to search..."
          />

          <div className="top-icons">
            <span>🔔</span>
            <span>💬</span>
            <span>📧</span>
            <span onClick={() => setDarkMode(!darkMode)}>🌙</span>

            <div className="profile-avatar">MK</div>
          </div>
        </div>

        <StoriesBar />

        <div className="create-post">
          <div className="create-post-top">
            <div className="profile-avatar-small">MK</div>
            <input placeholder="What's on your mind?" />
          </div>

          <div className="create-post-actions">
            <span>📷 Photo</span>
            <span>📰 Article</span>
            <span>💻 Code</span>
            <span>🎥 Video</span>
            <button>Post</button>
          </div>
        </div>

        {/* Display test posts from admin */}
        {testPosts.length > 0 && (
          <>
            <div style={{ padding: '16px', background: 'rgba(100, 255, 218, 0.1)', borderRadius: '12px', marginBottom: '16px', textAlign: 'center', color: '#64ffda', fontWeight: '600' }}>
              📝 {testPosts.length} Test Post{testPosts.length !== 1 ? 's' : ''} from Admin
            </div>
            {testPosts.map((post) => (
              <PostCard key={post.id} post={{ ...post, verified: true }} />
            ))}
          </>
        )}

        {/* Default static posts */}
        <PostCard />
        <PostCard />
        <PostCard />

      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="right-sidebar">
        <div className="widget"><h3>New Followers</h3></div>
        <div className="widget"><h3>Events</h3></div>
        <div className="widget"><h3>Sponsored</h3></div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <BottomNav />

    </div>
  );
}