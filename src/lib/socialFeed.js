export function getVisiblePosts(posts = [], currentUserId = null, following = []) {
  const followingIds = new Set((following || []).map((entry) => entry?.id ?? entry));

  return (posts || []).filter((post) => {
    if (!post) return false;

    if (post.visibility === 'public') return true;
    if (!currentUserId) return false;
    if (post.userId === currentUserId) return true;
    if (post.visibility === 'followers' && followingIds.has(post.userId)) return true;
    if (post.visibility === 'private') return false;
    return true;
  });
}

export function shouldPersistSocialPost({ user, ready, authToken }) {
  if (typeof authToken === 'string' && authToken.trim()) {
    return true;
  }

  return ready && Boolean(user?.id);
}

export function toggleFollowRelationship(currentFollowing = [], targetUser = null) {
  if (!targetUser) return currentFollowing;

  const targetId = targetUser.id ?? targetUser.userId ?? targetUser.username;
  if (!targetId) return currentFollowing;

  const exists = currentFollowing.some((entry) => (entry?.id ?? entry?.userId ?? entry?.username) === targetId);

  if (exists) {
    return currentFollowing.filter((entry) => (entry?.id ?? entry?.userId ?? entry?.username) !== targetId);
  }

  return [...currentFollowing, { id: targetId, username: targetUser.username || 'User' }];
}
