import "./StoriesBar.css";

const stories = [
  { id: 1, name: "You", isYou: true },
  { id: 2, name: "Aung" },
  { id: 3, name: "Luna" },
  { id: 4, name: "John" },
  { id: 5, name: "Sara" },
];

export default function StoriesBar() {
  return (
    <div className="stories-bar">

      {stories.map((s) => {
        return (
          <div key={s.id} className="story">

            {/* avatar */}
            <div
              className="story-avatar"
              style={
                s.isYou
                  ? {
                      background: "var(--yellow)",
                      color: "var(--navy)",
                    }
                  : {}
              }
            >
              {s.name.charAt(0)}
            </div>

            {/* name */}
            <span>{s.name}</span>

          </div>
        );
      })}

    </div>
  );
}