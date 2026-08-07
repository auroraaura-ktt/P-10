export default function RightSidebar({ following = [], onFollowToggle = () => {} }) {
  const suggestedUsers = [
    { id: "aung", username: "Aung" },
    { id: "sara", username: "Sara" },
    { id: "mike", username: "Mike" },
  ];

  return (
    <aside className="right-sidebar">
      <div className="widget">
        <div className="widget-header">
          <h3>Follow Friends</h3>
          <a href="#">View All</a>
        </div>

        {suggestedUsers.map((user) => {
          const isFollowing = following.some((entry) => (entry?.id ?? entry?.userId ?? entry?.username) === user.id);

          return (
            <div className="follow-item" key={user.id}>
              <div className="follow-avatar">{user.username.charAt(0)}</div>
              <div>
                <h4>{user.username}</h4>
                <p>@{user.id}</p>
              </div>
              <button type="button" onClick={() => onFollowToggle(user)}>
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="widget">
        <div className="widget-header">
          <h3>Events</h3>
          <a href="#">View All</a>
        </div>

        <div className="event-card">
          <div className="event-icon">📅</div>
          <div>
            <h4>MIIT Tech Talk</h4>
            <p>24 July • 2 PM</p>
          </div>
        </div>
      </div>

      <div className="widget">
        <div className="widget-header">
          <h3>Sponsored</h3>
        </div>

        <div className="event-card">
          <div className="event-icon">🚀</div>
          <div>
            <h4>Learn React</h4>
            <p>Programming Course</p>
          </div>
        </div>

        <button className="learn-btn">Learn More</button>
      </div>
    </aside>
  );
}
