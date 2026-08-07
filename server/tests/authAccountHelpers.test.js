import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPageAccountPayload } from '../src/utils/authAccountHelpers.js';
import { isPageAccountEmail, isValidRegistrationEmail } from '../src/utils/accountAccess.js';

test('buildPageAccountPayload falls back to the page name and creates a login-ready page account', () => {
  const payload = buildPageAccountPayload({
    pageName: 'Campus News',
    email: 'news@miit.edu.mm',
    password: 'Admin123456',
  });

  assert.equal(payload.username, 'Campus News');
  assert.equal(payload.email, 'news@miit.edu.mm');
  assert.equal(payload.role, 'page');
  assert.equal(payload.verified, true);
  assert.match(payload.slug, /^campus-news$/);
});

test('buildPageAccountPayload uses an explicit username when provided', () => {
  const payload = buildPageAccountPayload({
    username: 'editorial',
    email: 'editorial@miit.edu.mm',
    password: 'Secret123',
  });

  assert.equal(payload.username, 'editorial');
  assert.equal(payload.email, 'editorial@miit.edu.mm');
  assert.equal(payload.role, 'page');
});

test('page accounts accept virtual-domain emails while normal registration stays school-domain only', () => {
  assert.equal(isPageAccountEmail('miitverse@miitverse.com'), true);
  assert.equal(isPageAccountEmail('news@miit.edu.mm'), false);
  assert.equal(isValidRegistrationEmail('miitverse@miitverse.com'), false);
});
