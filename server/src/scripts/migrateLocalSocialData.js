import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { connectMongoDB, disconnectMongoDB } from '../config/mongodb.js'
import { saveSocialAsset, saveSocialFollows, upsertSocialPost } from '../utils/socialStore.js'

const serverRoot = resolve(import.meta.dirname, '..', '..')
const dataDir = resolve(serverRoot, 'data')

function readJson(fileName, fallback) {
  const path = resolve(dataDir, fileName)
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, 'utf8'))
}

function contentType(fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' })[extension] || 'application/octet-stream'
}

async function migrate() {
  const connection = await connectMongoDB()
  if (!connection) throw new Error('MongoDB is unavailable; no local data was migrated.')

  const posts = readJson('social-posts.json', [])
  const follows = readJson('social-follows.json', {})
  let postCount = 0
  let assetCount = 0

  for (const post of posts) {
    await upsertSocialPost(post)
    postCount += 1
  }

  for (const [userId, following] of Object.entries(follows)) {
    await saveSocialFollows(userId, following)
  }

  const uploadsDir = resolve(dataDir, 'uploads')
  if (existsSync(uploadsDir)) {
    for (const fileName of readdirSync(uploadsDir)) {
      await saveSocialAsset({ fileName, contentType: contentType(fileName), data: readFileSync(resolve(uploadsDir, fileName)) })
      assetCount += 1
    }
  }

  console.log(`Migrated ${postCount} post(s), ${Object.keys(follows).length} follow record(s), and ${assetCount} upload(s).`)
}

migrate()
  .catch((error) => { console.error('Migration failed:', error.message); process.exitCode = 1 })
  .finally(() => disconnectMongoDB())
