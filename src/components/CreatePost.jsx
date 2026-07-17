import { FaCamera, FaNewspaper, FaCode, FaVideo, FaPaperPlane } from "react-icons/fa";

export default function CreatePost() {
  return (
    <div className="create-post">
      <div className="create-post-top">
        <div className="profile-avatar-small">MK</div>
        <input placeholder="What’s on your mind?" />
      </div>

      <div className="create-post-actions">
        <span>
          <FaCamera /> Photo
        </span>
        <span>
          <FaNewspaper /> Article
        </span>
        <span>
          <FaCode /> Code
        </span>
        <span>
          <FaVideo /> Video
        </span>
        <button>
          <FaPaperPlane /> Post
        </button>
      </div>
    </div>
  );
}
