import mongoose from 'mongoose'

const pendingRegistrationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    verificationCode: { type: String, required: true },
    verificationExpires: { type: Date, required: true, index: { expires: 0 } },
    lastSentAt: { type: Date, required: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
)

const PendingRegistrationModel = mongoose.models.PendingRegistration || mongoose.model('PendingRegistration', pendingRegistrationSchema)

function requireDatabase() {
  if (mongoose.connection.readyState !== 1) throw new Error('Database is unavailable. Registration was not saved.')
}

export async function getPendingRegistration(email) {
  requireDatabase()
  return PendingRegistrationModel.findOne({ email: String(email).toLowerCase() }).lean()
}

export async function hasPendingUsername(username, exceptEmail = '') {
  requireDatabase()
  return Boolean(await PendingRegistrationModel.exists({ username, email: { $ne: String(exceptEmail).toLowerCase() } }))
}

export async function savePendingRegistration(registration) {
  requireDatabase()
  return PendingRegistrationModel.findOneAndUpdate(
    { email: String(registration.email).toLowerCase() },
    { $set: registration },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean()
}

export async function deletePendingRegistration(email) {
  requireDatabase()
  await PendingRegistrationModel.deleteOne({ email: String(email).toLowerCase() })
}
