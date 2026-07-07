export function normalizeEmail(email) {
  return email?.trim().toLowerCase() || ''
}

export function isPageAccountEmail(email) {
  const normalizedEmail = normalizeEmail(email)
  return normalizedEmail.endsWith('@miit.edu.mm')
}

export function requiresEmailVerification(email, isPageAccount) {
  return !isPageAccount && isPageAccountEmail(email)
}
