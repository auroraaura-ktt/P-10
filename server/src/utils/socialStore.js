import { randomUUID } from 'node:crypto'
import mongoose from 'mongoose'

const { Schema } = mongoose

const socialPostSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    content: { type: String, default: '' },
    image: { type: String, default: null },
    createdAt: { type: Date, default: Date.now, index: true },
    likes: { type: Number, default: 0 },
    likedBy: { type: [Schema.Types.Mixed], default: [] },
    comments: { type: [Schema.Types.Mixed], default: [] },
    reposts: { type: Number, default: 0 },
    visibility: { type: String, default: 'public' },
  },
  { timestamps: true, versionKey: false }
)

const socialFollowSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    following: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true, versionKey: false }
)

const socialAssetSchema = new Schema(
  {
    fileName: { type: String, required: true, unique: true, index: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true, versionKey: false }
)

const SocialPostModel = mongoose.models.SocialPost || mongoose.model('SocialPost', socialPostSchema)
const SocialFollowModel = mongoose.models.SocialFollow || mongoose.model('SocialFollow', socialFollowSchema)
const SocialAssetModel = mongoose.models.SocialAsset || mongoose.model('SocialAsset', socialAssetSchema)

function requireDatabase() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database is unavailable. The request was not saved.')
  }
}

function normalizePost(post = {}) {
  return {
    id: post.id || randomUUID(),
    userId: String(post.userId || 'guest'),
    username: post.username || 'MiitVerse member',
    content: post.content || '',
    image: post.image || null,
    createdAt: post.createdAt || new Date(),
    likes: Number(post.likes || 0),
    likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
    comments: Array.isArray(post.comments) ? post.comments : [],
    reposts: Number(post.reposts || 0),
    visibility: post.visibility || 'public',
  }
}

export function getVisiblePosts(posts = [], currentUserId = null, following = []) {
  const followingIds = new Set((following || []).map((entry) => entry?.id ?? entry))
  return (posts || []).filter((post) => {
    if (!post) return false
    if (post.visibility === 'public') return true
    if (!currentUserId) return false
    if (post.userId === currentUserId) return true
    return post.visibility === 'followers' && followingIds.has(post.userId)
  })
}

export function getPostReactionCount(post = {}) {
  const likes = Math.max(Number(post.likes || 0), Array.isArray(post.likedBy) ? post.likedBy.length : 0)
  const comments = Array.isArray(post.comments) ? post.comments.length : Number(post.comments || 0)
  return Math.max(0, likes + comments + Number(post.reposts ?? post.shares ?? 0))
}

export function isPagePost(post = {}, pagePostUserIds = []) {
  if (!post) return false
  if (post.source === 'page' || post.postType === 'page') return true
  const pageIds = pagePostUserIds instanceof Set ? pagePostUserIds : new Set(pagePostUserIds || [])
  return pageIds.has(post.userId) || pageIds.has(String(post.userId))
}

export function shuffleUserPostsByReactions(posts = [], random = Math.random) {
  return [...(posts || [])]
    .map((post, index) => ({
      post,
      index,
      priority: Math.max(Number.EPSILON, Math.min(1 - Number.EPSILON, random())) ** (1 / (Math.log1p(getPostReactionCount(post)) + 1)),
    }))
    .sort((left, right) => right.priority - left.priority || left.index - right.index)
    .map((entry) => entry.post)
}

export function applyUserPostWeightedShuffle(posts = [], options = {}) {
  const pagePostUserIds = options.pagePostUserIds || options.pageUserIds || []
  const userPosts = (posts || []).filter((post) => !isPagePost(post, pagePostUserIds))
  const shuffledUserPosts = shuffleUserPostsByReactions(userPosts, options.random || Math.random)
  let nextUserIndex = 0
  return (posts || []).map((post) => isPagePost(post, pagePostUserIds) ? post : shuffledUserPosts[nextUserIndex++])
}

export function toggleFollowRelationship(currentFollowing = [], targetUser = null) {
  if (!targetUser) return currentFollowing
  const targetId = targetUser.id ?? targetUser.userId ?? targetUser.username
  if (!targetId) return currentFollowing
  const exists = currentFollowing.some((entry) => (entry?.id ?? entry?.userId ?? entry?.username) === targetId)
  return exists
    ? currentFollowing.filter((entry) => (entry?.id ?? entry?.userId ?? entry?.username) !== targetId)
    : [...currentFollowing, { id: targetId, username: targetUser.username || 'User' }]
}

export async function listSocialPosts(currentUserId = null, following = [], options = {}) {
  requireDatabase()
  const posts = await SocialPostModel.find({}).sort({ createdAt: -1 }).lean()
  return applyUserPostWeightedShuffle(getVisiblePosts(posts, currentUserId, following), options)
}

export async function listAllSocialPosts() {
  requireDatabase()
  return SocialPostModel.find({}).sort({ createdAt: -1 }).lean()
}

export async function listSocialPostsByUserId(userId) {
  requireDatabase()
  return SocialPostModel.find({ userId: String(userId) }).sort({ createdAt: -1 }).lean()
}

export async function createSocialPost(post) {
  requireDatabase()
  return SocialPostModel.create(normalizePost(post)).then((document) => document.toObject())
}

export async function upsertSocialPost(post) {
  requireDatabase()
  const normalized = normalizePost(post)
  return SocialPostModel.findOneAndUpdate(
    { id: normalized.id },
    { $set: normalized },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean()
}

export async function deleteSocialPostById(postId) {
  requireDatabase()
  const result = await SocialPostModel.deleteOne({ id: String(postId) })
  return result.deletedCount > 0
}

export async function updateSocialPostById(postId, patch = {}) {
  requireDatabase()
  return SocialPostModel.findOneAndUpdate({ id: String(postId) }, { $set: patch }, { new: true }).lean()
}

export async function toggleSocialPostLike(postId, account) {
  requireDatabase()
  if (!account?.id) return null
  const post = await SocialPostModel.findOne({ id: String(postId) }).lean()
  if (!post) return null
  const likedBy = Array.isArray(post.likedBy) ? post.likedBy : []
  const existing = likedBy.some((entry) => String(entry?.userId) === String(account.id))
  const nextLikedBy = existing
    ? likedBy.filter((entry) => String(entry?.userId) !== String(account.id))
    : [...likedBy, { userId: String(account.id), username: account.username || 'MiitVerse member' }]
  const nextPost = await SocialPostModel.findOneAndUpdate(
    { id: String(postId) },
    { $set: { likedBy: nextLikedBy, likes: Math.max(0, Number(post.likes || 0) + (existing ? -1 : 1)) } },
    { new: true }
  ).lean()
  return { post: nextPost, reacted: !existing }
}

export async function getSocialFollows(userId) {
  requireDatabase()
  const record = await SocialFollowModel.findOne({ userId: String(userId) }).lean()
  return record?.following || []
}

export async function saveSocialFollows(userId, following) {
  requireDatabase()
  const record = await SocialFollowModel.findOneAndUpdate(
    { userId: String(userId) },
    { $set: { following: Array.isArray(following) ? following : [] } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean()
  return record.following
}

export async function saveSocialAsset({ fileName, contentType, data }) {
  requireDatabase()
  if (!Buffer.isBuffer(data) || data.length === 0) throw new Error('Upload data is required')
  if (data.length > 15 * 1024 * 1024) throw new Error('Uploads must be 15 MB or smaller')
  await SocialAssetModel.findOneAndUpdate(
    { fileName },
    { $set: { contentType: contentType || 'application/octet-stream', data } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
  return `/api/social/uploads/${encodeURIComponent(fileName)}`
}

export async function getSocialAsset(fileName) {
  requireDatabase()
  return SocialAssetModel.findOne({ fileName }).lean()
}
