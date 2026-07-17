import { FaHome, FaCompass, FaCalendarAlt, FaUsers, FaComments } from "react-icons/fa";

const navItems = [
  { label: "Home", icon: FaHome, active: true },
  { label: "Explore", icon: FaCompass },
  { label: "Events", icon: FaCalendarAlt },
  { label: "Community", icon: FaUsers },
  { label: "Messages", icon: FaComments },
];

export default function LeftSidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <aside className={`left-sidebar ${sidebarOpen ? "active" : ""}`}>
      <div className="close-btn" onClick={() => setSidebarOpen(false)}>
        ✕
      </div>

      <div className="sidebar-logo">
        <img src="/miitLogo.png" alt="MiitVerse" className="sidebar-logo-img" />
        <div className="logo-info">
          <h2>
            Miit<span>Verse</span>
          </h2>
          <p>Official Social Hub of MIIT</p>
        </div>
      </div>

      <ul className="sidebar-menu">
        {navItems.map(({ label, icon: Icon, active }) => (
          <li key={label} className={active ? "active" : ""}>
            <Icon />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <div className="sidebar-divider" />

      <div className="profile-card">
        <div className="profile-avatar-large">MK</div>
        <h3>Minn Khant</h3>
        <p>2022-MIIT-CSE-057</p>
        <button className="profile-btn">View Profile</button>
      </div>
    </aside>
  );
}
