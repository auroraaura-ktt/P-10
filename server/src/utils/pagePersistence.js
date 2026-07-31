import mongoose from 'mongoose'

const pageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    pageName: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, default: 'page' },
    verified: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    ownerId: { type: String, default: '' },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    posts: [{ type: Object, default: [] }],
  },
  { timestamps: true }
)

export const PageModel = mongoose.models.Page || mongoose.model('Page', pageSchema)

export function normalizePageSlug(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createPageRecord(pageData = {}) {
  const pageName = String(pageData.pageName || '').trim()
  const email = String(pageData.email || '').trim().toLowerCase()
  const slug = normalizePageSlug(pageData.slug || pageName)

  if (!pageName || !email || !slug) {
    throw new Error('Page name, email, and slug are required')
  }

  const document = {
    id: pageData.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    pageName,
    slug,
    email,
    role: 'page',
    verified: true,
    ownerId: pageData.ownerId || '',
    description: pageData.description || '',
    coverImage: pageData.coverImage || '',
    posts: Array.isArray(pageData.posts) ? pageData.posts : [],
  }

  return PageModel.findOneAndUpdate(
    { email },
    { $setOnInsert: document, $set: { pageName, slug, description: document.description, coverImage: document.coverImage, role: 'page' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean()
}

export async function listPageRecords() {
  return PageModel.find({}).sort({ createdAt: -1 }).lean()
}

export async function getPageRecordBySlug(slug) {
  return PageModel.findOne({ slug: normalizePageSlug(slug) }).lean()
}
