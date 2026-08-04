import PostCard from "./PostCard";

export default function PostList({ posts = [] }) {
  if (posts.length === 0) {
    return <div className="post-list-empty">No posts yet. Start the conversation.</div>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard key={post.id} post={{ ...post, verified: true }} />
      ))}
    </div>
  );
}
