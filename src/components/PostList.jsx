import PostCard from "./PostCard";

export default function PostList({ testPosts = [] }) {
  return (
    <>
      {testPosts.length > 0 && (
        <>
          <div className="post-list-note">
            📝 {testPosts.length} Test Post{testPosts.length !== 1 ? "s" : ""} from Admin
          </div>
          {testPosts.map((post) => (
            <PostCard key={post.id} post={{ ...post, verified: true }} />
          ))}
        </>
      )}

      <PostCard />
      <PostCard />
      <PostCard />
    </>
  );
}
