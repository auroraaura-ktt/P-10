import bcrypt from 'bcryptjs'
import neo4j from 'neo4j-driver'
import { config as loadEnv } from 'dotenv'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function getUserProperties(node) {
  return node?.properties ?? node ?? {}
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const serverRoot = resolve(scriptDirectory, '..', '..')
const envPath = existsSync(resolve(serverRoot, '.env'))
  ? resolve(serverRoot, '.env')
  : resolve(serverRoot, '.env.example')

loadEnv({ path: envPath })

const args = process.argv.slice(2)

function readArg(name) {
  const prefix = `--${name}=`
  const value = args.find((entry) => entry.startsWith(prefix))
  return value ? value.slice(prefix.length) : ''
}

const email = readArg('email') || 'mgkyaw1904@gmail.com'
const username = readArg('username') || email.split('@')[0]
const password = readArg('password') || 'Admin123456'
const role = readArg('role') || 'admin'

if (!['admin', 'moderator', 'user'].includes(role)) {
  console.error('Role must be one of: user, moderator, admin')
  process.exit(1)
}

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
)

async function main() {
  const session = driver.session()

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = randomUUID()
    const createdAt = new Date().toISOString()

    const result = await session.executeWrite((tx) =>
      tx.run(
        `
          MERGE (user:User { email: $email })
          ON CREATE SET
            user.id = $id,
            user.username = $username,
            user.passwordHash = $passwordHash,
            user.role = $role,
            user.createdAt = $createdAt
          ON MATCH SET
            user.username = $username,
            user.passwordHash = $passwordHash,
            user.role = $role
          RETURN user
        `,
        {
          email,
          id: userId,
          username,
          passwordHash,
          role,
          createdAt,
        }
      )
    )

    const user = getUserProperties(result.records[0]?.get('user'))

    console.log(`Seeded user ${user?.email || email} as role ${role}`)
    console.log(`Username: ${user?.username || username}`)
    console.log(`Password: ${password}`)
  } catch (error) {
    console.error('Failed to seed user:', error.message)
    process.exit(1)
  } finally {
    await session.close()
    await driver.close()
  }
}

main()