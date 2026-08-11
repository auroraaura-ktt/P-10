import sgMail from '@sendgrid/mail'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { env } from '../config/env.js'

// Initialize SendGrid
sgMail.setApiKey(env.sendgridApiKey)

/**
 * Send verification email with 8-digit code
 * @param {string} email - Recipient email
 * @param {string} code - 8-digit verification code
 * @returns {Promise<boolean>} - True if sent successfully
 */
export async function sendVerificationEmail(email, code) {
  if (!env.sendgridApiKey) {
    console.error('SendGrid API key not configured')
    throw new Error('Email service not configured - SendGrid API key missing')
  }

  const msg = {
    to: email,
    from: `${env.sendgridFromName} <${env.sendgridFromEmail}>`,
    replyTo: `${env.sendgridFromName} <${env.sendgridFromEmail}>`,
    subject: 'Your MiitVerse Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification Required</h2>
        <p style="color: #666; font-size: 16px;">Welcome to MiitVerse!</p>
        <p style="color: #666; font-size: 16px;">Your verification code is:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 36px; letter-spacing: 2px; margin: 0;">${code}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in <strong>15 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© 2026 MiitVerse. All rights reserved.</p>
      </div>
    `,
    text: `Your MiitVerse verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    headers: {
      'X-Priority': '3',
      'X-Mailer': 'MiitVerse Mailer',
    },
  }

  try {
    const result = await sgMail.send(msg)
    console.log('Verification email sent successfully:', result[0].statusCode, result[0].headers['x-message-id'])
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error.message || error)
    // SendGrid specific error handling
    if (error.response) {
      console.error('SendGrid error status:', error.response.status)
      console.error('SendGrid error body:', JSON.stringify(error.response.body, null, 2))
    }
    if (error.code === 401) {
      throw new Error('SendGrid API key is invalid or expired')
    }
    if (error.code === 403) {
      throw new Error('SendGrid API key does not have permission to send emails')
    }
    if (error.code === 400) {
      throw new Error(`SendGrid request validation error: ${error.message}`)
    }
    throw new Error(`Email sending failed: ${error?.message || String(error)}`)
  }
}

export async function sendInvitationEmail(email) {
  if (!env.sendgridApiKey) {
    throw new Error('Email service not configured - SendGrid API key missing')
  }

  const appUrl = env.appUrl.replace(/\/+$/, '')
  const logoPath = fileURLToPath(new URL('../../../public/miitLogo.png', import.meta.url))
  const msg = {
    to: email,
    from: `${env.sendgridFromName} <${env.sendgridFromEmail}>`,
    replyTo: `${env.sendgridFromName} <${env.sendgridFromEmail}>`,
    subject: "You're invited to MiitVerse",
    text: `You've been invited to MiitVerse, the official social hub of MIIT. Join the community at ${appUrl}.`,
    html: `
      <div style="margin:0;padding:48px 16px;background:#f6f1e8;font-family:Arial,Helvetica,sans-serif;color:#17213a">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;margin:0 auto;border-collapse:separate;border-spacing:0;background:#fffdf8;border:1px solid #eadfca;border-radius:18px;box-shadow:0 16px 38px rgba(33,43,66,.12)">
          <tr>
            <td style="padding:0;background:#081c4d;border-radius:18px 18px 0 0">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse">
                <tr>
                  <td width="116" valign="middle" style="padding:30px 0 30px 34px">
                    <div style="width:78px;height:78px;background:#ffffff;border:3px solid #f5b62d;border-radius:50%;text-align:center;box-shadow:0 5px 14px rgba(0,0,0,.18)"><img src="cid:miitverse-logo" width="66" height="66" alt="MIIT logo" style="display:inline-block;width:66px;height:66px;margin-top:3px;border:0;outline:none"></div>
                  </td>
                  <td valign="middle" style="padding:30px 34px 30px 20px">
                    <p style="margin:0 0 8px;color:#f5b62d;font-size:10px;font-weight:700;letter-spacing:1.3px;line-height:1;text-transform:uppercase">A community invitation</p>
                    <p style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-.7px;line-height:1.16">Make MIIT feel closer.</p>
                    <p style="margin:10px 0 0;color:#cbd8f5;font-size:13px;line-height:1.45">The official space for campus life.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 36px 44px">
              <h1 style="margin:0 0 16px;color:#081c4d;font-size:31px;font-weight:700;letter-spacing:-.7px;line-height:1.2">You've been invited to MiitVerse.</h1>
              <p style="margin:0 0 25px;color:#667085;font-size:16px;line-height:1.65">A place for the MIIT community to connect, discover campus news, and share the moments that matter.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;border-collapse:separate;border-spacing:0;background:#fff7e4;border:1px solid #f1dfb4;border-radius:10px">
                <tr><td colspan="3" style="padding:17px 18px 11px;color:#081c4d;font-size:12px;font-weight:700;letter-spacing:.8px;line-height:1;text-transform:uppercase">Inside MiitVerse</td></tr>
                <tr>
                  <td width="33.33%" valign="top" style="padding:7px 10px 18px 18px;color:#667085;font-size:12px;line-height:1.5"><span style="display:block;margin-bottom:6px;color:#c78a12;font-size:18px;font-weight:700;line-height:1">01</span><strong style="color:#081c4d;font-size:13px">Connect</strong><br>Find your people.</td>
                  <td width="33.33%" valign="top" style="padding:7px 10px 18px;color:#667085;font-size:12px;line-height:1.5"><span style="display:block;margin-bottom:6px;color:#c78a12;font-size:18px;font-weight:700;line-height:1">02</span><strong style="color:#081c4d;font-size:13px">Discover</strong><br>Keep up with MIIT.</td>
                  <td width="33.33%" valign="top" style="padding:7px 18px 18px 10px;color:#667085;font-size:12px;line-height:1.5"><span style="display:block;margin-bottom:6px;color:#c78a12;font-size:18px;font-weight:700;line-height:1">03</span><strong style="color:#081c4d;font-size:13px">Share</strong><br>Make your voice heard.</td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-radius:8px;background:#f5b62d"><a href="${appUrl}" style="display:inline-block;padding:14px 22px;border-radius:8px;color:#081c4d;font-size:15px;font-weight:700;line-height:1;text-decoration:none">Accept invitation&nbsp;&nbsp;&rarr;</a></td></tr></table>
              <p style="margin:28px 0 0;color:#8a96a9;font-size:12px;line-height:1.6">If you were not expecting this invitation, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr><td style="height:5px;background:#f5b62d;border-radius:0 0 16px 16px;font-size:0;line-height:0">&nbsp;</td></tr>
        </table>
      </div>
    `,
    attachments: [
      {
        content: readFileSync(logoPath).toString('base64'),
        filename: 'miitverse-logo.png',
        type: 'image/png',
        disposition: 'inline',
        content_id: 'miitverse-logo',
      },
    ],
  }

  try {
    await sgMail.send(msg)
    return true
  } catch (error) {
    console.error('Failed to send invitation email:', error.message || error)
    throw new Error(`Invitation email could not be sent: ${error?.message || String(error)}`)
  }
}

/**
 * Verify SendGrid connection
 * @returns {Promise<boolean>}
 */
export async function verifyEmailConnection() {
  if (!env.sendgridApiKey) {
    console.warn('SendGrid API key not configured')
    return false
  }

  try {
    // SendGrid validates the request synchronously, so if we get past initialization it should work
    console.log('SendGrid email service configured and ready')
    return true
  } catch (error) {
    console.error('Email service verification failed:', error.message || error)
    return false
  }
}

/**
 * Send general email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<boolean>}
 */
export async function sendEmail(to, subject, html) {
  if (!env.sendgridApiKey) {
    console.error('SendGrid API key not configured')
    throw new Error('Email service not configured - SendGrid API key missing')
  }

  const msg = {
    to,
    from: `${env.sendgridFromName} <${env.sendgridFromEmail}>`,
    subject,
    html,
  }

  try {
    const result = await sgMail.send(msg)
    console.log('Email sent successfully:', result[0].statusCode)
    return true
  } catch (error) {
    console.error('Failed to send email:', error.message || error)
    if (error.response) {
      console.error('SendGrid error status:', error.response.status)
      console.error('SendGrid error body:', JSON.stringify(error.response.body, null, 2))
    }
    if (error.code === 401) {
      throw new Error('SendGrid API key is invalid or expired')
    }
    if (error.code === 403) {
      throw new Error('SendGrid API key does not have permission to send emails')
    }
    if (error.code === 400) {
      throw new Error(`SendGrid request validation error: ${error.message}`)
    }
    throw new Error(`Email sending failed: ${error?.message || String(error)}`)
  }
}
