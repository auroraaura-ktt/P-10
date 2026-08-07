import test from 'node:test'
import assert from 'node:assert/strict'

import { canUseUserLogin } from '../src/lib/authAccess.js'

test('blocks admin accounts from the regular user login form', () => {
  assert.equal(canUseUserLogin('admin'), false)
  assert.equal(canUseUserLogin('user'), true)
  assert.equal(canUseUserLogin('moderator'), true)
  assert.equal(canUseUserLogin('page'), true)
})
