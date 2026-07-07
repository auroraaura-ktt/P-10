import { driver } from '../config/neo4j.js'
import bcrypt from 'bcryptjs'

function getUserProperties(node) {
  return node?.properties ?? node ?? {}
}

export async function getCurrentUser(req, res) {
  const session = driver.session()

  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `
          MATCH (user:User { id: $id })
          RETURN user
          LIMIT 1
        `,
        { id: req.user.id }
      )
    )

    if (result.records.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = getUserProperties(result.records[0].get('user'))

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } finally {
    await session.close()
  }
}

export async function listUsers(req, res) {
  const session = driver.session()

  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `
          MATCH (user:User)
          RETURN user
          ORDER BY user.createdAt DESC
        `
      )
    )

    return res.json({
      users: result.records.map((record) => {
        const user = getUserProperties(record.get('user'))

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        }
      }),
    })
  } finally {
    await session.close()
  }
}

export async function resetPassword(req, res) {
  const { userId, newPassword } = req.body || {}

  if (!userId || !newPassword) {
    return res.status(400).json({ message: 'userId and newPassword are required' })
  }

  const session = driver.session()

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10)

    const result = await session.executeWrite((tx) =>
      tx.run(
        `
          MATCH (user:User { id: $id })
          SET user.passwordHash = $passwordHash
          RETURN user
        `,
        { id: userId, passwordHash }
      )
    )

    if (result.records.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = getUserProperties(result.records[0].get('user'))

    return res.json({
      message: 'Password reset successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch {
    return res.status(500).json({ message: 'Failed to reset password' })
  } finally {
    await session.close()
  }
}

export async function deleteUser(req, res) {
  const session = driver.session()

  try {
    const result = await session.executeWrite((tx) =>
      tx.run(
        `
          MATCH (user:User { id: $id })
          WITH user
          DETACH DELETE user
          RETURN count(*) AS deletedCount
        `,
        { id: req.params.id }
      )
    )

    const deletedCountValue = result.records[0]?.get('deletedCount')
    const deletedCount = typeof deletedCountValue?.toNumber === 'function'
      ? deletedCountValue.toNumber()
      : Number(deletedCountValue || 0)

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.json({ message: 'User deleted successfully' })
  } finally {
    await session.close()
  }
}
