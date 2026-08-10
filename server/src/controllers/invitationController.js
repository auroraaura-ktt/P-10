import { sendInvitationEmail } from '../utils/emailService.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function sendInvitation(req, res) {
  const rawEmails = Array.isArray(req.body?.emails) ? req.body.emails.join(',') : String(req.body?.emails ?? req.body?.email ?? '')
  const emails = [...new Set(rawEmails.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean))]

  if (emails.length === 0 || emails.some((email) => !emailPattern.test(email))) {
    return res.status(400).json({ message: 'Enter one or more valid recipient email addresses.' })
  }
  if (emails.length > 50) {
    return res.status(400).json({ message: 'You can send invitations to at most 50 recipients at once.' })
  }

  const results = await Promise.allSettled(emails.map((email) => sendInvitationEmail(email)))
  const sent = emails.filter((_, index) => results[index].status === 'fulfilled')
  const failed = emails.filter((_, index) => results[index].status === 'rejected')

  if (failed.length > 0) {
    const firstFailure = results.find((result) => result.status === 'rejected')
    console.error('Invitation delivery failed:', firstFailure?.reason?.message)
    return res.status(sent.length > 0 ? 207 : 502).json({
      message: sent.length > 0
        ? `Sent ${sent.length} invitation${sent.length === 1 ? '' : 's'}; ${failed.length} could not be delivered.`
        : (firstFailure?.reason?.message || 'Invitation emails could not be sent.'),
      sent,
      failed,
    })
  }

  return res.status(200).json({ message: `Sent ${sent.length} invitation${sent.length === 1 ? '' : 's'} successfully.`, sent })
}
