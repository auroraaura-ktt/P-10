import "./PostCard.css";
export default function PostCard() {
  return (
<div className="post-card">
      {/* Header */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    <div
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background:
          "linear-gradient(45deg,#f58529,#feda77,#dd2a7b,#8134af,#515bd4)",
        padding: "2px",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "#001e62",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
        }}
      >
        SA
      </div>
    </div>

    <div>
      <div style={{ fontWeight: "600" }}>
        Student Affair ✓
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#666",
        }}
      >
        1h ago
      </div>
    </div>
  </div>

  <span style={{ fontSize: "20px" }}>⋯</span>
</div>

      {/* Content */}
      <div style={{ padding: "0 16px 16px" }}>
        <h3
          style={{
            color: "#001e62",
            marginBottom: "8px",
          }}
        >
          Final Exam Schedule Now Available
        </h3>

        <p
          style={{
            color: "#555",
            lineHeight: "1.6",
          }}
        >
          The final exam timetable has been published.
          Check your exam dates and plan ahead.
        </p>
      </div>

      {/* Image */}
      <img
        src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200"
        alt="post"
        style={{
          width: "100%",
          height: "550px",
          objectFit: "cover",
          display: "block",
        }}
      />
      {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
              fontSize: "22px",
            }}
          >
            <span>❤️</span>
            <span>💬</span>
            <span>📤</span>
            </div>

            <span style={{ fontSize: "22px" }}>🔖</span>
         </div>
         <div style={{ padding: "0 16px 16px" }}>
  <div
    style={{
      fontWeight: "600",
      marginBottom: "8px",
    }}
  >
    Liked by Grace and 24 others
  </div>

  <p
    style={{
      lineHeight: "1.5",
      color: "#333",
    }}
  >
    <strong>studentaffair</strong> Final exam schedule has
    been published. Check your exam dates and prepare
    ahead.
  </p>

  <div
    style={{
      color: "#777",
      marginTop: "8px",
      fontSize: "14px",
    }}
  >
    View all 12 comments
  </div>
</div>
    </div>
  );
}