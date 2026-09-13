/**
 * notify.js - create in app notifications. Fire and forget: a failed
 * notification must never break the feature that raised it.
 *   notify(userId | [userIds], { title, body, module })
 */
const Notification = require('../models/Notification');

async function notify(userIds, { title, body = '', module = '' } = {}) {
  try {
    const ids = (Array.isArray(userIds) ? userIds : [userIds]).filter(Boolean);
    if (!ids.length || !title) return;
    await Notification.insertMany(ids.map(userId => ({ userId, title: String(title).slice(0, 120), body: String(body).slice(0, 400), module })), { ordered: false });
  } catch (e) { /* best effort */ }
}

module.exports = { notify };
