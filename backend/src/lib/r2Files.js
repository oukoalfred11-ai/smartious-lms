/**
 * lib/r2Files.js — private files in R2 (same env as the library, teacher
 * documents and careers): signed upload and download links, listing and
 * removal. Used by routes/partnerships.js.
 */
const READY = () => !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME)
let s3 = null
function client() {
  if (!s3) {
    const { S3Client } = require('@aws-sdk/client-s3')
    s3 = new S3Client({ region: 'auto', endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } })
  }
  return s3
}
const Bucket = () => process.env.R2_BUCKET_NAME
const sign = (cmd) => require('@aws-sdk/s3-request-presigner').getSignedUrl(client(), cmd, { expiresIn: 3600 })

// Signed by type, not length (as routes/teacher-documents.js), which R2 accepts from browsers.
async function signedPut(key, mimeType) {
  const { PutObjectCommand } = require('@aws-sdk/client-s3')
  return sign(new PutObjectCommand({ Bucket: Bucket(), Key: key, ContentType: mimeType }))
}
async function signedGet(key, filename) {
  if (!READY() || !key) return null
  const { GetObjectCommand } = require('@aws-sdk/client-s3')
  const disp = filename ? `inline; filename="${String(filename).replace(/[^\w.\- ]+/g, '_')}"` : undefined
  return sign(new GetObjectCommand({ Bucket: Bucket(), Key: key, ResponseContentDisposition: disp }))
}
/** Keys under `prefix` last modified more than `olderThanMs` ago. */
async function list(prefix, olderThanMs = 0) {
  if (!READY()) return []
  const { ListObjectsV2Command } = require('@aws-sdk/client-s3')
  const out = []
  let token
  do {
    const r = await client().send(new ListObjectsV2Command({ Bucket: Bucket(), Prefix: prefix, ContinuationToken: token }))
    for (const o of r.Contents || []) if (Date.now() - new Date(o.LastModified).getTime() > olderThanMs) out.push(o.Key)
    token = r.IsTruncated ? r.NextContinuationToken : null
  } while (token && out.length < 5000)
  return out
}
async function remove(keys = []) {
  if (!READY()) return
  const { DeleteObjectCommand } = require('@aws-sdk/client-s3')
  for (const Key of keys.filter(Boolean)) { try { await client().send(new DeleteObjectCommand({ Bucket: Bucket(), Key })) } catch { /* best effort */ } }
}

module.exports = { ready: READY, signedPut, signedGet, list, remove }
