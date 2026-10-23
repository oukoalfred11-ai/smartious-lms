/**
 * lib/studentPhoto.js — the student's photograph for the term report.
 *
 * Tries, in order: the profile photo (User.avatar: an R2 URL or a data
 * URL) and the passport-size photograph from the admission documents
 * (category 'photo', not rejected; private on R2). Only JPEG and PNG can go
 * into the PDF; anything else, or any failure, gives null and the report
 * shows the student's initials instead. Never throws.
 */
const isImage = (b) => !!b && b.length > 8 && ((b[0] === 0x89 && b[1] === 0x50) || (b[0] === 0xFF && b[1] === 0xD8))
const MAX = 6 * 1024 * 1024

async function fromUrl(url) {
  if (!url) return null
  try {
    if (url.startsWith('data:')) {
      const m = /^data:[^;]+;base64,(.*)$/.exec(url)
      const b = m ? Buffer.from(m[1], 'base64') : null
      return isImage(b) ? b : null
    }
    if (!/^https?:\/\//.test(url)) return null
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), 5000)
    const res = await fetch(url, { signal: ctl.signal }).finally(() => clearTimeout(t))
    if (!res.ok) return null
    const b = Buffer.from(await res.arrayBuffer())
    return b.length <= MAX && isImage(b) ? b : null
  } catch { return null }
}

async function fromAdmissionPhoto(studentId) {
  try {
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET_NAME || !process.env.R2_ACCESS_KEY_ID) return null
    const AdmissionDocument = require('../models/AdmissionDocument')
    const doc = await AdmissionDocument.findOne({ studentId, category: 'photo', status: { $ne: 'rejected' } })
      .sort({ status: -1, createdAt: -1 }).lean()            // 'verified' sorts before 'pending'
    const key = doc?.file?.key
    if (!key) return null
    const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
    })
    const out = await s3.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }))
    const b = Buffer.from(await out.Body.transformToByteArray())
    return b.length <= MAX && isImage(b) ? b : null
  } catch { return null }
}

async function studentPhoto(studentId, avatarUrl) {
  let url = avatarUrl
  if (!url && studentId) {
    try { url = (await require('../models/User').findById(studentId).select('avatar').lean())?.avatar || '' } catch { url = '' }
  }
  return (await fromUrl(url)) || (await fromAdmissionPhoto(studentId))
}

module.exports = { studentPhoto, isImage }
