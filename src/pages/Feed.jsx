import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import TopBar from "../components/TopBar";
import CreatePost from "../components/CreatePost";
import StoriesBar from "../components/StoriesBar";
import PostList from "../components/PostList";

export default function Feed() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [testPosts, setTestPosts] = useState([]);

  useEffect(() => {
    const savedPosts = localStorage.getItem("testPosts");
    if (savedPosts) {
      try {
        setTestPosts(JSON.parse(savedPosts));
      } catch (err) {
        console.error("Failed to load test posts:", err);
      }
    }
  }, []);

  return (
    <div className={`feed-layout ${darkMode ? "dark" : ""}`}>
      <LeftSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="feed-center">
        <TopBar setSidebarOpen={setSidebarOpen} darkMode={darkMode} setDarkMode={setDarkMode} />
        <StoriesBar />
        <CreatePost />
        <PostList testPosts={testPosts} />
      </main>

      <RightSidebar />
      <BottomNav />
    </div>
  );
}