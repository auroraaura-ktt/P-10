import test from 'node:test'
import assert from 'node:assert/strict'

import { doesPageAccountAlreadyExist } from '../src/controllers/authController.js'

const existingPageEmail = 'miitverse@miitverse.com'
const existingPageUsername = 'Student Affair'
const existingNonPageUsername = 'admin'

const mockPageUser = {
  id: 'page-123',
  username: 'Student Affair',
  email: existingPageEmail,
  role: 'page',
}

const mockNonPageUser = {
  id: 'user-123',
  username: 'admin',
  email: 'admin@miit.edu.mm',
  role: 'user',
}

function createPayload(email, username) {
  return { email, username }
}

function makeDriverStub(records = []) {
  return {
    session: () => ({
      executeRead: async () => ({ records }),
      close: async () => {},
    }),
  }
}

test('page account duplicate detection rejects when email already exists', async () => {
  const payload = createPayload(existingPageEmail, 'newpage')
  const exists = await doesPageAccountAlreadyExist(payload, {
    getUser: async (identifier) => (identifier === existingPageEmail ? mockPageUser : null),
    driverInstance: makeDriverStub(),
  })

  assert.equal(exists, true)
})

test('page account duplicate detection rejects when page username already exists', async () => {
  const payload = createPayload('newpage@miitverse.com', existingPageUsername)
  const exists = await doesPageAccountAlreadyExist(payload, {
    getUser: async (identifier) => (identifier === existingPageUsername ? mockPageUser : null),
    driverInstance: makeDriverStub(),
  })

  assert.equal(exists, true)
})

test('page account duplicate detection allows when non-page username exists', async () => {
  const payload = createPayload('studentaffair@miitverse.com', existingNonPageUsername)
  const exists = await doesPageAccountAlreadyExist(payload, {
    getUser: async (identifier) => (identifier === existingNonPageUsername ? mockNonPageUser : null),
    driverInstance: makeDriverStub(),
  })

  assert.equal(exists, false)
})
