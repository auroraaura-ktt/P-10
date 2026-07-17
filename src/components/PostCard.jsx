import "./PostCard.css";
import { useState, useEffect } from "react";
import ReactionModal from "./ReactionModal";
import VerifiedBadge from "./VerifiedBadge";

export default function PostCard({ post = {} }) {
  // Default post data for static display if no post prop provided
  const {
    id = "default",
    author = "Student Affair",
    avatar = "SA",
    timestamp = "1h ago",
    content = "The final exam timetable has been published. Check your exam dates and plan ahead.",
    image = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",
    title = "Final Exam Schedule Now Available",
    verified = true,
  } = post;

  // Reaction state - persisted to localStorage
  const [reactions, setReactions] = useState(() => {
    const saved = localStorage.getItem(`post-reactions-${id}`);
    return saved ? JSON.parse(saved) : {
      likes: post.likes || 24,
      comments: post.comments || 12,
      shares: post.shares || 5,
      liked: false,
    };
  });

  const [showReactionModal, setShowReactionModal] = useState(false);

  // Save reactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`post-reactions-${id}`, JSON.stringify(reactions));
  }, [reactions, id]);

  const handleLike = () => {
    setReactions(prev => ({
      ...prev,
      liked: !prev.liked,
      likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
    }));
  };

  const handleComment = () => {
    setReactions(prev => ({
      ...prev,
      comments: prev.comments + 1,
    }));
  };

  const handleShare = () => {
    setReactions(prev => ({
      ...prev,
      shares: prev.shares + 1,
    }));
  };

  const handleReactionCountClick = () => {
    setShowReactionModal(true);
  };

  return (
    <>
      <ReactionModal
        isOpen={showReactionModal}
        onClose={() => setShowReactionModal(false)}
        post={post}
        reactions={reactions}
      />

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
                fontSize: avatar?.length > 2 ? "12px" : "16px",
              }}
            >
              {avatar}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="post-card-author" style={{ fontWeight: "600" }}>{author}</span>
              {verified && <VerifiedBadge size="small" />}
            </div>
            <div className="post-card-time">{timestamp}</div>
          </div>
        </div>

        <span style={{ fontSize: "20px", cursor: "pointer" }}>⋯</span>
      </div>

      {/* Content */}
      <div style={{ padding: "0 16px 16px" }}>
        {title && (
          <h3
            className="post-card-title"
            style={{
              marginBottom: "8px",
            }}
          >
            {title}
          </h3>
        )}

        <p
          className="post-card-body"
          style={{
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {content}
        </p>
      </div>

      {/* Image - Only show if image URL exists */}
      {image && (
        <img
          src={image}
          alt="post"
          style={{
            width: "100%",
            maxHeight: "550px",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}

      {/* Reactions Count */}
      <div
        className="post-reactions-count"
        onClick={handleReactionCountClick}
        style={{
          padding: "12px 16px",
          fontSize: "14px",
          color: "#4B5D7A",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f8f8")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span>❤️ {reactions.likes} Likes</span>
        <span>💬 {reactions.comments} Comments · 📤 {reactions.shares} Reposts</span>
      </div>

      {/* Actions - Clickable */}
      <div
        className="post-actions"
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "12px 0",
          borderBottom: "1px solid #eee",
        }}
      >
        <button
          className="post-action-btn"
          onClick={handleLike}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
            color: reactions.liked ? "#e74c3c" : undefined,
            fontWeight: reactions.liked ? "600" : "normal",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!reactions.liked) e.target.style.color = "#e74c3c";
          }}
          onMouseLeave={(e) => {
            if (!reactions.liked) e.target.style.color = "#0B1E4F";
          }}
        >
          <span style={{ fontSize: "18px" }}>❤️</span>
          <span>Like</span>
        </button>

        <button
          className="post-action-btn"
          onClick={handleComment}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#F5B62D")}
          onMouseLeave={(e) => (e.target.style.color = "#F7F9FC")}
        >
          <span style={{ fontSize: "18px" }}>💬</span>
          <span>Comment</span>
        </button>

        <button
          className="post-action-btn"
          onClick={handleShare}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#F5B62D")}
          onMouseLeave={(e) => (e.target.style.color = "#F7F9FC")}
        >
          <span style={{ fontSize: "18px" }}>📤</span>
          <span>Repost</span>
        </button>

        <button
          className="post-action-btn"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: "8px",
            fontSize: "16px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#F5B62D")}
          onMouseLeave={(e) => (e.target.style.color = "#F7F9FC")}
        >
          <span style={{ fontSize: "18px" }}>🔖</span>
          <span>Save</span>
        </button>
      </div>

      {/* Engagement Stats */}
      <div className="post-engagement" style={{ padding: "12px 16px" }}>
        <div
          className="post-card-engagement-count"
          style={{
            fontWeight: "600",
            marginBottom: "8px",
            fontSize: "14px",
            cursor: "pointer",
            color: "#F5B62D",
          }}
          onClick={handleReactionCountClick}
        >
          {reactions.liked ? "You and " : ""}{reactions.likes - (reactions.liked ? 1 : 0)} {reactions.likes - (reactions.liked ? 1 : 0) === 1 ? "other person" : "others"} liked this
        </div>

        <p
          className="post-card-body"
          style={{
            lineHeight: "1.5",
            fontSize: "14px",
            marginBottom: "8px",
          }}
        >
          <strong>{author}</strong> {verified && <VerifiedBadge size="small" />} {content.substring(0, 80)}
          {content.length > 80 ? "..." : ""}
        </p>

        <div
          className="post-card-comments-link"
          style={{
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: "600",
          }}
          onClick={handleReactionCountClick}
        >
          View all {reactions.comments} comments
        </div>
      </div>
    </div>
    </>
  );
}