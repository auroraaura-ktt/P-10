export default function RightSidebar() {
  return (
    <aside className="right-sidebar">
      <div className="widget">
        <div className="widget-header">
          <h3>New Followers</h3>
          <a href="#">View All</a>
        </div>

        <div className="follow-item">
          <div className="follow-avatar">A</div>
          <div>
            <h4>Aung</h4>
            <p>@aung</p>
          </div>
          <button>Follow</button>
        </div>

        <div className="follow-item">
          <div className="follow-avatar">S</div>
          <div>
            <h4>Sara</h4>
            <p>@sara</p>
          </div>
          <button>Follow</button>
        </div>
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
