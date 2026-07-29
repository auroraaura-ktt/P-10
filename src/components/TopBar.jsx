import { FaBell, FaComments, FaEnvelope, FaMoon, FaSearch, FaBars } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function TopBar({ setSidebarOpen, darkMode, setDarkMode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const initials = user?.username
    ? user.username
        .split(' ')
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : 'U'

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
      </div>
    </div>
  )
}
