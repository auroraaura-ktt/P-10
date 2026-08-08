import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomInt, randomUUID } from 'node:crypto'

import { driver } from '../config/neo4j.js'
import { env } from '../config/env.js'
import { normalizeEmail, isPageAccountEmail, isValidRegistrationEmail } from '../utils/accountAccess.js'
import { sendVerificationEmail } from '../utils/emailService.js'
import { createPageRecord, getPageRecordByOwner as getPageRecordByOwnerFromPersistence } from '../utils/pagePersistence.js'
import { persistUserToBothDatabases, getUserFromMongo, writeUserToMongo } from '../utils/userPersistence.js'
import { buildPageAccountPayload } from '../utils/authAccountHelpers.js'

const pendingRegistrations = new Map()
const verificationTtlMs = 15 * 60 * 1000
const verificationResendCooldownMs = 3 * 60 * 1000

function getUserProperties(node) {
  return node?.properties ?? node ?? {}
}

function serializeUser(record) {
  const user = getUserProperties(record?.get('user'))

  if (!user) {
    return null
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }
}

function sendVerificationEmailInBackground(email, code, pendingRegistration) {
  sendVerificationEmail(email, code)
    .then(() => {
      if (pendingRegistration) {
        pendingRegistration.emailDeliveryFailed = false
        pendingRegistration.lastSentAt = Date.now()
      }
      console.log(`Verification code successfully sent to ${email}`)
    })
    .catch((error) => {
      console.error(`Failed to send verification email to ${email}:`, error.message)
      if (pendingRegistration) {
        pendingRegistration.emailDeliveryFailed = true
        pendingRegistration.lastSendError = error.message
      }
    })
}

export async function registerUser(req, res) {
  const { username, email, password } = req.body || {}
  const trimmedUsername = username?.trim()
  const normalizedEmail = normalizeEmail(email)

  if (!trimmedUsername || !normalizedEmail || !password) {
    return res.status(400).json({
      message: 'username, email, and password are required',
    })
  }

  if (!isValidRegistrationEmail(normalizedEmail)) {
    return res.status(400).json({
      message: 'Only @miit.edu.mm email addresses are allowed for registration.',
    })
  }

  const existingMongoEmail = await getUserFromMongo(normalizedEmail)
  const existingMongoUsername = existingMongoEmail ? existingMongoEmail : await getUserFromMongo(trimmedUsername)

  if (existingMongoEmail || existingMongoUsername) {
    return res.status(409).json({ message: 'User already exists' })
  }

  const session = driver.session()

  try {
    const existing = await session.executeRead((tx) =>
      tx.run(
        `
          MATCH (user:User)
          WHERE user.email = $email OR user.username = $username
          RETURN user
          LIMIT 1
        `,
        { email: normalizedEmail, username: trimmedUsername }
      )
    )

    if (existing.records.length > 0) {
      return res.status(409).json({ message: 'User already exists' })
    }

    // Check whether the username is already pending for a different email.
    // Allow updating/resending for the same email (avoid blocking existing pending entries).
    const pendingUsernameExists = Array.from(pendingRegistrations.values()).some(
      (registration) => registration.username === trimmedUsername && registration.email !== normalizedEmail
    )

    let existingPending = pendingRegistrations.get(normalizedEmail)

    if (existingPending && existingPending.verificationExpires < Date.now()) {
      pendingRegistrations.delete(normalizedEmail)
      existingPending = null
    }

    if (existingPending) {
      const elapsedMs = Date.now() - (existingPending.lastSentAt || 0)

      if (elapsedMs < verificationResendCooldownMs) {
        return res.status(429).json({
          message: 'Verification already pending. Please wait before requesting a new code.',
          resendAvailableAt: new Date((existingPending.lastSentAt || 0) + verificationResendCooldownMs).toISOString(),
        })
      }

      if (
        trimmedUsername !== existingPending.username &&
        Array.from(pendingRegistrations.values()).some(
          (registration) => registration.email !== normalizedEmail && registration.username === trimmedUsername
        )
      ) {
        return res.status(409).json({ message: 'Username already pending verification' })
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const verificationCode = randomInt(10000000, 100000000).toString()
      const verificationExpires = Date.now() + verificationTtlMs

      existingPending.username = trimmedUsername
      existingPending.passwordHash = passwordHash
      existingPending.verificationCode = verificationCode
      existingPending.verificationExpires = verificationExpires
      existingPending.lastSentAt = Date.now()

      // Keep the original createdAt timestamp if present
      existingPending.createdAt ||= new Date().toISOString()

      pendingRegistrations.set(normalizedEmail, existingPending)
    } else {
      if (pendingUsernameExists) {
        return res.status(409).json({ message: 'Verification already pending' })
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const createdAt = new Date().toISOString()
      const verificationCode = randomInt(10000000, 100000000).toString()
      const verificationExpires = Date.now() + verificationTtlMs

      // Store pending registration temporarily
      pendingRegistrations.set(normalizedEmail, {
        username: trimmedUsername,
        email: normalizedEmail,
        passwordHash,
        verificationCode,
        verificationExpires,
        lastSentAt: Date.now(),
        createdAt,
      })
    }

    const pending = pendingRegistrations.get(normalizedEmail)
    sendVerificationEmailInBackground(normalizedEmail, pending.verificationCode, pending)

    return res.status(201).json({
      message: 'Verification email sending has started. Please check your inbox within a few seconds.',
      email: normalizedEmail,
      resendAvailableAt: new Date((pending.lastSentAt || Date.now()) + verificationResendCooldownMs).toISOString(),
      verificationExpiresAt: new Date(pending.verificationExpires).toISOString(),
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ message: 'Registration failed' })
  } finally {
    await session.close()
  }
}

export async function resendVerificationCode(req, res) {
  const { email } = req.body || {}
  const normalizedEmail = email?.trim().toLowerCase()

  if (!normalizedEmail) {
    return res.status(400).json({ message: 'email is required' })
  }

  const pendingRegistration = pendingRegistrations.get(normalizedEmail)

  if (!pendingRegistration) {
    return res.status(404).json({ message: 'No verification pending' })
  }

  if (pendingRegistration.verificationExpires < Date.now()) {
    pendingRegistrations.delete(normalizedEmail)
    return res.status(400).json({ message: 'Verification code expired. Please register again.' })
  }

  const elapsedMs = Date.now() - (pendingRegistration.lastSentAt || 0)

  if (elapsedMs < verificationResendCooldownMs) {
    return res.status(429).json({
      message: 'Please wait before requesting a new code.',
      resendAvailableAt: new Date((pendingRegistration.lastSentAt || 0) + verificationResendCooldownMs).toISOString(),
    })
  }

  const verificationCode = randomInt(10000000, 100000000).toString()
  pendingRegistration.verificationCode = verificationCode
  pendingRegistration.verificationExpires = Date.now() + verificationTtlMs
  pendingRegistration.lastSentAt = Date.now()

  sendVerificationEmailInBackground(normalizedEmail, verificationCode, pendingRegistration)
  console.log(`Background resend started for ${normalizedEmail}`)

  return res.status(200).json({
    message: 'Verification email resend started. Please check your inbox shortly.',
    resendAvailableAt: new Date(pendingRegistration.lastSentAt + verificationResendCooldownMs).toISOString(),
    verificationExpiresAt: new Date(pendingRegistration.verificationExpires).toISOString(),
  })
}

export async function doesPageAccountAlreadyExist(accountPayload, deps = {}) {
  const { getUser = getUserFromMongo, driverInstance = driver } = deps

  const existingEmailUser = await getUser(accountPayload.email)
  const existingUsernameUser = await getUser(accountPayload.username)

  if (existingEmailUser || (existingUsernameUser && existingUsernameUser.role === 'page')) {
    return true
  }

  const session = driverInstance.session()

  try {
    const existing = await session.executeRead((tx) =>
      tx.run(
        `
          MATCH (user:User)
          WHERE user.email = $email
            OR (user.role = 'page' AND toLower(user.username) = toLower($username))
          RETURN user
          LIMIT 1
        `,
        { email: accountPayload.email, username: accountPayload.username }
      )
    )

    return existing.records.length > 0
  } finally {
    await session.close()
  }
}

export async function createPageAccount(req, res) {
  const { username, email, password, pageName } = req.body || {}
  const accountPayload = buildPageAccountPayload({ username, email, password, pageName })

  if (!accountPayload.username || !accountPayload.email || !accountPayload.password) {
    return res.status(400).json({ message: 'username, email, and password are required' })
  }

  if (!isPageAccountEmail(accountPayload.email)) {
    return res.status(400).json({ message: 'Page accounts must use an @miitverse.com email address.' })
  }

  if (await doesPageAccountAlreadyExist(accountPayload)) {
    return res.status(409).json({ message: 'Page account already exists' })
  }

  const session = driver.session()

  try {
    const passwordHash = await bcrypt.hash(accountPayload.password, 10)
    const createdAt = new Date().toISOString()
    const userId = randomUUID()
    const mongoUserData = {
      id: userId,
      username: accountPayload.username,
      email: accountPayload.email,
      passwordHash,
      role: 'page',
      verified: true,
      createdAt,
    }

    const mongoResult = await writeUserToMongo(mongoUserData)

    await persistUserToBothDatabases(mongoUserData)

    const result = { records: [{ get: () => ({ properties: mongoResult }) }] }

    let pageRecordError = null

    try {
      await createPageRecord({
        id: userId,
        pageName: accountPayload.pageName || accountPayload.username,
        slug: accountPayload.slug || accountPayload.username,
        email: accountPayload.email,
        ownerId: userId,
        description: `Official page for ${accountPayload.pageName || accountPayload.username}`,
      })
    } catch (error) {
      console.error('Page record creation error:', error)
      pageRecordError = error
    }

    const responseMessage = pageRecordError
      ? 'Page account created, but the page metadata could not be generated. The account can still sign in and page data will be completed on first login.'
      : 'Page account created successfully. It can sign in with its email and password.'

    return res.status(201).json({
      message: responseMessage,
      user: serializeUser(result.records[0]),
    })
  } catch (error) {
    console.error('Page account creation error:', error)
    return res.status(500).json({ message: 'Page account creation failed' })
  } finally {
    await session.close()
  }
}

export async function verifyUser(req, res) {
  const { email, code } = req.body || {}
  const normalizedEmail = email?.trim().toLowerCase()
  const trimmedCode = code?.trim()

  if (!normalizedEmail || !trimmedCode) {
    return res.status(400).json({ message: 'email and code are required' })
  }

  if (!/^\d{8}$/.test(trimmedCode)) {
    return res.status(400).json({ message: 'Verification code must be 8 digits' })
  }

  const session = driver.session()

  try {
    const pendingRegistration = pendingRegistrations.get(normalizedEmail)

    if (!pendingRegistration) {
      return res.status(404).json({ message: 'No verification pending' })
    }

    if (pendingRegistration.verificationCode !== trimmedCode) {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    if (pendingRegistration.verificationExpires < Date.now()) {
      pendingRegistrations.delete(normalizedEmail)
      return res.status(400).json({ message: 'Verification code expired' })
    }

    const existingMongoEmail = await getUserFromMongo(normalizedEmail)
    const existingMongoUsername = existingMongoEmail ? existingMongoEmail : await getUserFromMongo(pendingRegistration.username)

    if (existingMongoEmail || existingMongoUsername) {
      pendingRegistrations.delete(normalizedEmail)
      return res.status(409).json({ message: 'User already exists' })
    }

    const existingNeo4j = await session.executeRead((tx) =>
      tx.run(
        `
          MATCH (user:User)
          WHERE user.email = $email OR user.username = $username
          RETURN user
          LIMIT 1
        `,
        {
          email: normalizedEmail,
          username: pendingRegistration.username,
        }
      )
    )

    if (existingNeo4j.records.length > 0) {
      pendingRegistrations.delete(normalizedEmail)
      return res.status(409).json({ message: 'User already exists' })
    }

    const userId = randomUUID()
    const userData = {
      id: userId,
      username: pendingRegistration.username,
      email: pendingRegistration.email,
      passwordHash: pendingRegistration.passwordHash,
      role: 'user',
      verified: true,
      createdAt: pendingRegistration.createdAt,
    }

    const mongoResult = await writeUserToMongo(userData)
    await persistUserToBothDatabases(userData)

    pendingRegistrations.delete(normalizedEmail)

    return res.status(201).json({
      message: 'Email verified. Account created.',
      user: serializeUser({ properties: mongoResult }),
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Verification failed' })
  } finally {
    await session.close()
  }
}

export async function buildLoginResponseUser(
  user,
  getPageRecordByOwnerFn = getPageRecordByOwnerFromPersistence,
  createPageRecordFn = createPageRecord
) {
  const responseUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  }

  if (user.role === 'page') {
    let pageRecord = await getPageRecordByOwnerFn(user.id)

    if (!pageRecord) {
      const fallbackPageName = String(user.username || user.email || '').trim() || 'page'
      const fallbackSlug = String(user.username || fallbackPageName)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      pageRecord = await createPageRecordFn({
        id: user.id,
        pageName: fallbackPageName,
        slug: fallbackSlug,
        email: user.email,
        ownerId: user.id,
        description: `Official page for ${fallbackPageName}`,
      })
    }

    if (pageRecord?.slug) {
      responseUser.pageSlug = pageRecord.slug
    }
  }

  return responseUser
}

export async function loginUser(req, res) {
  const { email, password } = req.body || {}
  const normalizedEmail = normalizeEmail(email)
  const identifier = normalizedEmail || (email?.trim() || '')

  if (!identifier || !password) {
    return res.status(400).json({ message: 'email or username and password are required' })
  }

  let user = null
  let passwordMatches = false
  let session = null

  try {
    user = await getUserFromMongo(identifier)

    if (!user) {
      session = driver.session()

      try {
        const result = await session.executeRead((tx) =>
          tx.run(
            `
              MATCH (user:User)
              WHERE toLower(user.email) = toLower($identifier)
                 OR toLower(user.username) = toLower($identifier)
              RETURN user
              LIMIT 1
            `,
            { identifier }
          )
        )

        if (result.records.length > 0) {
          user = getUserProperties(result.records[0].get('user'))
        }
      } catch (error) {
        console.warn('Neo4j login lookup failed, falling back to MongoDB:', error.message)
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (user.suspended) {
      return res.status(403).json({ message: 'This account has been suspended. Please contact an administrator.' })
    }

    passwordMatches = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username,
        email: user.email,
      },
      env.jwtSecret,
      { expiresIn: '7d' }
    )

    const responseUser = await buildLoginResponseUser(user)

    return res.json({
      message: 'Login successful',
      token,
      user: responseUser,
    })
  } catch (error) {
    console.error('Login failed:', error.message)
    return res.status(500).json({ message: 'Login failed' })
  } finally {
    if (session) {
      await session.close()
    }
  }
}
