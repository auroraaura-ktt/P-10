import { normalizeEmail } from './accountAccess.js';

export function buildPageAccountPayload(input = {}) {
  const username = String(input.username || input.pageName || '').trim();
  const email = normalizeEmail(input.email);
  const password = String(input.password || '').trim();
  const pageName = String(input.pageName || username || '').trim();

  return {
    username,
    email,
    password,
    pageName,
    role: 'page',
    verified: true,
    slug: String(pageName).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  };
}
