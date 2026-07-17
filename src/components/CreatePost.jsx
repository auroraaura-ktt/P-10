import { useEffect, useRef, useState } from "react";
import { FaCamera, FaNewspaper, FaCode, FaVideo, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../context/useAuth";

export default function CreatePost() {
  const { user } = useAuth();
  const [videoOpen, setVideoOpen] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const initials = user?.username
    ? user.username
        .split(" ")
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "U";

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (videoOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [videoOpen]);

  async function handleOpenVideo() {
    if (videoOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setVideoOpen(false);
      setStreamError(null);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setVideoOpen(true);
      setStreamError(null);
    } catch (error) {
      setStreamError("Unable to access camera. Please allow camera permission.");
      setVideoOpen(false);
    }
  }

  return (
    <div className="create-post">
      <div className="create-post-top">
        <div className="profile-avatar-small">{initials}</div>
        <input placeholder="What’s on your mind?" />
      </div>

      {videoOpen && (
        <div className="create-post-video-preview">
          <video ref={videoRef} autoPlay playsInline muted className="video-preview" />
          <button type="button" className="close-video-btn" onClick={handleOpenVideo}>
            Close camera
          </button>
        </div>
      )}

      {streamError && <p className="stream-error">{streamError}</p>}

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
        <span className="video-trigger" onClick={handleOpenVideo}>
          <FaVideo /> Video
        </span>
        <button type="button">
          <FaPaperPlane /> Post
        </button>
      </div>
    </div>
  );
}
