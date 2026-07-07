import 'dotenv/config'

import app from './app.js'
import { closeNeo4j } from './config/neo4j.js'
import { ensureUserConstraints } from './config/neo4jInit.js'
import { env } from './config/env.js'
import { verifyEmailConnection } from './utils/emailService.js'

let server

async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`)

  if (server) {
    await new Promise((resolve) => server.close(resolve))
    console.log('HTTP server closed')
  }

  try {
    await closeNeo4j()
    console.log('Neo4j connection closed')
  } catch (err) {
    console.error('Error closing Neo4j:', err.message)
  }

  process.exit(0)
}

async function start() {
  try {
    if (!env.skipDb) {
      await ensureUserConstraints()
    } else {
      console.log('SKIP_DB=true — skipping Neo4j initialization')
    }

    // Verify email service is working
    console.log('Verifying email service...')
    const emailConnected = await verifyEmailConnection()
    if (emailConnected) {
      console.log('✓ Email service verified and ready')
    } else {
      console.warn('⚠ Email service may have issues - verification failed')
    }

    server = app.listen(env.port, () => {
      console.log(`✓ Server running on http://localhost:${env.port}`)
      console.log('✓ Ready to handle registrations and email verifications')
    })

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err)
    })

    process.on('uncaughtException', async (err) => {
      console.error('Uncaught Exception:', err)
      await shutdown('uncaughtException')
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)

    try {
      await closeNeo4j()
    } finally {
      process.exit(1)
    }
  }
}

start()