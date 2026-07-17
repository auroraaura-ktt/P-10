import { FaBell, FaComments, FaEnvelope, FaMoon, FaSearch, FaBars } from "react-icons/fa";

export default function TopBar({ setSidebarOpen, darkMode, setDarkMode }) {
  return (
    <div className="feed-topbar">
      <div className="menu-btn" onClick={() => setSidebarOpen(true)}>
        <FaBars />
      </div>

      <div className="search-bar-wrap">
        <FaSearch />
        <input className="search-bar" placeholder="Search..." />
      </div>

      <div className="top-icons">
        <span>
          <FaBell />
        </span>
        <span>
          <FaComments />
        </span>
        <span>
          <FaEnvelope />
        </span>
        <span onClick={() => setDarkMode(!darkMode)}>
          <FaMoon />
        </span>
        <div className="profile-avatar">MK</div>
      </div>
    </div>
  );
}
