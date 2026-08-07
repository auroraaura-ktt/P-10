export function canUseUserLogin(role) {
  return role === 'user' || role === 'moderator' || role === 'page'
}
